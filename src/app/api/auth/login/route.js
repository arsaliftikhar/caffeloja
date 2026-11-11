import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import { verifyTotpCode } from '@/lib/totp';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, password, totpCode } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      if (!totpCode) {
        return NextResponse.json({
          success: false,
          requiresTwoFactor: true,
          message: 'Enter the 6-digit code from Google Authenticator.',
        });
      }
      const validCode = verifyTotpCode(user.twoFactorSecret, totpCode);
      if (!validCode) {
        return NextResponse.json(
          {
            success: false,
            requiresTwoFactor: true,
            message: 'Invalid Google Authenticator code. Please try again.',
          },
          { status: 401 }
        );
      }
    }

    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        sponsorCode: user.sponsorCode,
        role: user.role,
        walletBalance: user.walletBalance,
        totalEarnings: user.totalEarnings,
        totalSalesVolume: user.totalSalesVolume,
        rank: user.rank,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
