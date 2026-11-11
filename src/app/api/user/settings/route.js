import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { generateTotpSecret, buildOtpAuthUri, verifyTotpCode } from '@/lib/totp';

export async function POST(request) {
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
    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. Update Profile & Notification Preferences
    if (action === 'update_profile') {
      const { name, phone, notificationPreferences } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
      }

      const updateFields = {
        name: name.trim(),
        phone: (phone || '').trim(),
      };

      if (notificationPreferences && typeof notificationPreferences === 'object') {
        updateFields.notificationPreferences = {
          commissions: Boolean(notificationPreferences.commissions),
          shipping: Boolean(notificationPreferences.shipping),
          security: Boolean(notificationPreferences.security),
        };
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: updateFields },
        { new: true, strict: false }
      )
        .select('-password -twoFactorSecret')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'Account settings updated successfully.',
        user: updatedUser,
      });
    }

    // 2. Change Password
    if (action === 'change_password') {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: 'Please enter your current and new password.' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters.' },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect.' },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.findByIdAndUpdate(
        user._id,
        { $set: { password: hashedPassword } },
        { strict: false }
      );

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully.',
      });
    }

    // 3. Generate Google Authenticator (TOTP) Secret & QR URI
    if (action === 'setup_2fa') {
      const secret = generateTotpSecret(20);
      const otpauthUrl = buildOtpAuthUri({
        email: user.email,
        secret,
        issuer: 'Caffeloja',
      });
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUrl)}`;

      await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            twoFactorSecret: secret,
            twoFactorEnabled: false,
          },
        },
        { strict: false }
      );

      return NextResponse.json({
        success: true,
        secret,
        otpauthUrl,
        qrUrl,
      });
    }

    // 4. Verify & Enable Google Authenticator
    if (action === 'enable_2fa') {
      const { code } = body;
      if (!user.twoFactorSecret) {
        return NextResponse.json(
          { success: false, message: 'Please generate a QR setup key first.' },
          { status: 400 }
        );
      }

      const isValid = verifyTotpCode(user.twoFactorSecret, code);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid 6-digit authenticator code. Please check your app and try again.' },
          { status: 400 }
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $set: { twoFactorEnabled: true } },
        { new: true, strict: false }
      )
        .select('-password -twoFactorSecret')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'Google Authenticator 2FA enabled!',
        user: updatedUser,
      });
    }

    // 5. Disable Google Authenticator
    if (action === 'disable_2fa') {
      const { code, password } = body;

      if (code) {
        const isValid = verifyTotpCode(user.twoFactorSecret, code);
        if (!isValid) {
          return NextResponse.json(
            { success: false, message: 'Invalid 6-digit authenticator code.' },
            { status: 400 }
          );
        }
      } else if (password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return NextResponse.json(
            { success: false, message: 'Incorrect password.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, message: 'Enter your authenticator code or password to disable 2FA.' },
          { status: 400 }
        );
      }

      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
          $set: {
            twoFactorEnabled: false,
            twoFactorSecret: '',
          },
        },
        { new: true, strict: false }
      )
        .select('-password -twoFactorSecret')
        .lean();

      return NextResponse.json({
        success: true,
        message: 'Google Authenticator 2FA has been disabled.',
        user: updatedUser,
      });
    }

    return NextResponse.json({ success: false, message: 'Unsupported settings action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

