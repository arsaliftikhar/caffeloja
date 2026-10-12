import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import { isStripeConfigured, createStripeCheckoutSession } from '@/lib/stripe';
import { distribute4LevelCommissions } from '@/lib/mlmEngine';
import { forwardOrderToWordPress } from '@/lib/dropshipService';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { customer, items, subtotal, shippingFee, total, referralCode } = body;

    if (!customer?.name || !customer?.email || !customer?.phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide complete customer details and cart items' },
        { status: 400 }
      );
    }

    const orderNumber = 'CL-' + Math.floor(100000 + Math.random() * 900000);
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 1. If Stripe Secret Key is configured, generate real Stripe Checkout Session
    if (isStripeConfigured()) {
      // Create pending order
      const order = await Order.create({
        orderNumber,
        customer,
        items,
        subtotal: Number(subtotal) || 0,
        shippingFee: Number(shippingFee) || 0,
        total: Number(total) || 0,
        referralCode: referralCode ? referralCode.toUpperCase().trim() : null,
        paymentMethod: 'Stripe Checkout',
        paymentStatus: 'unpaid',
        status: 'pending',
      });

      const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`;
      const cancelUrl = `${origin}/checkout/cancel?order_id=${order._id}`;

      const session = await createStripeCheckoutSession({
        orderNumber,
        customer,
        items,
        total,
        referralCode,
        successUrl,
        cancelUrl,
      });

      // Update order with session ID
      await Order.findByIdAndUpdate(order._id, {
        stripeSessionId: session.id,
      });

      return NextResponse.json({
        success: true,
        type: 'stripe_redirect',
        checkoutUrl: session.url,
        sessionId: session.id,
        orderNumber: order.orderNumber,
        orderId: order._id,
      });
    }

    // 2. Test / Fallback Mode (when STRIPE_SECRET_KEY is awaiting live keys)
    // Create completed test order and run commission & dropship logic
    const order = await Order.create({
      orderNumber,
      customer,
      items,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      total: Number(total) || 0,
      referralCode: referralCode ? referralCode.toUpperCase().trim() : null,
      paymentMethod: 'Stripe (Test Mode / Direct)',
      paymentStatus: 'paid',
      status: 'processing',
    });

    // Run MLM Commission calculation
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

    // Forward to dropshipper
    const dropshipResult = await forwardOrderToWordPress(order);

    return NextResponse.json({
      success: true,
      type: 'direct_success',
      checkoutUrl: `/checkout/success?order_id=${order._id}&order_number=${order.orderNumber}&mode=simulated`,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
      message: 'Order created successfully! Add your STRIPE_SECRET_KEY to .env.local to activate hosted Stripe checkout page.',
      mlmCommission: commissionResult,
      dropshipping: dropshipResult,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
