import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
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
    const user = await User.findById(decoded.userId).select('-password -twoFactorSecret').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeOrder = await Order.findOne({
      'customer.email': user.email?.toLowerCase(),
      paymentStatus: 'paid',
      status: { $ne: 'cancelled' },
      createdAt: { $gte: thirtyDaysAgo },
    })
      .sort({ createdAt: -1 })
      .select('createdAt')
      .lean();

    const hasNewerActiveOrder = Boolean(
      activeOrder &&
        (!user.subscriptionUpdatedAt ||
          new Date(activeOrder.createdAt) > new Date(user.subscriptionUpdatedAt))
    );

    const isSubActive =
      user.subscriptionStatus === 'cancelled'
        ? hasNewerActiveOrder
        : Boolean(
            user.hasActiveSubscription ||
              user.subscriptionStatus === 'active' ||
              activeOrder
          );

    const anchorDate = user.subscriptionUpdatedAt || activeOrder?.createdAt || null;
    let nextBillingDate = null;
    if (isSubActive) {
      if (user.subscriptionCurrentPeriodEnd) {
        nextBillingDate = new Date(user.subscriptionCurrentPeriodEnd).toISOString();
      } else {
        const base = anchorDate ? new Date(anchorDate) : new Date();
        const next = new Date(base);
        next.setMonth(next.getMonth() + 1);
        nextBillingDate = next.toISOString();
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        hasActiveSubscription: isSubActive,
        nextBillingDate,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
