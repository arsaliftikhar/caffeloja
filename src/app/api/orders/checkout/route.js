import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/Order';
import { distribute4LevelCommissions } from '@/lib/mlmEngine';
import { forwardOrderToWordPress } from '@/lib/dropshipService';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { customer, items, subtotal, shippingFee, total, referralCode, paymentMethod } = body;

    if (!customer?.name || !customer?.email || !customer?.phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide full customer details and at least one item' },
        { status: 400 }
      );
    }

    const orderNumber = 'CL-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Create order in MongoDB
    const order = await Order.create({
      orderNumber,
      customer,
      items,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      total: Number(total) || 0,
      referralCode: referralCode ? referralCode.toUpperCase().trim() : null,
      paymentMethod: paymentMethod || 'Credit Card / MBWay',
      status: 'processing',
    });

    // 2. Trigger 4-Level MLM Commission Distribution
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

    // 3. Forward Order to WordPress Dropshipper (https://oldchicagocoffee.com)
    const dropshipResult = await forwardOrderToWordPress(order);

    return NextResponse.json({
      success: true,
      message: 'Coffee order placed successfully! Forwarded to dropshipper and MLM commissions calculated.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        referralCode: order.referralCode,
      },
      mlmCommission: commissionResult,
      dropshipping: dropshipResult,
    });
  } catch (error) {
    console.error('Order checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
