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

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });
  return info;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendMail, generateOTP };
