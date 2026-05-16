const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendMail, generateOTP } = require('../config/mailer');

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = generateOTP();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.resetOTPVerified = false;
    await user.save();

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Peblo Notes — Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F7F4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #EEECEA;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#7C3AED,#9333EA);border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:white;letter-spacing:-0.02em;">Peblo Notes</p>
              <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">AI-powered note taking</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1C1C1E;letter-spacing:-0.02em;">Your verification code</p>
              <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
                Use this code to reset your password. It expires in <strong>10 minutes</strong>. Do not share this with anyone.
              </p>
              <div style="background:#F5F3FF;border:2px solid #C4B5FD;border-radius:14px;padding:24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#7C3AED;letter-spacing:0.1em;text-transform:uppercase;">One-time password</p>
                <p style="margin:0;font-size:48px;font-weight:800;color:#7C3AED;letter-spacing:0.15em;font-family:'Courier New',monospace;">${otp}</p>
              </div>
              <p style="margin:0 0 6px;font-size:13px;color:#9CA3AF;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 32px;border-top:1px solid #F1F0ED;">
              <p style="margin:0;font-size:12px;color:#C4C2BE;text-align:center;">© 2026 Peblo Notes · Built for Peblo's Developer Challenge</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    await sendMail({
      to: user.email,
      subject: "Your Peblo Notes verification code",
      html: emailHTML,
    });

    res.status(200).json({ message: "OTP sent to your email address" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.resetOTP) {
      return res.status(400).json({ message: "No OTP requested. Please try again." });
    }

    if (user.resetOTPExpiry < new Date()) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      user.resetOTPVerified = false;
      await user.save();
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    const hashedInput = crypto.createHash("sha256").update(otp).digest("hex");
    if (hashedInput !== user.resetOTP) {
      return res.status(400).json({ message: "Incorrect OTP. Please check and try again." });
    }

    user.resetOTPVerified = true;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    if (!user.resetOTPVerified) {
      return res.status(403).json({ message: "Please verify your OTP first." });
    }

    if (user.resetOTPExpiry < new Date()) {
      return res.status(400).json({ message: "Session expired. Please restart the process." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    user.password = hashed;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.resetOTPVerified = false;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now sign in." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { signup, login, forgotPassword, verifyOTP, resetPassword };
