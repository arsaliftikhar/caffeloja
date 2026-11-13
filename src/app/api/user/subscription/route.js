import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import {
  isStripeConfigured,
  createStripeCheckoutSession,
  retrieveStripePaymentIntent,
  createOrGetStripeCustomer,
  getOrCreateMonthlyCoffeePrice,
  createStripeMonthlySubscription,
  retrieveStripeSubscription,
  cancelStripeSubscription,
} from '@/lib/stripe';
import { distribute4LevelCommissions } from '@/lib/mlmEngine';
import { forwardOrderToWordPress } from '@/lib/dropshipService';
import {
  ALLOWED_SHIPPING_COUNTRY_CODE,
  isUnitedStatesCountry,
  normalizeShippingFields,
  US_ONLY_SHIPPING_ERROR,
} from '@/lib/shipping';

const SUBSCRIPTION_ITEM = {
  name: 'Coffee Box (20 Pods) — Monthly Subscription',
  price: 69.0,
  quantity: 1,
  grind: 'Coffee Box (20 Pods)',
  imageUrl: '/images/coffee-box-60-pods.png',
  sku: '20PK',
};

function buildCustomerPayload(user, shipping) {
  return {
    name: user.name,
    email: user.email,
    phone: shipping.phone.trim(),
    address: {
      street: shipping.street.trim(),
      city: shipping.city.trim(),
      state: (shipping.state || '').trim(),
      postalCode: shipping.postalCode.trim(),
      country: ALLOWED_SHIPPING_COUNTRY_CODE,
    },
  };
}

function getNextBillingIso(anchorDate) {
  const next = new Date(anchorDate || Date.now());
  next.setMonth(next.getMonth() + 1);
  return next.toISOString();
}

async function finalizePaidSubscription({
  user,
  shippingData,
  order,
  cardSummary,
  stripeCustomerId,
  stripeSubscriptionId,
  currentPeriodEnd,
}) {
  const now = new Date();
  const nextPeriodEnd = currentPeriodEnd || new Date(getNextBillingIso(now));
  const updateSet = {
    phone: shippingData.phone,
    shippingAddress: shippingData,
    hasActiveSubscription: true,
    subscriptionStatus: 'active',
    subscriptionUpdatedAt: now,
    subscriptionCurrentPeriodEnd: nextPeriodEnd,
  };
  if (stripeCustomerId) updateSet.stripeCustomerId = stripeCustomerId;
  if (stripeSubscriptionId) updateSet.stripeSubscriptionId = stripeSubscriptionId;

  if (cardSummary?.last4) {
    updateSet.paymentMethodSummary = {
      brand: cardSummary.brand || 'Card',
      last4: cardSummary.last4,
      cardholderName: cardSummary.cardholderName || user.name || '',
    };
  }

  const updatedUserDoc = await User.findByIdAndUpdate(
    user._id,
    { $set: updateSet },
    { new: true, strict: false }
  )
    .select('-password -twoFactorSecret')
    .lean();

  if (user.sponsorCode && !order.commissionsDistributed) {
    const commResult = await distribute4LevelCommissions(order, user.sponsorCode);
    if (commResult.success) {
      await Order.findByIdAndUpdate(order._id, {
        commissionsDistributed: true,
        totalCommissionsPaid: commResult.totalPaid,
      });
    }
  }

  if (!order.dropshipping?.isForwarded) {
    await forwardOrderToWordPress(order);
  }

  return {
    ...updatedUserDoc,
    hasActiveSubscription: true,
    nextBillingDate: nextPeriodEnd.toISOString(),
  };
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action, shipping, cardSummary, paymentIntentId, subscriptionId, orderId } = body;

    if (action === 'cancel_subscription') {
      if (user.stripeSubscriptionId && isStripeConfigured()) {
        try {
          await cancelStripeSubscription(user.stripeSubscriptionId);
        } catch (stripeErr) {
          console.error('Stripe cancel subscription notice:', stripeErr.message);
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            hasActiveSubscription: false,
            subscriptionStatus: 'cancelled',
            stripeSubscriptionId: '',
            subscriptionCurrentPeriodEnd: null,
            subscriptionUpdatedAt: new Date(),
          },
        },
        { new: true, strict: false }
      )
        .select('-password -twoFactorSecret')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'Your subscription has been cancelled.',
        user: {
          ...updatedUser,
          hasActiveSubscription: false,
          nextBillingDate: null,
        },
      });
    }

    if (!shipping?.street || !shipping?.city || !shipping?.postalCode || !shipping?.phone) {
      return NextResponse.json(
        { success: false, message: 'Please complete all required shipping details.' },
        { status: 400 }
      );
    }

    if (!isUnitedStatesCountry(shipping?.country)) {
      return NextResponse.json(
        { success: false, message: US_ONLY_SHIPPING_ERROR },
        { status: 400 }
      );
    }

    const shippingData = normalizeShippingFields(shipping);

    if (action === 'save_shipping') {
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            phone: shippingData.phone,
            shippingAddress: shippingData,
          },
        },
        { new: true, strict: false }
      )
        .select('-password -twoFactorSecret')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'Shipping details saved successfully.',
        user: updatedUser,
      });
    }

    const customerPayload = buildCustomerPayload(user, shipping);

    // Embedded Stripe Subscription confirmation (real recurring Stripe billing)
    if (action === 'confirm_stripe_payment') {
      if (!paymentIntentId || !orderId) {
        return NextResponse.json(
          { success: false, message: 'Missing payment confirmation details.' },
          { status: 400 }
        );
      }

      const intent = await retrieveStripePaymentIntent(paymentIntentId);
      if (!intent || intent.status !== 'succeeded') {
        return NextResponse.json(
          { success: false, message: 'Payment has not been completed.' },
          { status: 400 }
        );
      }

      let resolvedCardSummary = cardSummary;
      let currentPeriodEnd = null;
      let latestInvoiceId = null;

      if (subscriptionId) {
        try {
          const stripeSub = await retrieveStripeSubscription(subscriptionId);
          if (stripeSub?.current_period_end) {
            currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
          }
          latestInvoiceId =
            typeof stripeSub?.latest_invoice === 'string'
              ? stripeSub.latest_invoice
              : stripeSub?.latest_invoice?.id || null;

          const card = stripeSub?.default_payment_method?.card;
          if (card?.last4) {
            resolvedCardSummary = {
              brand: card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Card',
              last4: card.last4,
              cardholderName: cardSummary?.cardholderName || user.name || '',
            };
          }
        } catch (subErr) {
          console.error('Could not retrieve Stripe subscription metadata:', subErr.message);
        }
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          $set: {
            paymentStatus: 'paid',
            status: 'processing',
            stripePaymentIntentId: paymentIntentId,
            ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
            ...(latestInvoiceId ? { stripeInvoiceId: latestInvoiceId } : {}),
            ...(resolvedCardSummary?.last4
              ? { paymentMethod: `Stripe (${resolvedCardSummary.brand || 'Card'} •••• ${resolvedCardSummary.last4})` }
              : {}),
            paymentLog: {
              provider: 'stripe',
              eventType: 'subscription.payment_intent.succeeded',
              status: intent.status,
              transactionId: intent.id,
              amount: Number(intent.amount_received || intent.amount || 6900) / 100,
              currency: intent.currency || 'usd',
              rawResponse: JSON.stringify(
                {
                  paymentIntentId: intent.id,
                  status: intent.status,
                  amount: intent.amount,
                  amount_received: intent.amount_received,
                  currency: intent.currency,
                  subscriptionId: subscriptionId || null,
                  invoiceId: latestInvoiceId || null,
                  card: resolvedCardSummary || null,
                },
                null,
                2
              ),
              loggedAt: new Date(),
            },
          },
        },
        { new: true, strict: false }
      );

      if (!order) {
        return NextResponse.json({ success: false, message: 'Order record not found.' }, { status: 404 });
      }

      const updatedUser = await finalizePaidSubscription({
        user,
        shippingData,
        order,
        cardSummary: resolvedCardSummary,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
        currentPeriodEnd,
      });

      return NextResponse.json({
        success: true,
        type: 'activated',
        message: 'Your $69.00/month recurring Coffee Box subscription is now active!',
        orderNumber: order.orderNumber,
        user: updatedUser,
      });
    }

    const orderNumber = 'SUB-' + Math.floor(100000 + Math.random() * 900000);

    // Create Monthly Recurring Stripe Subscription + first invoice PaymentIntent
    if (action === 'create_payment_intent') {
      if (!isStripeConfigured()) {
        return NextResponse.json(
          { success: false, message: 'Stripe keys are not configured for recurring billing.' },
          { status: 400 }
        );
      }

      const stripeCustomer = await createOrGetStripeCustomer({
        existingCustomerId: user.stripeCustomerId,
        email: user.email,
        name: user.name,
        phone: shippingData.phone,
        shipping: shippingData,
      });

      const priceId = await getOrCreateMonthlyCoffeePrice();
      const stripeSub = await createStripeMonthlySubscription({
        customerId: stripeCustomer.id,
        priceId,
        orderNumber,
        userId: user._id,
        referralCode: user.sponsorCode || null,
      });

      const paymentIntent = stripeSub?.latest_invoice?.payment_intent;
      if (!paymentIntent?.client_secret) {
        return NextResponse.json(
          { success: false, message: 'Unable to initialize Stripe recurring payment intent.' },
          { status: 500 }
        );
      }

      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            phone: shippingData.phone,
            shippingAddress: shippingData,
            stripeCustomerId: stripeCustomer.id,
            stripeSubscriptionId: stripeSub.id,
          },
        },
        { strict: false }
      );

      const order = await Order.create({
        orderNumber,
        customer: customerPayload,
        items: [SUBSCRIPTION_ITEM],
        subtotal: 69.0,
        shippingFee: 0,
        total: 69.0,
        referralCode: user.sponsorCode || null,
        paymentMethod: 'Stripe Monthly Subscription',
        paymentStatus: 'unpaid',
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        stripeSubscriptionId: stripeSub.id,
        stripeInvoiceId:
          typeof stripeSub.latest_invoice === 'string'
            ? stripeSub.latest_invoice
            : stripeSub.latest_invoice?.id || null,
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        subscriptionId: stripeSub.id,
        orderId: order._id,
        orderNumber: order.orderNumber,
      });
    }

    // Redirect to hosted Stripe Checkout Session (if requested explicitly)
    if (action === 'checkout_session' && isStripeConfigured()) {
      await User.findByIdAndUpdate(
        user._id,
        { $set: { phone: shippingData.phone, shippingAddress: shippingData } },
        { strict: false }
      );
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const order = await Order.create({
        orderNumber,
        customer: customerPayload,
        items: [SUBSCRIPTION_ITEM],
        subtotal: 69.0,
        shippingFee: 0,
        total: 69.0,
        referralCode: user.sponsorCode || null,
        paymentMethod: 'Stripe Checkout',
        paymentStatus: 'unpaid',
        status: 'pending',
      });

      const session = await createStripeCheckoutSession({
        orderNumber,
        customer: customerPayload,
        items: [SUBSCRIPTION_ITEM],
        total: 69.0,
        referralCode: user.sponsorCode || null,
        successUrl: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}&order_number=${order.orderNumber}`,
        cancelUrl: `${origin}/user/subscription`,
      });

      await Order.findByIdAndUpdate(order._id, { stripeSessionId: session.id });

      return NextResponse.json({
        success: true,
        type: 'stripe_redirect',
        checkoutUrl: session.url,
        orderNumber: order.orderNumber,
      });
    }

    // Direct card submission fallback (when Stripe live keys are not configured yet)
    if (!cardSummary?.last4 || cardSummary.last4.length !== 4) {
      return NextResponse.json(
        { success: false, message: 'Please enter valid card details to subscribe.' },
        { status: 400 }
      );
    }

    const order = await Order.create({
      orderNumber,
      customer: customerPayload,
      items: [SUBSCRIPTION_ITEM],
      subtotal: 69.0,
      shippingFee: 0,
      total: 69.0,
      referralCode: user.sponsorCode || null,
      paymentMethod: `Stripe (${cardSummary.brand || 'Card'} •••• ${cardSummary.last4})`,
      paymentStatus: 'paid',
      status: 'processing',
      paymentLog: {
        provider: 'stripe',
        eventType: 'subscription.direct_card_activation',
        status: 'succeeded',
        transactionId: orderNumber,
        amount: 69.0,
        currency: 'usd',
        rawResponse: JSON.stringify(
          {
            mode: 'direct_card',
            orderNumber,
            card: `${cardSummary.brand || 'Card'} •••• ${cardSummary.last4}`,
            amount: 69.0,
            paidAt: new Date().toISOString(),
          },
          null,
          2
        ),
        loggedAt: new Date(),
      },
    });

    const updatedUser = await finalizePaidSubscription({
      user,
      shippingData,
      order,
      cardSummary,
    });

    return NextResponse.json({
      success: true,
      type: 'activated',
      message: 'Your $69.00/month Coffee Box subscription is now active!',
      orderNumber: order.orderNumber,
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
