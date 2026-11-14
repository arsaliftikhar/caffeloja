import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import mongoose from 'mongoose';
import MLMSettings from '@/models/MLMSettings';
import { sendEmail } from '@/lib/emailService';

// Simple Contact Message Schema
const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: 'General Inquiry' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'responded'], default: 'new' },
  },
  { timestamps: true }
);

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);

/**
 * Public GET: Returns configured contact email and phone
 */
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' }).lean();
    return NextResponse.json({
      success: true,
      contactEmail: settings?.contactEmail || 'caffeloja77@gmail.com',
      supportPhone: settings?.supportPhone || '(+1) 504 327 9670',
    });
  } catch {
    return NextResponse.json({
      success: true,
      contactEmail: 'caffeloja77@gmail.com',
      supportPhone: '(+1) 504 327 9670',
    });
  }
}

/**
 * POST: Handles contact form submissions, records in DB, and sends email to Admin & Customer
 */
export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // 1. Save submission to MongoDB
    const contactDoc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    });

    // 2. Fetch admin contact email from settings
    const settings = await MLMSettings.findOne({ settingKey: 'default_mlm_config' }).lean();
    const adminContactEmail =
      (settings?.contactEmail || settings?.dropshipSettings?.notifyAdminEmail || 'caffeloja77@gmail.com')
        .trim()
        .toLowerCase();

    // 3. Dispatch email notification to admin contact address
    const adminSubject = `[Caffeloja Contact] New Inquiry from ${name.trim()}: ${subject ? subject.trim() : 'General Inquiry'}`;
    const adminNotificationHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d0907; color: #f5ebe1; padding: 30px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #17100b; border: 1px solid rgba(197, 157, 95, 0.25); border-radius: 16px; padding: 28px 24px;">
          <tr>
            <td>
              <h2 style="color: #d4a373; font-family: Georgia, serif; margin-top: 0; margin-bottom: 6px;">New Contact Inquiry</h2>
              <p style="color: #a89a8c; font-size: 13px; margin: 0 0 20px;">Submitted from Caffeloja.com Contact Page</p>
              
              <table width="100%" cellpadding="8" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
                <tr>
                  <td width="100" style="color: #d4a373; font-weight: bold;">Customer:</td>
                  <td style="color: #fff;">${name}</td>
                </tr>
                <tr>
                  <td style="color: #d4a373; font-weight: bold;">Email:</td>
                  <td><a href="mailto:${email}" style="color: #f59e0b; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="color: #d4a373; font-weight: bold;">Phone:</td>
                  <td style="color: #fff;">${phone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="color: #d4a373; font-weight: bold;">Subject:</td>
                  <td style="color: #fff;">${subject || 'General Inquiry'}</td>
                </tr>
              </table>

              <div style="background: #110c08; border-left: 3px solid #d4a373; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                <p style="color: #e5d7ca; font-size: 14px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>

              <div style="text-align: center;">
                <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject || 'Caffeloja Inquiry')}" style="display: inline-block; background: #d4a373; color: #0d0907; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 14px;">
                  Reply Directly to ${name}
                </a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    try {
      await sendEmail({
        to: adminContactEmail,
        subject: adminSubject,
        html: adminNotificationHtml,
        text: `New Contact Inquiry from ${name} (${email}):\n\nSubject: ${subject || 'General Inquiry'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}`,
      });
    } catch (e) {
      console.error('[Contact Form] Failed to email admin:', e);
    }

    // 4. Send customer auto-reply acknowledgement
    const customerAckHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d0907; color: #f5ebe1; padding: 30px 15px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; margin: 0 auto; background: #17100b; border: 1px solid rgba(197, 157, 95, 0.25); border-radius: 16px; padding: 32px 24px; text-align: center;">
          <tr>
            <td>
              <h1 style="color: #d4a373; font-family: Georgia, serif; font-size: 24px; margin: 0 0 6px;">CAFFELOJA</h1>
              <p style="color: #a89a8c; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 24px;">Customer Care</p>
              
              <h2 style="font-size: 18px; color: #fff; margin-bottom: 12px;">We've Received Your Message</h2>
              <p style="color: #cfc1b4; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                Hi ${name}, thank you for reaching out to Caffeloja! Our support team has received your message regarding "<strong>${subject || 'General Inquiry'}</strong>" and is reviewing it. We will reply to your email address (<strong>${email}</strong>) as quickly as possible.
              </p>

              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; text-align: left; margin-bottom: 24px; font-size: 13px; color: #a89a8c;">
                <strong style="color: #d4a373; display: block; margin-bottom: 4px;">Your message:</strong>
                <p style="margin: 0; white-space: pre-wrap; color: #e5d7ca;">${message}</p>
              </div>

              <p style="font-size: 12px; color: #8c7e72; margin: 0;">
                Warm regards,<br />The Caffeloja Team
              </p>
            </td>
          </tr>
        </table>
      </div>
    `;

    try {
      await sendEmail({
        to: email.trim().toLowerCase(),
        subject: 'We have received your message - Caffeloja Customer Care',
        html: customerAckHtml,
        text: `Hi ${name},\n\nThank you for reaching out to Caffeloja! We have received your message regarding "${subject || 'General Inquiry'}" and will get back to you shortly.\n\nBest regards,\nThe Caffeloja Team`,
      });
    } catch (e) {
      console.error('[Contact Form] Failed to email customer confirmation:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting Caffeloja! Our team has received your message and will respond shortly.',
      data: {
        id: contactDoc._id,
        name: contactDoc.name,
        email: contactDoc.email,
        subject: contactDoc.subject,
      },
    });
  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to deliver message at this time. Please try again shortly or contact us directly.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
