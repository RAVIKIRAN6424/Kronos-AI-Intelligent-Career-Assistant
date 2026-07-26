import express from 'express';
import { generateOTP, saveOTP, verifyOTPCode } from '../utils/otpHelper.js';
import { sendOTPEmail, sendForgotPasswordOTP, sendPasswordChangedEmail } from '../services/emailService.js';
import { getOne, run } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp & POST /api/auth/resend-otp - Request Account Registration & Resend OTP Code
 */
const handleSendOTP = async (req, res) => {
  try {
    const { email, full_name, fullName } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address.',
        message: 'Please enter a valid email address.'
      });
    }

    // 2. Duplicate Account Check: If user already exists, show clear message!
    const existingUser = await getOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [cleanEmail]);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please login instead.',
        message: 'An account with this email address already exists. Please login instead.'
      });
    }

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';

    // 3. Generate a NEW 6-digit OTP code and save to database (invalidates old OTPs)
    const code = generateOTP();
    await saveOTP(cleanEmail, code, 'registration');

    // 4. Send email via Resend SDK
    const emailResult = await sendOTPEmail(cleanEmail, name, code);

    res.json({
      success: true,
      message: 'Verification code sent successfully.',
      messageId: emailResult.messageId || 'resend-otp-id',
      devOtp: emailResult.otp || code
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    res.status(400).json({ success: false, error: errMsg });
  }
};

router.post('/send-otp', handleSendOTP);
router.post('/resend-otp', handleSendOTP);

/**
 * POST /api/auth/verify-otp - Verify Registration OTP & Complete Account Creation
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, code, full_name, password, age, phone, target_domain, experience_years } = req.body;
    const inputOtp = otp || code;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !inputOtp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
    }

    const isValid = await verifyOTPCode(cleanEmail, inputOtp);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP code. Please request a new code.' });
    }

    const name = full_name || cleanEmail.split('@')[0] || 'Candidate';
    let user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    if (!user) {
      const result = await run(`
        INSERT INTO users (email, full_name, password, age, phone, target_domain, experience_years)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        cleanEmail,
        name,
        password || '',
        age ? parseInt(age) : 26,
        phone || '+91 98765 43210',
        target_domain || 'Software',
        experience_years ? parseInt(experience_years) : 4
      ]);
      user = await getOne(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    } else {
      await run(`
        UPDATE users SET
          full_name = COALESCE(?, full_name),
          password = COALESCE(?, password),
          age = COALESCE(?, age),
          phone = COALESCE(?, phone),
          target_domain = COALESCE(?, target_domain),
          experience_years = COALESCE(?, experience_years)
        WHERE LOWER(email) = LOWER(?)
      `, [name, password, age, phone, target_domain, experience_years, cleanEmail]);
      user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    }

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
      message: 'Account verified successfully!',
      user
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ success: false, error: 'Authentication failed: ' + err.message });
  }
});

/**
 * POST /api/auth/register - Initiate Registration (Sends OTP)
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, fullName, email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !password) {
      return res.status(400).json({ success: false, error: 'Valid email and password are required.' });
    }

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';
    const code = generateOTP();
    await saveOTP(cleanEmail, code, 'registration');

    const emailResult = await sendOTPEmail(cleanEmail, name, code);

    if (!emailResult.success) {
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send verification code'
      });
    }

    res.json({
      success: true,
      message: 'Email sent successfully.',
      email: cleanEmail
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    res.status(400).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/auth/login - Password Authentication
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    let user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    if (user && user.password) {
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password. Please check your credentials.'
        });
      }
    } else if (!user) {
      const result = await run(`
        INSERT INTO users (email, full_name, password, age, phone, target_domain, experience_years)
        VALUES (?, ?, ?, 26, '+91 98765 43210', 'Software', 4)
      `, [cleanEmail, cleanEmail.split('@')[0], password]);
      user = await getOne(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    } else if (!user.password) {
      await run(`UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)`, [password, cleanEmail]);
      user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Login failed: ' + err.message });
  }
});

/**
 * POST /api/auth/forgot-password - Send Reset OTP
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, full_name, fullName } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';
    const code = generateOTP();
    await saveOTP(cleanEmail, code, 'forgot_password');

    const emailResult = await sendForgotPasswordOTP(cleanEmail, name, code);

    if (!emailResult.success) {
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send password reset code'
      });
    }

    res.json({
      success: true,
      message: 'Email sent successfully.',
      email: cleanEmail
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    res.status(400).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/auth/reset-password - Verify OTP & Set New Password (Sends Password Changed Confirmation)
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, code, new_password, password } = req.body;
    const inputOtp = otp || code;
    const newPass = new_password || password;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !inputOtp || !newPass) {
      return res.status(400).json({ success: false, error: 'Email, OTP code, and new password are required.' });
    }

    const isValid = await verifyOTPCode(cleanEmail, inputOtp);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid or expired OTP code. Please request a new code.' });
    }

    await run(`UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)`, [newPass, cleanEmail]);
    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    // Send Password Changed Confirmation Email
    await sendPasswordChangedEmail(cleanEmail, (user && user.full_name) || 'Candidate');

    res.json({
      success: true,
      message: 'Password updated successfully! Please log in with your new password.'
    });
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
