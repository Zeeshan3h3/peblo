/*
 * DUAL-MODE EMAIL SERVICE
 * 
 * LOCAL (Gmail SMTP):
 *   Set EMAIL_USER + EMAIL_PASS in .env
 *   Uses smtp.gmail.com — works on localhost (ports not blocked)
 * 
 * PRODUCTION (Resend HTTP API):
 *   Set RESEND_API_KEY in Render env vars
 *   Uses HTTPS — works on Render (SMTP ports blocked)
 * 
 * Priority: RESEND_API_KEY > EMAIL_USER/EMAIL_PASS
 * 
 * GMAIL SETUP:
 *   1. Enable 2FA on your Google account
 *   2. Go to myaccount.google.com/apppasswords
 *   3. Generate an App Password for "Peblo Notes"
 *   4. Set EMAIL_PASS to the 16-char password
 * 
 * RESEND SETUP:
 *   1. Sign up at https://resend.com (free — 100 emails/month)
 *   2. Create an API key
 *   3. Add RESEND_API_KEY=re_... to Render env vars
 */

const nodemailer = require('nodemailer');

let resendClient = null;
let smtpTransporter = null;
let mode = null; // 'resend' or 'smtp'

/**
 * Initialize the email provider based on available env vars.
 */
function init() {
  // Prefer Resend (works on cloud hosts where SMTP is blocked)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend');
      resendClient = new Resend(process.env.RESEND_API_KEY);
      mode = 'resend';
      console.log('[mailer] Using Resend (HTTP API)');
      return;
    } catch (e) {
      console.warn('[mailer] Resend package not installed, falling back to SMTP');
    }
  }

  // Fallback to Gmail SMTP (works on localhost)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    smtpTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      family: 4,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: { rejectUnauthorized: false },
    });
    mode = 'smtp';
    console.log('[mailer] Using Gmail SMTP for:', process.env.EMAIL_USER);
    return;
  }

  console.error('[mailer] No email provider configured! Set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS');
}

// Initialize on first load
init();

/**
 * Verify email service is ready.
 */
async function verifyConnection() {
  if (mode === 'resend') {
    console.log('[mailer] ✅ Resend API key configured');
    return true;
  }

  if (mode === 'smtp' && smtpTransporter) {
    try {
      await smtpTransporter.verify();
      console.log('[mailer] ✅ Gmail SMTP connection verified');
      return true;
    } catch (error) {
      console.error('[mailer] ❌ SMTP verification failed:', error.message);
      return false;
    }
  }

  console.error('[mailer] ❌ No email provider configured');
  return false;
}

/**
 * Send email using whichever provider is configured.
 */
async function sendMail({ to, subject, html }) {
  console.log(`[mailer] Sending email to: ${to}, subject: "${subject}" [mode: ${mode}]`);

  if (mode === 'resend' && resendClient) {
    return sendViaResend({ to, subject, html });
  }

  if (mode === 'smtp' && smtpTransporter) {
    return sendViaSMTP({ to, subject, html });
  }

  throw new Error('No email provider configured — set RESEND_API_KEY or EMAIL_USER/EMAIL_PASS');
}

async function sendViaResend({ to, subject, html }) {
  // Free tier: must use onboarding@resend.dev; custom domains require verification
  const resendFrom = process.env.RESEND_FROM || 'Peblo Notes <onboarding@resend.dev>';
  const { data, error } = await resendClient.emails.send({
    from: resendFrom,
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('[mailer] ❌ Resend error:', error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }

  console.log(`[mailer] ✅ Email sent via Resend — id: ${data.id}`);
  return data;
}

async function sendViaSMTP({ to, subject, html }) {
  try {
    const info = await smtpTransporter.sendMail({
      from: process.env.EMAIL_FROM || `Peblo Notes <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[mailer] ✅ Email sent via SMTP — messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[mailer] ❌ SMTP error:', error.code, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendMail, generateOTP, verifyConnection };
