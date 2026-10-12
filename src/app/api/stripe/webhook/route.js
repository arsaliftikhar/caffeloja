import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import { distribute4LevelCommissions } from '@/lib/mlmEngine';
import { forwardOrderToWordPress } from '@/lib/dropshipService';

export async function POST(request) {
  try {
    await connectToDatabase();
    const event = await request.json();

    // Handle checkout.session.completed event from Stripe
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
        await order.save();

        // 1. Distribute 4-Level MLM Commissions
        const code = referralCode || order.referralCode;
        if (code && !order.commissionsDistributed) {
          const commissionResult = await distribute4LevelCommissions(order, code);
          if (commissionResult.success) {
            order.commissionsDistributed = true;
            order.totalCommissionsPaid = commissionResult.totalPaid;
            await order.save();
          }
        }

        // 2. Forward to WordPress Dropshipper
        if (!order.dropshipping?.isForwarded) {
          await forwardOrderToWordPress(order);
        }
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
