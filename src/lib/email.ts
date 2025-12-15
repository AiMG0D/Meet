import nodemailer from 'nodemailer';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmailWithLogo = async ({ to, subject, html }: EmailOptions) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  
  const logoPath = path.join(process.cwd(), 'public', 'Q3xP7cQPlarTot0Pr5iUE5n7Gyg (4).avif');
  
  await transporter.sendMail({
    from: `"Bokning" <${from}>`,
    replyTo: from,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'logo.avif',
        path: logoPath,
        cid: 'logo',
      },
    ],
  });
};

export const sendEmail = sendEmailWithLogo;

export const generateUserEmailHTML = (name: string, date: string, slot: string, zoomLink: string) => {
  return `
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px; background-color: #000000;">
              <img src="cid:logo" alt="Logo" width="140" style="display: block; height: auto;">
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; text-align: center; background-color: #000000;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Tack för din bokning!</h1>
              <p style="margin: 10px 0 0 0; color: #888888; font-size: 16px;">Hej ${name}, din tid är bekräftad.</p>
            </td>
          </tr>
          
          <!-- Booking Details -->
          <tr>
            <td style="padding: 30px 40px; background-color: #000000;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #222222;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Datum</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #222222;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Tid</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${slot}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Längd</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">1 timme</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Zoom Button -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center; background-color: #000000;">
              <a href="${zoomLink}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; padding: 16px 40px; border-radius: 8px;">Anslut till mötet</a>
              <p style="margin: 20px 0 0 0; color: #444444; font-size: 12px; word-break: break-all;">${zoomLink}</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #000000; border-top: 1px solid #111111;">
              <p style="margin: 0; color: #444444; font-size: 12px;">© ${new Date().getFullYear()} FusionIQX</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const generateAdminEmailHTML = (name: string, email: string, date: string, slot: string, zoomLink: string) => {
  return `
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
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 40px 40px 30px 40px; background-color: #000000;">
              <img src="cid:logo" alt="Logo" width="140" style="display: block; height: auto;">
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; text-align: center; background-color: #000000;">
              <div style="width: 50px; height: 50px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px auto; line-height: 50px; text-align: center;">
                <span style="color: #ffffff; font-size: 24px;">✓</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Ny Bokning Mottagen</h1>
            </td>
          </tr>
          
          <!-- Customer Info -->
          <tr>
            <td style="padding: 30px 40px; background-color: #000000;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #222222;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Kund</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #222222;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">E-post</p>
                    <p style="margin: 0;"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none; font-size: 16px;">${email}</a></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; border-bottom: 1px solid #222222;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Datum</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${date}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 5px 0; color: #666666; font-size: 12px; text-transform: uppercase;">Tid</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: bold;">${slot}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Zoom Link -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center; background-color: #000000;">
              <a href="${zoomLink}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; padding: 16px 40px; border-radius: 8px;">Öppna Zoom-möte</a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; background-color: #000000; border-top: 1px solid #111111;">
              <p style="margin: 0; color: #444444; font-size: 12px;">© ${new Date().getFullYear()} FusionIQX</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
