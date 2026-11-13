import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import { distribute4LevelCommissions } from '@/lib/mlmEngine';
import { forwardOrderToWordPress } from '@/lib/dropshipService';
import { verifyStripeWebhookSignature, retrieveStripeSubscription } from '@/lib/stripe';
import { ALLOWED_SHIPPING_COUNTRY_CODE } from '@/lib/shipping';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!verifyStripeWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid Stripe webhook signature' }, { status: 400 });
    }

    await connectToDatabase();
    const event = JSON.parse(rawBody);

    // 1. Handle Checkout Session Completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderNumber = session?.metadata?.orderNumber;
      const referralCode = session?.metadata?.referralCode;
      const paymentIntentId = session?.payment_intent || null;

      let order = null;
      if (orderNumber) {
        order = await Order.findOne({ orderNumber });
      } else if (session.id) {
        order = await Order.findOne({ stripeSessionId: session.id });
      }

      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        order.stripePaymentIntentId = paymentIntentId;
        order.paymentLog = {
          provider: 'stripe',
          eventType: 'webhook.checkout.session.completed',
          status: session.payment_status || 'paid',
          transactionId: paymentIntentId || session.id,
          amount: Number(session.amount_total || order.total * 100) / 100,
          currency: session.currency || 'usd',
          rawResponse: JSON.stringify(
            {
              eventId: event.id,
              sessionId: session.id,
              paymentIntentId,
              payment_status: session.payment_status,
              amount_total: session.amount_total,
            },
            null,
            2
          ),
          loggedAt: new Date(),
        };
        await order.save();

        const code = referralCode || order.referralCode;
        if (code && !order.commissionsDistributed) {
          const commissionResult = await distribute4LevelCommissions(order, code);
          if (commissionResult.success) {
            order.commissionsDistributed = true;
            order.totalCommissionsPaid = commissionResult.totalPaid;
            await order.save();
          }
        }

        if (!order.dropshipping?.isForwarded) {
          await forwardOrderToWordPress(order);
        }
      }
    }

    // 2. Handle Recurring Monthly Subscription Invoice Paid
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
      const paymentIntentId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id;

      if (subscriptionId || customerId || invoice.customer_email) {
        const userQuery = [];
        if (subscriptionId) userQuery.push({ stripeSubscriptionId: subscriptionId });
        if (customerId) userQuery.push({ stripeCustomerId: customerId });
        if (invoice.customer_email) userQuery.push({ email: invoice.customer_email.toLowerCase() });

        const user = await User.findOne({ $or: userQuery }).lean();

        if (user) {
          let periodEndDate = new Date();
          periodEndDate.setMonth(periodEndDate.getMonth() + 1);
          if (subscriptionId) {
            try {
              const stripeSub = await retrieveStripeSubscription(subscriptionId);
              if (stripeSub?.current_period_end) {
                periodEndDate = new Date(stripeSub.current_period_end * 1000);
              }
            } catch {}
          }

          // Idempotency check: prevent duplicate renewal orders for same Stripe Invoice
          const existingInvoiceOrder = await Order.findOne({
            $or: [
              { stripeInvoiceId: invoice.id },
              ...(paymentIntentId ? [{ stripePaymentIntentId: paymentIntentId }] : []),
            ],
          });

          if (existingInvoiceOrder) {
            if (existingInvoiceOrder.paymentStatus !== 'paid') {
              existingInvoiceOrder.paymentStatus = 'paid';
              existingInvoiceOrder.status = 'processing';
              existingInvoiceOrder.stripeInvoiceId = invoice.id;
              await existingInvoiceOrder.save();

              const code = existingInvoiceOrder.referralCode || user.sponsorCode;
              if (code && !existingInvoiceOrder.commissionsDistributed) {
                const commRes = await distribute4LevelCommissions(existingInvoiceOrder, code);
                if (commRes.success) {
                  existingInvoiceOrder.commissionsDistributed = true;
                  existingInvoiceOrder.totalCommissionsPaid = commRes.totalPaid;
                  await existingInvoiceOrder.save();
                }
              }
              if (!existingInvoiceOrder.dropshipping?.isForwarded) {
                await forwardOrderToWordPress(existingInvoiceOrder);
              }
            } else if (!existingInvoiceOrder.stripeInvoiceId) {
              await Order.findByIdAndUpdate(existingInvoiceOrder._id, {
                $set: { stripeInvoiceId: invoice.id },
              });
            }
          } else if (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') {
            // Create new monthly renewal order automatically
            const renewalOrderNumber = 'REN-' + Math.floor(100000 + Math.random() * 900000);
            const amountPaid = Number(invoice.amount_paid || 6900) / 100;

            const renewalOrder = await Order.create({
              orderNumber: renewalOrderNumber,
              customer: {
                name: user.name,
                email: user.email,
                phone: user.shippingAddress?.phone || user.phone || '000-000-0000',
                address: {
                  street: user.shippingAddress?.street || 'On File',
                  city: user.shippingAddress?.city || 'On File',
                  state: user.shippingAddress?.state || '',
                  postalCode: user.shippingAddress?.postalCode || '00000',
                  country: ALLOWED_SHIPPING_COUNTRY_CODE,
                },
              },
              items: [
                {
                  name: 'Coffee Box (20 Pods) — Monthly Renewal',
                  price: amountPaid,
                  quantity: 1,
                  grind: 'Coffee Box (20 Pods)',
                  imageUrl: '/images/coffee-box-60-pods.png',
                  sku: '20PK',
                },
              ],
              subtotal: amountPaid,
              shippingFee: 0,
              total: amountPaid,
              referralCode: user.sponsorCode || null,
              paymentMethod: user.paymentMethodSummary?.last4
                ? `Stripe Auto-Renew (${user.paymentMethodSummary.brand || 'Card'} •••• ${user.paymentMethodSummary.last4})`
                : 'Stripe Auto-Renew',
              paymentStatus: 'paid',
              status: 'processing',
              stripePaymentIntentId: paymentIntentId || null,
              stripeInvoiceId: invoice.id,
              stripeSubscriptionId: subscriptionId || null,
              paymentLog: {
                provider: 'stripe',
                eventType: `webhook.${event.type}`,
                status: invoice.status || 'paid',
                transactionId: paymentIntentId || invoice.id,
                amount: amountPaid,
                currency: invoice.currency || 'usd',
                rawResponse: JSON.stringify(
                  {
                    eventId: event.id,
                    invoiceId: invoice.id,
                    subscriptionId,
                    billing_reason: invoice.billing_reason,
                    amount_paid: invoice.amount_paid,
                    status: invoice.status,
                  },
                  null,
                  2
                ),
                loggedAt: new Date(),
              },
            });

            if (user.sponsorCode) {
              const commResult = await distribute4LevelCommissions(renewalOrder, user.sponsorCode);
              if (commResult.success) {
                await Order.findByIdAndUpdate(renewalOrder._id, {
                  commissionsDistributed: true,
                  totalCommissionsPaid: commResult.totalPaid,
                });
              }
            }

            await forwardOrderToWordPress(renewalOrder);
          }

          await User.findByIdAndUpdate(
            user._id,
            {
              $set: {
                hasActiveSubscription: true,
                subscriptionStatus: 'active',
                subscriptionUpdatedAt: new Date(),
                subscriptionCurrentPeriodEnd: periodEndDate,
                ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
                ...(customerId ? { stripeCustomerId: customerId } : {}),
              },
            },
            { strict: false }
          );
        }
      }
    }

    // 3. Handle Subscription Payment Failed
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

      if (subscriptionId || customerId) {
        await User.findOneAndUpdate(
          {
            $or: [
              ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
          {
            $set: {
              hasActiveSubscription: false,
              subscriptionStatus: 'inactive',
              subscriptionUpdatedAt: new Date(),
            },
          },
          { strict: false }
        );
      }
    }

    // 4. Handle Subscription Cancelled / Deleted in Stripe
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const subscriptionId = subscription?.id;
      const customerId = typeof subscription?.customer === 'string' ? subscription.customer : subscription?.customer?.id;

      if (subscriptionId || customerId) {
        await User.findOneAndUpdate(
          {
            $or: [
              ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
              ...(customerId ? [{ stripeCustomerId: customerId }] : []),
            ],
          },
          {
            $set: {
              hasActiveSubscription: false,
              subscriptionStatus: 'cancelled',
              stripeSubscriptionId: '',
              subscriptionCurrentPeriodEnd: null,
              subscriptionUpdatedAt: new Date(),
            },
          },
          { strict: false }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 400 }
    );
  }
}
