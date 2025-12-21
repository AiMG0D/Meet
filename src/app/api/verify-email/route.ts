import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/db';
import EmailVerification from '@/models/EmailVerification';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { email, action, code } = body;

    if (!email) {
      return NextResponse.json({ error: 'E-post krävs' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();

    // Send verification code
    if (action === 'send') {
      const verificationCode = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Upsert - create or update verification record
      await EmailVerification.findOneAndUpdate(
        { email: emailLower },
        { 
          email: emailLower,
          code: verificationCode, 
          verified: false,
          expiresAt 
        },
        { upsert: true, new: true }
      );

      const from = process.env.SMTP_FROM || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `"Bokning" <${from}>`,
        replyTo: from,
        to: email,
        subject: 'Din verifieringskod - FusionIQX',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background-color: #000000; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px;">Verifieringskod</h1>
              <p style="margin: 0 0 30px 0; color: #888888; font-size: 16px;">Ange denna kod för att verifiera din e-post:</p>
              <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #ffffff; letter-spacing: 8px;">${verificationCode}</span>
              </div>
              <p style="margin: 0; color: #666666; font-size: 14px;">Koden gäller i 10 minuter.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      });

      console.log(`Verification code sent to ${emailLower}`);
      return NextResponse.json({ success: true, message: 'Verifieringskod skickad' });
    }

    // Verify code
    if (action === 'verify') {
      if (!code) {
        return NextResponse.json({ error: 'Kod krävs' }, { status: 400 });
      }

      const verification = await EmailVerification.findOne({ email: emailLower });

      if (!verification) {
        return NextResponse.json({ error: 'Ingen kod skickad till denna e-post' }, { status: 400 });
      }

      if (new Date() > verification.expiresAt) {
        await EmailVerification.deleteOne({ email: emailLower });
        return NextResponse.json({ error: 'Koden har gått ut' }, { status: 400 });
      }

      if (verification.code !== code) {
        return NextResponse.json({ error: 'Felaktig kod' }, { status: 400 });
      }

      // Mark as verified and extend expiry to 30 minutes for booking
      await EmailVerification.findOneAndUpdate(
        { email: emailLower },
        { 
          verified: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes to complete booking
        }
      );
      
      console.log(`Email verified: ${emailLower}`);
      return NextResponse.json({ success: true, verified: true });
    }

    return NextResponse.json({ error: 'Ogiltig åtgärd' }, { status: 400 });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Ett fel uppstod' }, { status: 500 });
  }
}
