import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(request) {
  try {
    await connectToDatabase();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Please enter your email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with that email address.' },
        { status: 404 }
      );
    }

    const resetToken = signToken(
      {
        userId: user._id,
        email: user.email,
        purpose: 'password_reset',
      },
      '1h'
    );

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://caffeloja.com';
    const resetUrl = `${origin.replace(/\/+$/, '')}/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (mailErr) {
      console.error('Password reset email dispatch error:', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
      resetToken,
      resetUrl: `/reset-password?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

