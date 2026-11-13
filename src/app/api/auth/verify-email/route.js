import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

async function handleVerification(email, token) {
  if (!email || !token) {
    return {
      status: 400,
      body: { success: false, message: 'Invalid verification link. Missing token or email.' },
    };
  }

  await connectToDatabase();
  const cleanEmail = email.toLowerCase().trim();
  const cleanToken = String(token).trim();

  const user = await User.findOne({ email: cleanEmail });
  if (!user) {
    return {
      status: 404,
      body: { success: false, message: 'No account found with this email address.' },
    };
  }

  if (user.isEmailVerified) {
    const sessionToken = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      isEmailVerified: true,
    });
    return {
      status: 200,
      body: {
        success: true,
        alreadyVerified: true,
        message: 'Your email is already verified. Welcome back!',
        token: sessionToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          role: user.role,
          isEmailVerified: true,
        },
      },
    };
  }

  if (!user.emailVerificationToken || user.emailVerificationToken !== cleanToken) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.',
      },
    };
  }

  if (user.emailVerificationExpires && new Date(user.emailVerificationExpires) < new Date()) {
    return {
      status: 400,
      body: {
        success: false,
        message: 'This verification link has expired. Please request a new one.',
      },
    };
  }

  // Mark user as verified
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    },
    { new: true }
  ).select('-password -twoFactorSecret');

  const sessionToken = signToken({
    userId: updatedUser._id,
    email: updatedUser.email,
    role: updatedUser.role,
    referralCode: updatedUser.referralCode,
    isEmailVerified: true,
  });

  return {
    status: 200,
    body: {
      success: true,
      message: 'Email address successfully verified! Your account is now active.',
      token: sessionToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        referralCode: updatedUser.referralCode,
        role: updatedUser.role,
        isEmailVerified: true,
      },
    },
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const result = await handleVerification(email, token);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during verification.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, token } = body;

    const result = await handleVerification(email, token);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Server error during verification.' },
      { status: 500 }
    );
  }
}

