import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import {
  isStripeConfigured,
  createStripePaymentIntent,
  retrieveStripePaymentIntent,
} from '@/lib/stripe';
import { distribute4LevelCommissions } from '@/lib/mlmEngine';
import { forwardOrderToWordPress } from '@/lib/dropshipService';
import {
  isUnitedStatesCountry,
  normalizeCustomerShipping,
  US_ONLY_SHIPPING_ERROR,
} from '@/lib/shipping';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, orderId, paymentIntentId, cardSummary } = body;

    // -------------------------------------------------------------
    // ACTION: CONFIRM ON-PAGE STRIPE PAYMENT
    // -------------------------------------------------------------
    if (action === 'confirm_payment') {
      if (!orderId) {
        return NextResponse.json(
          { success: false, message: 'Missing orderId for payment confirmation.' },
          { status: 400 }
        );
      }

      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, message: 'Order not found.' },
          { status: 404 }
        );
      }

      // If already paid, return success immediately
      if (order.paymentStatus === 'paid') {
        return NextResponse.json({
          success: true,
          orderId: order._id,
          orderNumber: order.orderNumber,
          message: 'Order already confirmed.',
        });
      }

      // Verify payment with Stripe if PaymentIntent was used
      if (paymentIntentId && isStripeConfigured()) {
        const intent = await retrieveStripePaymentIntent(paymentIntentId);
        if (!intent || intent.status !== 'succeeded') {
          return NextResponse.json(
            { success: false, message: 'Payment intent verification failed with Stripe.' },
            { status: 400 }
          );
        }

        order.stripePaymentIntentId = paymentIntentId;
        order.paymentLog = {
          provider: 'stripe',
          eventType: 'payment_intent.succeeded',
          status: 'succeeded',
          transactionId: paymentIntentId,
          amount: Number(order.total) || 0,
          currency: 'usd',
          rawResponse: JSON.stringify(
            {
              id: intent.id,
              status: intent.status,
              amount: intent.amount,
              currency: intent.currency,
              cardSummary,
            },
            null,
            2
          ),
          loggedAt: new Date(),
        };
      }

      order.paymentStatus = 'paid';
      order.status = 'processing';
      order.paymentMethod = 'Stripe (Credit / Debit Card)';
      await order.save();

      // Distribute 4-Level MLM Commissions
      let commissionResult = null;
      if (order.referralCode && !order.commissionsDistributed) {
        commissionResult = await distribute4LevelCommissions(order, order.referralCode);
        if (commissionResult.success) {
          order.commissionsDistributed = true;
          order.totalCommissionsPaid = commissionResult.totalPaid;
          await order.save();
        }
      }

      // Forward order to WooCommerce Dropshipper
      const dropshipResult = await forwardOrderToWordPress(order);

      return NextResponse.json({
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        dropshipping: dropshipResult,
        mlmCommission: commissionResult,
      });
    }

    // -------------------------------------------------------------
    // DEFAULT: INITIALIZE ON-PAGE PAYMENT (CREATE PAYMENT INTENT)
    // -------------------------------------------------------------
    const { customer, items, subtotal, shippingFee, total, referralCode } = body;

    if (!customer?.name || !customer?.email || !customer?.phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide complete customer details and cart items' },
        { status: 400 }
      );
    }

    if (!isUnitedStatesCountry(customer?.address?.country)) {
      return NextResponse.json(
        { success: false, message: US_ONLY_SHIPPING_ERROR },
        { status: 400 }
      );
    }

    const normalizedCustomer = normalizeCustomerShipping(customer);
    const orderNumber = 'CL-' + Math.floor(100000 + Math.random() * 900000);

    // 1. If Stripe is configured: Create Pending Order + Stripe PaymentIntent for On-Page Card Entry
    if (isStripeConfigured()) {
      const order = await Order.create({
        orderNumber,
        customer: normalizedCustomer,
        items,
        subtotal: Number(subtotal) || 0,
        shippingFee: Number(shippingFee) || 0,
        total: Number(total) || 0,
        referralCode: referralCode ? referralCode.toUpperCase().trim() : null,
        paymentMethod: 'Stripe (Credit / Debit Card)',
        paymentStatus: 'unpaid',
        status: 'pending',
      });

      const paymentIntent = await createStripePaymentIntent({
        amount: total,
        customer: normalizedCustomer,
        orderNumber,
        referralCode,
        description: `Caffeloja Coffee Order (${orderNumber})`,
      });

      await Order.findByIdAndUpdate(order._id, {
        $set: {
          stripePaymentIntentId: paymentIntent.id,
          paymentLog: {
            provider: 'stripe',
            eventType: 'payment_intent.created',
            status: paymentIntent.status || 'requires_payment_method',
            transactionId: paymentIntent.id,
            amount: Number(total) || 0,
            currency: 'usd',
            loggedAt: new Date(),
          },
        },
      });

      return NextResponse.json({
        success: true,
        type: 'payment_intent',
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderNumber: order.orderNumber,
        orderId: order._id,
      });
    }

    // 2. Direct / Fallback Mode (when STRIPE_SECRET_KEY is not yet live)
    const order = await Order.create({
      orderNumber,
      customer: normalizedCustomer,
      items,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      total: Number(total) || 0,
      referralCode: referralCode ? referralCode.toUpperCase().trim() : null,
      paymentMethod: 'Stripe (Card Direct)',
      paymentStatus: 'paid',
      status: 'processing',
      paymentLog: {
        provider: 'stripe',
        eventType: 'direct_card_checkout',
        status: 'paid',
        transactionId: orderNumber,
        amount: Number(total) || 0,
        currency: 'usd',
        loggedAt: new Date(),
      },
    });

    let commissionResult = null;
    if (referralCode) {
      commissionResult = await distribute4LevelCommissions(order, referralCode);
      if (commissionResult.success) {
        await Order.findByIdAndUpdate(order._id, {
          commissionsDistributed: true,
          totalCommissionsPaid: commissionResult.totalPaid,
        });
      }
    }

    const dropshipResult = await forwardOrderToWordPress(order);

    return NextResponse.json({
      success: true,
      type: 'direct_success',
      orderNumber: order.orderNumber,
      orderId: order._id,
      dropshipping: dropshipResult,
      mlmCommission: commissionResult,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
