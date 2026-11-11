import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

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

    return NextResponse.json({
      success: true,
      message: 'Password reset link generated.',
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

