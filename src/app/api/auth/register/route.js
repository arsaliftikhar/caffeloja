import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, password, phone, sponsorCode } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter your full name' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists. Please log in.' },
        { status: 409 }
      );
    }

    // Lookup sponsor if provided
    let sponsor = null;
    if (sponsorCode && sponsorCode.trim()) {
      const cleanSponsorCode = sponsorCode.trim().toUpperCase();
      sponsor = await User.findOne({ referralCode: cleanSponsorCode });
      if (!sponsor) {
        return NextResponse.json(
          {
            success: false,
            message: `Sponsor code "${cleanSponsorCode}" not found. Please verify the code or leave it blank.`,
          },
          { status: 400 }
        );
      }
    }

    // Generate unique referral code (e.g. LOJA-7824)
    let referralCode = 'LOJA-' + Math.floor(1000 + Math.random() * 9000);
    let attempts = 0;
    while (await User.findOne({ referralCode }) && attempts < 20) {
      referralCode = 'LOJA-' + Math.floor(1000 + Math.random() * 9000);
      attempts++;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      referralCode,
      sponsorCode: sponsor ? sponsor.referralCode : null,
      sponsorId: sponsor ? sponsor._id : null,
      role: 'member',
    });

    const token = signToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
      referralCode: newUser.referralCode,
    });

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        referralCode: newUser.referralCode,
        sponsorCode: newUser.sponsorCode,
        role: newUser.role,
        walletBalance: newUser.walletBalance,
        totalEarnings: newUser.totalEarnings,
        totalSalesVolume: newUser.totalSalesVolume,
        rank: newUser.rank,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
