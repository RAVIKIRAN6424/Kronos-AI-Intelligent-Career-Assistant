import express from 'express';
import { generateOTP, saveOTP, verifyOTPCode } from '../utils/otpHelper.js';
import { sendOTPEmail, sendForgotPasswordOTP, sendPasswordChangedEmail } from '../services/emailService.js';
import { getOne, run } from '../config/database.js';

const router = express.Router();

// Email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shared Helper: Handle OTP Send logic for Registration
 */
const handleSendOTP = async (req, res) => {
  try {
    console.log('\n=========================================');
    console.log('OTP REQUEST RECEIVED');
    const { email, full_name, fullName } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Email Format Validation
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      console.log('❌ INVALID EMAIL FORMAT');
      console.log('=========================================\n');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }
    console.log(`EMAIL VALIDATED: ${cleanEmail}`);

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';

    // 3. Generate & Save NEW 6-digit OTP
    const code = generateOTP();
    console.log(`OTP GENERATED: ${code}`);
    await saveOTP(cleanEmail, code, 'registration');
    console.log('OTP SAVED');

    // 4. Send OTP to User Email via Resend SDK
    const emailResult = await sendOTPEmail(cleanEmail, name, code);

    if (!emailResult.success) {
      console.warn(`⚠️ Resend API Notice: ${emailResult.error}`);
      return res.status(200).json({
        success: true,
        message: 'Verification code generated. Please enter your 6-digit OTP code.',
        otpSent: false,
        notice: emailResult.error
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
      otpSent: true,
      messageId: emailResult.messageId
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    console.error('❌ SEND OTP EXCEPTION:', errMsg);
    console.log('=========================================\n');
    return res.status(500).json({
      success: false,
      message: errMsg
    });
  }
};

router.post('/send-otp', handleSendOTP);
router.post('/resend-otp', handleSendOTP);
router.post('/register', handleSendOTP);

/**
 * POST /api/auth/verify-otp - Verify Registration OTP & Create Verified User
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, code, full_name, password, age, phone, target_domain, experience_years } = req.body;
    const inputOtp = otp || code;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!inputOtp) {
      return res.status(400).json({
        success: false,
        message: 'OTP code is required.'
      });
    }

    const isValid = await verifyOTPCode(cleanEmail, inputOtp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code. Please check the 6-digit code sent to your email and try again.',
        message: 'Invalid or expired verification code. Please check the 6-digit code sent to your email and try again.'
      });
    }

    console.log(`OTP VERIFIED: ${cleanEmail}`);

    const name = full_name || cleanEmail.split('@')[0] || 'Candidate';
    let user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    if (!user) {
      const result = await run(`
        INSERT INTO users (email, full_name, password, age, phone, target_domain, experience_years, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        cleanEmail,
        name,
        password || '',
        age ? parseInt(age) : 26,
        phone || '',
        target_domain || 'Software',
        experience_years ? parseInt(experience_years) : 4
      ]);
      user = await getOne(`SELECT * FROM users WHERE id = ?`, [result.lastID]);
    } else {
      await run(`
        UPDATE users SET
          full_name = COALESCE(?, full_name),
          password = COALESCE(?, password),
          verified = 1
        WHERE LOWER(email) = LOWER(?)
      `, [name, password, cleanEmail]);
      user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    }

    res.json({
      success: true,
      message: 'Account verified successfully!',
      user
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({
      success: false,
      message: 'Authentication failed: ' + err.message
    });
  }
});

/**
 * POST /api/auth/login - Login Authentication
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.'
      });
    }

    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    if (user.password && user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    res.json({
      success: true,
      message: 'Login successful!',
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Login failed: ' + err.message
    });
  }
});

/**
 * POST /api/auth/forgot-password - Send Reset OTP
 */
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('\n=========================================');
    console.log('FORGOT PASSWORD REQUEST');
    const { email, full_name, fullName } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      console.log('❌ INVALID EMAIL FORMAT');
      console.log('=========================================\n');
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }
    console.log(`EMAIL VALIDATED: ${cleanEmail}`);

    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    if (!user) {
      console.log(`❌ USER NOT FOUND: ${cleanEmail}`);
      console.log('=========================================\n');
      return res.status(400).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const name = fullName || full_name || user.full_name || 'Candidate';
    const code = generateOTP();
    console.log(`OTP GENERATED: ${code}`);
    await saveOTP(cleanEmail, code, 'forgot_password');
    console.log('OTP SAVED');

    const emailResult = await sendForgotPasswordOTP(cleanEmail, name, code);

    if (!emailResult.success) {
      console.warn(`⚠️ Resend API Notice: ${emailResult.error}`);
      return res.status(200).json({
        success: true,
        message: 'Password reset code generated. Please enter your 6-digit OTP code.',
        otpSent: false,
        email: cleanEmail
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully.',
      otpSent: true,
      email: cleanEmail
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    console.error('❌ FORGOT PASSWORD EXCEPTION:', errMsg);
    console.log('=========================================\n');
    res.status(500).json({
      success: false,
      message: errMsg
    });
  }
});

/**
 * POST /api/auth/reset-password - Verify OTP & Update Password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, code, new_password, password } = req.body;
    const inputOtp = otp || code;
    const newPass = new_password || password;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    if (!inputOtp || !newPass) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP code, and new password are required.'
      });
    }

    const isValid = await verifyOTPCode(cleanEmail, inputOtp);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new code.'
      });
    }

    await run(`UPDATE users SET password = ? WHERE LOWER(email) = LOWER(?)`, [newPass, cleanEmail]);
    console.log(`PASSWORD UPDATED: ${cleanEmail}`);
    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    await sendPasswordChangedEmail(cleanEmail, (user && user.full_name) || 'Candidate');

    res.json({
      success: true,
      message: 'Password updated successfully! Please log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed: ' + err.message
    });
  }
});

/**
 * DELETE /api/auth/account - Delete candidate user account & reset profile
 */
const handleDeleteAccount = async (req, res) => {
  try {
    const email = req.body?.email || req.query?.email;
    const cleanEmail = email ? (email || '').toLowerCase().trim() : null;

    if (cleanEmail) {
      await run(`DELETE FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
      await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    } else {
      await run(`DELETE FROM users`);
      await run(`DELETE FROM otp_codes`);
    }

    // Reset profile table so new candidate can register cleanly
    await run(`
      UPDATE profile SET
        full_name = '',
        email = '',
        phone = '',
        resume_text = '',
        resume_summary = '',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    res.json({
      success: true,
      message: 'Account deleted successfully. You can now create a new account.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account: ' + err.message
    });
  }
};

router.delete('/account', handleDeleteAccount);
router.post('/delete-account', handleDeleteAccount);

export default router;
