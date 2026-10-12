import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import Commission from '@/models/Commission';
import { forwardOrderToWordPress } from '@/lib/dropshipService';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(50).lean();
    const commissions = await Commission.find({}).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({
      success: true,
      orders,
      commissions,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, orderId } = body;

    if (action === 'retry_dropship' && orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
      }
      const result = await forwardOrderToWordPress(order);
      return NextResponse.json({
        success: true,
        message: 'Dropshipping order re-dispatched to WordPress!',
        result,
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
