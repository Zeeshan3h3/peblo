/*
 * GMAIL SETUP FOR NODEMAILER:
 * 
 * 1. Go to your Google Account settings
 * 2. Search "App Passwords" in the search bar
 * 3. Select app: "Mail", device: "Other (Custom)"
 *    Type "Peblo Notes" as the device name
 * 4. Click Generate
 * 5. Copy the 16-character password shown
 * 6. Paste it as EMAIL_PASS in your .env file
 *    (NOT your regular Gmail password)
 * 
 * Note: 2-Factor Authentication must be enabled
 * on your Google account first.
 *
 * EMAIL_USER=youremail@gmail.com
 * EMAIL_PASS=xxxx xxxx xxxx xxxx (16-char app password)
 * EMAIL_FROM="Peblo Notes <youremail@gmail.com>"
 */

const nodemailer = require('nodemailer');

/**
 * Create transporter with explicit SMTP settings and timeouts.
 * Using direct SMTP config instead of `service: "gmail"` for
 * reliability on cloud hosting (Render/Railway/etc).
 */
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error('[mailer] EMAIL_USER or EMAIL_PASS not set — emails will fail');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL on port 465
    auth: { user, pass },
    // Timeouts prevent the request from hanging forever on cloud hosts
    connectionTimeout: 10000,  // 10s to establish connection
    greetingTimeout: 10000,    // 10s for SMTP greeting
    socketTimeout: 15000,      // 15s for socket inactivity
    // Connection pooling for reliability
    pool: true,
    maxConnections: 3,
    maxMessages: 10,
  });
}

let transporter = createTransporter();

/**
 * Verify SMTP connection on startup (non-blocking).
 * Logs the result so you can see it in Render logs.
 */
async function verifyConnection() {
  if (!transporter) {
    console.error('[mailer] No transporter — skipping verification');
    return false;
  }
  try {
    await transporter.verify();
    console.log('[mailer] SMTP connection verified — ready to send emails');
    return true;
  } catch (error) {
    console.error('[mailer] SMTP verification FAILED:', error.message);
    return false;
  }
}

/**
 * Send an email with full error logging and timeout protection.
 */
async function sendMail({ to, subject, html }) {
  if (!transporter) {
    // Try to recreate in case env vars were loaded late
    transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email service not configured — EMAIL_USER/EMAIL_PASS missing');
    }
  }

  console.log(`[mailer] Sending email to: ${to}, subject: "${subject}"`);

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `Peblo Notes <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[mailer] Email sent successfully — messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[mailer] sendMail FAILED:', error.code, error.message);
    // Re-throw with a clean message for the controller to catch
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendMail, generateOTP, verifyConnection };
