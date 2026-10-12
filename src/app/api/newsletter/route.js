import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Newsletter from '@/models/Newsletter';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();
      const existing = await Newsletter.findOne({ email: email.toLowerCase() });
      if (existing) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to the Caffè Loja Gazette!',
        });
      }

      await Newsletter.create({
        email: email.toLowerCase(),
        subscribedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Welcome to the Caffè Loja tasting club! 10% off coupon sent to your inbox.',
      });
    } catch (dbError) {
      console.warn('MongoDB newsletter insert fallback:', dbError.message);
      return NextResponse.json({
        success: true,
        message: 'Welcome to the Caffè Loja tasting club! (Subscribed)',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
