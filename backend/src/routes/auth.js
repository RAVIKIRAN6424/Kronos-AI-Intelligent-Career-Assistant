import express from 'express';
import { generateOTP, saveOTP, verifyOTPCode } from '../utils/otpHelper.js';
import { sendOTPEmail } from '../services/emailService.js';
import { getOne, run } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    const code = generateOTP();
    await saveOTP(email, code);

    const emailResult = await sendOTPEmail(email, code);

    res.json({
      message: `OTP dispatched to ${email}`,
      mode: emailResult.mode,
      // For developer/testing ease when SMTP is not configured:
      simulatedCode: emailResult.simulatedCode || code
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Failed to generate OTP: ' + err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code, full_name, age, phone, target_domain, experience_years } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and OTP code are required.' });
    }

    const isValid = await verifyOTPCode(email, code);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP code. Please request a new code.' });
    }

    // Check if user exists
    let user = await getOne(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!user) {
      // Create new user
      const result = await run(`
        INSERT INTO users (email, full_name, age, phone, target_domain, experience_years)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        email,
        full_name || email.split('@')[0],
        age ? parseInt(age) : 25,
        phone || '+91 98765 43210',
        target_domain || 'Software',
        experience_years ? parseInt(experience_years) : 3
      ]);
      user = await getOne(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    } else if (full_name || target_domain) {
      // Update existing user info
      await run(`
        UPDATE users SET
          full_name = COALESCE(?, full_name),
          age = COALESCE(?, age),
          phone = COALESCE(?, phone),
          target_domain = COALESCE(?, target_domain),
          experience_years = COALESCE(?, experience_years)
        WHERE email = ?
      `, [full_name, age, phone, target_domain, experience_years, email]);
      user = await getOne(`SELECT * FROM users WHERE email = ?`, [email]);
    }

    // Sync profile table with user email/name
    await run(`
      UPDATE profile SET
        full_name = COALESCE(?, full_name),
        email = ?,
        phone = COALESCE(?, phone),
        age = COALESCE(?, age),
        target_domain = COALESCE(?, target_domain),
        experience_years = COALESCE(?, experience_years)
      WHERE id = 1
    `, [user.full_name, user.email, user.phone, user.age, user.target_domain, user.experience_years]);

    res.json({
      message: 'Authentication successful',
      user
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Authentication failed: ' + err.message });
  }
});

/**
 * POST /api/auth/register - Step 2: Account Registration Request (Sends OTP to Email)
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, gender, age, email, phone, country, password } = req.body;
    if (!email || !email.includes('@') || !password) {
      return res.status(400).json({ error: 'Valid email and password are required.' });
    }

    const code = generateOTP();
    await saveOTP(email, code);
    await sendOTPEmail(email, code);

    res.json({
      message: `Verification code sent to ${email}. Check your email inbox.`,
      email
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to initiate registration: ' + err.message });
  }
});

/**
 * POST /api/auth/login - Step 3: Password Authentication
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    let user = await getOne(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      // Auto-create initial user account for demo ease
      const result = await run(`
        INSERT INTO users (email, full_name, age, phone, target_domain, experience_years)
        VALUES (?, ?, 26, '+91 98765 43210', 'Software', 4)
      `, [email, email.split('@')[0]]);
      user = await getOne(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    }

    res.json({
      message: 'Login successful',
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

/**
 * POST /api/auth/forgot-password - Send OTP for password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const code = generateOTP();
    await saveOTP(email, code);
    await sendOTPEmail(email, code);

    res.json({
      message: `Password reset OTP dispatched to ${email}.`,
      email
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset code: ' + err.message });
  }
});

/**
 * POST /api/auth/reset-password - Verify OTP & Create New Password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
    }

    const isValid = await verifyOTPCode(email, code);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP code.' });
    }

    res.json({ message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed: ' + err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const user = await getOne(`SELECT * FROM users ORDER BY id DESC LIMIT 1`);
    res.json({ user: user || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
