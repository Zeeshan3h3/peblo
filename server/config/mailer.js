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
 * Create transporter with explicit SMTP settings.
 * Uses port 587 + STARTTLS which is more reliable on
 * cloud hosting (Render/Railway) than port 465 + SSL.
 */
function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.error('[mailer] EMAIL_USER or EMAIL_PASS not set — emails will fail');
    return null;
  }

  console.log('[mailer] Creating transporter for:', user);

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS on port 587
    auth: { user, pass },
    // Timeouts to prevent hanging on cloud hosts
    connectionTimeout: 15000,  // 15s to establish TCP connection
    greetingTimeout: 15000,    // 15s for SMTP greeting
    socketTimeout: 20000,      // 20s for socket inactivity
    // TLS options for cloud environments
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
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
    console.log('[mailer] ✅ SMTP connection verified — ready to send emails');
    return true;
  } catch (error) {
    console.error('[mailer] ❌ SMTP verification FAILED:', error.code, error.message);
    // Try to recreate with fresh credentials
    transporter = createTransporter();
    return false;
  }
}

/**
 * Send an email with full error logging and timeout protection.
 */
async function sendMail({ to, subject, html }) {
  if (!transporter) {
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
    console.log(`[mailer] ✅ Email sent — messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[mailer] ❌ sendMail FAILED:', error.code, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendMail, generateOTP, verifyConnection };
