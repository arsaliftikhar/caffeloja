import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    const requestingUser = await User.findById(decoded.userId).select('role').lean();
    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password -twoFactorSecret -emailVerificationToken')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    await connectToDatabase();
    const requestingUser = await User.findById(decoded.userId).select('role').lean();
    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role, isEmailVerified } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'userId is required' }, { status: 400 });
    }

    const updateFields = {};
    if (role && (role === 'admin' || role === 'member')) {
      updateFields.role = role;
    }
    if (typeof isEmailVerified === 'boolean') {
      updateFields.isEmailVerified = isEmailVerified;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
      .select('-password -twoFactorSecret')
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

