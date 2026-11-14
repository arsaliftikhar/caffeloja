import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import MLMSettings from '@/models/MLMSettings';
import { getMLMSettings } from '@/lib/mlmEngine';
import { sendEmail, isResendConfigured, getFromEmail } from '@/lib/emailService';

export async function GET() {
  try {
    await connectToDatabase();
    const settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' }).lean();
    return NextResponse.json({
      success: true,
      data: {
        ...(settings || {}),
        contactEmail: settings?.contactEmail || 'caffeloja77@gmail.com',
        supportPhone: settings?.supportPhone || '(+1) 504 327 9670',
        resendConfigured: isResendConfigured(),
        resendFromEmail: getFromEmail(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { action, levels, dropshipSettings, isMLMActive, minimumPayout, contactEmail, supportPhone } = body;

    let settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' });
    if (!settings) {
      settings = new MLMSettings({ settingKey: 'default_mlm_config' });
    }

    // Action: Test contact email delivery
    if (action === 'test_contact_email') {
      const current = await MLMSettings.findOne({ settingKey: 'default_mlm_config' }).lean();
      const targetEmail = (contactEmail || current?.contactEmail || 'caffeloja77@gmail.com').trim().toLowerCase();
      const sendRes = await sendEmail({
        to: targetEmail,
        subject: '[Caffeloja Test] Admin Contact Email Verification',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #120c08; color: #f5ebe1; padding: 30px; border-radius: 12px; border: 1px solid rgba(212,163,115,0.3); max-width: 540px; margin: 0 auto;">
            <h2 style="color: #d4a373; margin-top: 0;">Caffeloja Email Dispatch Test</h2>
            <p>This is a verification test sent from your <strong>Admin Settings Portal</strong>.</p>
            <p>Your contact form submissions at <code>/contact</code> will be routed to this email address (<strong>${targetEmail}</strong>).</p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;" />
            <p style="font-size: 13px; color: #a89a8c;">Timestamp: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}</p>
          </div>
        `,
        text: `Caffeloja Email Dispatch Test - Your contact form submissions will be routed to ${targetEmail}.`,
      });

      if (sendRes.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${targetEmail}!`,
          simulated: Boolean(sendRes.simulated),
        });
      } else {
        return NextResponse.json({
          success: false,
          message: sendRes.error || `Failed to deliver test email to ${targetEmail}`,
        }, { status: 400 });
      }
    }

    const updateFields = {};

    if (contactEmail !== undefined) {
      updateFields.contactEmail = String(contactEmail).trim().toLowerCase();
    }

    if (supportPhone !== undefined) {
      updateFields.supportPhone = String(supportPhone).trim();
    }

    if (levels && Array.isArray(levels)) {
      updateFields.levels = levels.map((l) => ({
        level: Number(l.level),
        amount: Number(l.amount ?? l.percentage ?? 6),
        percentage: Number(l.amount ?? l.percentage ?? 6),
        label: l.label || `Level ${l.level}`,
      }));
    }

    if (dropshipSettings && typeof dropshipSettings === 'object') {
      for (const [k, v] of Object.entries(dropshipSettings)) {
        updateFields[`dropshipSettings.${k}`] = v;
      }
    }

    if (typeof isMLMActive === 'boolean') {
      updateFields.isMLMActive = isMLMActive;
    }

    if (minimumPayout !== undefined) {
      updateFields.minimumPayout = Number(minimumPayout);
    }

    const updatedSettings = await MLMSettings.findOneAndUpdate(
      { settingKey: 'default_mlm_config' },
      { $set: updateFields },
      { new: true, upsert: true, strict: false }
    ).lean();

    return NextResponse.json({
      success: true,
      message: 'Admin settings saved successfully!',
      data: {
        ...updatedSettings,
        contactEmail: updatedSettings?.contactEmail || 'caffeloja77@gmail.com',
        supportPhone: updatedSettings?.supportPhone || '(+1) 504 327 9670',
        resendConfigured: isResendConfigured(),
        resendFromEmail: getFromEmail(),
      },
    });
  } catch (error) {
    console.error('Admin settings error:', error);
    return NextResponse.json({ success: false, message: error.message, error: error.message }, { status: 500 });
  }
}
