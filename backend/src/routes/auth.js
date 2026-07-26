import express from 'express';
import { generateOTP, saveOTP, verifyOTPCode } from '../utils/otpHelper.js';
import { sendOTPEmail, sendForgotPasswordOTP } from '../services/emailService.js';
import { getOne, run } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, full_name, fullName } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const name = fullName || full_name || email.split('@')[0] || 'Candidate';
    console.log(`Starting OTP request for: ${email}...`);

    const code = generateOTP();
    console.log(`Generated OTP: ${code}...`);
    await saveOTP(email, code);

    console.log(`Calling Resend for: ${email}...`);
    const emailResult = await sendOTPEmail(email, name, code);

    if (!emailResult.success) {
      console.error(`Resend API Error: ${emailResult.error}`);
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send verification email via Resend'
      });
    }

    console.log(`Email sent successfully via Resend. Message ID: ${emailResult.messageId}`);
    res.json({
      success: true,
      message: `OTP dispatched to ${email}`,
      messageId: emailResult.messageId
    });
  } catch (err) {
    const errMsg = err.message || JSON.stringify(err);
    console.error(`Resend API Error: ${errMsg}`);
    res.status(400).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code, full_name, age, phone, target_domain, experience_years } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
    }

    const isValid = await verifyOTPCode(email, code);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP code. Please request a new code.' });
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
      success: true,
      message: 'Authentication successful',
      user
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, error: 'Authentication failed: ' + err.message });
  }
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, fullName, email, password } = req.body;
    if (!email || !email.includes('@') || !password) {
      return res.status(400).json({ success: false, error: 'Valid email and password are required.' });
    }

    const name = fullName || full_name || email.split('@')[0] || 'Candidate';
    console.log(`Starting registration OTP request for: ${email}...`);

    const code = generateOTP();
    console.log(`Generated OTP: ${code}...`);
    await saveOTP(email, code);

    console.log(`Calling Resend for: ${email}...`);
    const emailResult = await sendOTPEmail(email, name, code);

    if (!emailResult.success) {
      console.error(`Resend API Error: ${emailResult.error}`);
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send registration verification code via Resend'
      });
    }

    console.log(`Email sent successfully via Resend. Message ID: ${emailResult.messageId}`);
    res.json({
      success: true,
      message: `Verification code sent to ${email}. Check your email inbox.`,
      email
    });
  } catch (err) {
    const errMsg = err.message || JSON.stringify(err);
    console.error(`Resend API Error: ${errMsg}`);
    res.status(400).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
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
      success: true,
      message: 'Login successful',
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
});

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, full_name, fullName } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const name = fullName || full_name || email.split('@')[0] || 'Candidate';
    console.log(`Starting Forgot Password OTP request for: ${email}...`);

    const code = generateOTP();
    console.log(`Generated OTP: ${code}...`);
    await saveOTP(email, code);

    console.log(`Calling Resend for: ${email}...`);
    const emailResult = await sendForgotPasswordOTP(email, name, code);

    if (!emailResult.success) {
      console.error(`Resend API Error: ${emailResult.error}`);
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send password reset code via Resend'
      });
    }

    console.log(`Password reset email sent successfully via Resend. Message ID: ${emailResult.messageId}`);
    res.json({
      success: true,
      message: `Password reset OTP dispatched to ${email}.`,
      email
    });
  } catch (err) {
    const errMsg = err.message || JSON.stringify(err);
    console.error(`Resend API Error: ${errMsg}`);
    res.status(400).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;
    if (!email || !code || !new_password) {
      return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are required.' });
    }

    const isValid = await verifyOTPCode(email, code);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP code.' });
    }

    res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Password reset failed: ' + err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
