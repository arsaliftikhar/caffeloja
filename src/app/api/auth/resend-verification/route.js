import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/emailService';

export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with that email address.' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'Your email address is already verified. You can log in directly.',
      });
    }

    // Generate fresh verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerificationToken: token,
        emailVerificationExpires: expires,
      },
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://caffeloja.com';
    const result = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token,
      origin,
    });

    if (!result.success && !result.simulated) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to dispatch verification email.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A new verification email has been sent! Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error.' },
      { status: 500 }
    );
  }
}

