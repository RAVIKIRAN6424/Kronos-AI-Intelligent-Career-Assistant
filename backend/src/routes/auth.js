import express from 'express';
import { generateOTP, saveOTP, verifyOTPCode } from '../utils/otpHelper.js';
import { sendOTPEmail, sendForgotPasswordOTP } from '../services/emailService.js';
import { getOne, run } from '../config/database.js';

const router = express.Router();

/**
 * POST /api/auth/send-otp - Request Account Registration OTP Code
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, full_name, fullName } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';
    console.log(`Starting OTP request for: ${cleanEmail}...`);

    const code = generateOTP();
    console.log(`Generated OTP: ${code}...`);
    await saveOTP(cleanEmail, code);

    console.log(`Sending Gmail OTP to: ${cleanEmail}...`);
    const emailResult = await sendOTPEmail(cleanEmail, name, code);

    if (!emailResult.success) {
      console.error(`Gmail SMTP Error: ${emailResult.error}`);
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send verification code via Gmail'
      });
    }

    console.log(`Email Sent Successfully. Message ID: ${emailResult.messageId}`);
    res.json({
      success: true,
      message: `OTP dispatched to ${cleanEmail}`,
      messageId: emailResult.messageId
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    console.error(`Gmail SMTP Error: ${errMsg}`);
    res.status(400).json({ success: false, error: errMsg });
  }
});

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
      // Create new user account with password
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
      // Update existing user info and password
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

    // Sync profile table
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
 * POST /api/auth/register - Initiate Registration
 */
router.post('/register', async (req, res) => {
  try {
    const { full_name, fullName, email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !password) {
      return res.status(400).json({ success: false, error: 'Valid email and password are required.' });
    }

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';
    console.log(`Starting registration OTP request for: ${cleanEmail}...`);

    const code = generateOTP();
    console.log(`Generated OTP: ${code}...`);
    await saveOTP(cleanEmail, code);

    console.log(`Sending Gmail OTP to: ${cleanEmail}...`);
    const emailResult = await sendOTPEmail(cleanEmail, name, code);

    if (!emailResult.success) {
      console.error(`Gmail SMTP Error: ${emailResult.error}`);
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send registration verification code via Gmail'
      });
    }

    console.log(`Email Sent Successfully. Message ID: ${emailResult.messageId}`);
    res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Check your email inbox.`,
      email: cleanEmail
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    console.error(`Gmail SMTP Error: ${errMsg}`);
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
      // Validate stored password match
      if (user.password !== password) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password. Please check your credentials.'
        });
      }
    } else if (!user) {
      // Create user account if logging in for the first time
      const result = await run(`
        INSERT INTO users (email, full_name, password, age, phone, target_domain, experience_years)
        VALUES (?, ?, ?, 26, '+91 98765 43210', 'Software', 4)
      `, [cleanEmail, cleanEmail.split('@')[0], password]);
      user = await getOne(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    } else if (!user.password) {
      // Update password on first login
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
    console.log(`Starting Forgot Password OTP request for: ${cleanEmail}...`);

    const code = generateOTP();
    console.log(`Generated Password Reset OTP: ${code}...`);
    await saveOTP(cleanEmail, code);

    console.log(`Sending Gmail OTP to: ${cleanEmail}...`);
    const emailResult = await sendForgotPasswordOTP(cleanEmail, name, code);

    if (!emailResult.success) {
      console.error(`Gmail SMTP Error: ${emailResult.error}`);
      return res.status(400).json({
        success: false,
        error: emailResult.error || 'Failed to send password reset code via Gmail'
      });
    }

    console.log(`Password reset email sent successfully via Gmail. Message ID: ${emailResult.messageId}`);
    res.json({
      success: true,
      message: `Password reset OTP dispatched to ${cleanEmail}.`,
      email: cleanEmail
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    console.error(`Gmail SMTP Error: ${errMsg}`);
    res.status(400).json({ success: false, error: errMsg });
  }
});

/**
 * POST /api/auth/reset-password - Verify OTP & Set New Password
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

    // Update candidate password in database
    await run(`UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)`, [newPass, cleanEmail]);

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
