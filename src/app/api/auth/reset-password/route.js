import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectToDatabase();
    const { token, email, password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    let user = null;

    if (token) {
      const decoded = verifyToken(token);
      if (!decoded || decoded.purpose !== 'password_reset') {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired reset link. Please request a new one.' },
          { status: 400 }
        );
      }
      user = await User.findById(decoded.userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Account not found.' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Your password has been updated successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

