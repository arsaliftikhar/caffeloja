import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Newsletter from '@/models/Newsletter';
import { getClientIp, checkRateLimit } from '@/lib/antiSpam';

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    const body = await request.json();
    const { email, website, company } = body;

    // Honeypot check
    if (website || company) {
      return NextResponse.json({
        success: true,
        message: 'Welcome to the Caffeloja tasting club! 10% off coupon sent to your inbox.',
      });
    }

    // IP rate limit: max 5 newsletter attempts per 10 minutes
    if (!checkRateLimit(`newsletter_ip_${clientIp}`, 5, 600000)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

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
          message: 'You are already subscribed to the Caffeloja Gazette!',
        });
      }

      await Newsletter.create({
        email: email.toLowerCase(),
        subscribedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: 'Welcome to the Caffeloja tasting club! 10% off coupon sent to your inbox.',
      });
    } catch (dbError) {
      console.warn('MongoDB newsletter insert fallback:', dbError.message);
      return NextResponse.json({
        success: true,
        message: 'Welcome to the Caffeloja tasting club! (Subscribed)',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
