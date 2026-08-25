const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const { verifyConnection } = require('./config/mailer');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');

// ── Startup env var validation ──────────────────────────────
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const EMAIL_ENV = ['EMAIL_USER', 'EMAIL_PASS'];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`[startup] FATAL: ${key} is not set`);
    process.exit(1);
  }
});

EMAIL_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[startup] WARNING: ${key} is not set — password reset emails will fail`);
  }
});

// ── Database ────────────────────────────────────────────────
connectDB();

// ── Express app ─────────────────────────────────────────────
const app = express();

// CORS: allow Vercel frontend + localhost for dev
const allowedOrigins = [
  'https://peblo-notes.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Also allow any *.vercel.app preview deployments
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    console.warn(`[cors] Blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/notes', noteRoutes);

app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Diagnostic: test SMTP connection without sending email
app.get('/test-email', async (req, res) => {
  try {
    const result = await verifyConnection();
    res.json({
      smtp: result ? 'connected' : 'failed',
      emailUser: process.env.EMAIL_USER ? 'set' : 'MISSING',
      emailPass: process.env.EMAIL_PASS ? 'set' : 'MISSING',
      emailFrom: process.env.EMAIL_FROM ? 'set' : 'MISSING',
    });
  } catch (error) {
    res.status(500).json({ smtp: 'error', message: error.message });
  }
});

// ── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Verify SMTP connection (non-blocking, just logs the result)
  try {
    await verifyConnection();
  } catch (err) {
    console.error('[startup] SMTP verification error (non-fatal):', err.message);
  }
});
