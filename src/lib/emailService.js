/**
 * Resend.com Email Delivery Service for Caffeloja
 * Uses Resend REST API for reliable transactional email delivery (verification, password resets, notifications)
 */

export function isResendConfigured() {
  const key = process.env.RESEND_API_KEY || '';
  return Boolean(key && key.startsWith('re_') && !key.includes('your_') && key.length > 20);
}

export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || 'Caffeloja <onboarding@resend.dev>';
}

/**
 * Sends an email using the Resend.com REST API
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!isResendConfigured()) {
    console.warn(`[Resend DEV Fallback] RESEND_API_KEY not configured. Simulated sending to ${to}: "${subject}"`);
    return {
      success: true,
      simulated: true,
      message: 'Email simulated (add RESEND_API_KEY to .env.local to send live emails).',
    };
  }

  try {
    const payload = {
      from: getFromEmail(),
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(text ? { text } : {}),
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Resend Error]', data);
      return {
        success: false,
        error: data?.message || `Resend HTTP error ${res.status}`,
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('[Resend Network Error]', error);
    return {
      success: false,
      error: error.message || 'Failed to send email via Resend.',
    };
  }
}

/**
 * Sends a Caffeloja email verification link
 */
export async function sendVerificationEmail({ email, name, token, origin }) {
  const baseUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'https://caffeloja.com';
  const verifyUrl = `${baseUrl.replace(/\/+$/, '')}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

  const subject = 'Verify your Caffeloja account';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Caffeloja account</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0907; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5ebe1;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0907; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background: #17100b; border: 1px solid rgba(197, 157, 95, 0.25); border-radius: 18px; padding: 36px 30px; text-align: center;">
          <!-- Logo / Header -->
          <tr>
            <td>
              <h1 style="font-family: Georgia, serif; font-size: 26px; color: #d4a373; margin: 0 0 6px 0; letter-spacing: 1px;">
                CAFFELOJA
              </h1>
              <p style="font-size: 13px; color: #a89a8c; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 2px;">
                Artisan Coffee Roasters
              </p>
              <div style="height: 1px; background: rgba(197, 157, 95, 0.2); width: 80px; margin: 0 auto 26px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="text-align: left;">
              <h2 style="font-family: Georgia, serif; font-size: 20px; color: #f5ebe1; margin: 0 0 14px 0;">
                Welcome to Caffeloja, ${name || 'Coffee Lover'}!
              </h2>
              <p style="font-size: 15px; line-height: 1.6; color: #d1c4b7; margin: 0 0 20px 0;">
                Thank you for creating your account. Please click the button below to verify your email address and activate your account.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" target="_blank" style="background: linear-gradient(135deg, #d4a373 0%, #b8824f 100%); color: #0d0907; text-decoration: none; padding: 14px 34px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; letter-spacing: 0.5px;">
                  Verify Email Address
                </a>
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #8e7c6d; margin: 24px 0 10px 0;">
                Or copy and paste this link in your browser:
              </p>
              <p style="font-size: 12px; line-height: 1.5; color: #d4a373; word-break: break-all; margin: 0 0 24px 0;">
                <a href="${verifyUrl}" style="color: #d4a373; text-decoration: underline;">${verifyUrl}</a>
              </p>

              <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 26px 0;"></div>

              <p style="font-size: 12px; color: #8e7c6d; line-height: 1.5; margin: 0;">
                This link will expire in 24 hours. If you did not create a Caffeloja account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 560px; margin-top: 20px; text-align: center;">
          <tr>
            <td style="font-size: 12px; color: #6e5e52;">
              © ${new Date().getFullYear()} Caffeloja. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Welcome to Caffeloja, ${name || 'Coffee Lover'}!

Please verify your email address by visiting the following link:
${verifyUrl}

This link will expire in 24 hours.

If you did not sign up for Caffeloja, please disregard this email.
  `.trim();

  return await sendEmail({ to: email, subject, html, text });
}

/**
 * Sends a password reset link
 */
export async function sendPasswordResetEmail({ email, name, resetUrl }) {
  const subject = 'Reset your Caffeloja password';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Caffeloja password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0907; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5ebe1;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0907; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background: #17100b; border: 1px solid rgba(197, 157, 95, 0.25); border-radius: 18px; padding: 36px 30px; text-align: center;">
          <tr>
            <td>
              <h1 style="font-family: Georgia, serif; font-size: 26px; color: #d4a373; margin: 0 0 6px 0;">CAFFELOJA</h1>
              <p style="font-size: 13px; color: #a89a8c; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 2px;">Password Reset Request</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: left;">
              <p style="font-size: 15px; line-height: 1.6; color: #d1c4b7; margin: 0 0 20px 0;">
                Hello ${name || 'Member'},
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #d1c4b7; margin: 0 0 24px 0;">
                We received a request to reset your password. Click the button below to choose a new password:
              </p>
              <div style="text-align: center; margin: 26px 0;">
                <a href="${resetUrl}" target="_blank" style="background: linear-gradient(135deg, #d4a373 0%, #b8824f 100%); color: #0d0907; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p style="font-size: 12px; color: #8e7c6d; line-height: 1.5; margin: 20px 0 0 0;">
                This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Hello ${name || 'Member'},

Reset your Caffeloja password using the link below:
${resetUrl}

This link expires in 1 hour. If you did not request this, please ignore this email.
  `.trim();

  return await sendEmail({ to: email, subject, html, text });
}

