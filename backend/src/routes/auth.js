import express from 'express';
import { generateOTP, saveOTP, verifyOTPCode, getCleanEmail } from '../utils/otpHelper.js';
import { sendOTPEmail, sendForgotPasswordOTP, sendPasswordChangedEmail } from '../services/emailService.js';
import { getOne, run } from '../config/database.js';

const router = express.Router();

// Email format validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Helper to get clean lowercase trimmed email strictly as required:
 * const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
 */
const parseCleanEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

/**
 * 1. REGISTRATION OTP REQUEST / RESEND / REGISTER
 * POST /api/auth/send-otp
 * POST /api/auth/resend-otp
 * POST /api/auth/register
 */
const handleSendOTP = async (req, res) => {
  try {
    const { email, full_name, fullName } = req.body;
    const cleanEmail = parseCleanEmail(email);

    // 1. Validate email format
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // 2. Check duplicate email in database
    const existingUser = await getOne(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND (verified = 1 OR verified IS NULL)`,
      [cleanEmail]
    );

    if (existingUser && existingUser.verified !== 0) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email.'
      });
    }

    const name = fullName || full_name || cleanEmail.split('@')[0] || 'Candidate';

    // 3. Generate secure 6-digit OTP and save
    const code = generateOTP();
    await saveOTP(cleanEmail, code, 'registration');

    // 4. Send OTP email via Resend / Gmail SMTP fallback
    const emailResult = await sendOTPEmail(cleanEmail, name, code);

    if (!emailResult.success) {
      console.warn(`⚠️ Email Dispatch Notice: ${emailResult.error}`);
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your inbox and spam folder.',
      otpSent: emailResult.success
    });
  } catch (err) {
    const errMsg = err.message || err.toString();
    console.error('❌ Send OTP API Exception:', errMsg);
    return res.status(400).json({
      success: false,
      message: 'Failed to send verification code: ' + errMsg
    });
  }
};

router.post('/send-otp', handleSendOTP);
router.post('/resend-otp', handleSendOTP);
router.post('/register', handleSendOTP);

/**
 * 2. OTP VERIFICATION & ACCOUNT CREATION
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, code, full_name, password, age, phone, target_domain, experience_years } = req.body;
    const inputOtp = otp || code;
    const cleanEmail = parseCleanEmail(email);

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

    // Verify OTP code with granular error checking (Invalid, Expired, Already Used)
    const otpResult = await verifyOTPCode(cleanEmail, inputOtp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        error: otpResult.message,
        message: otpResult.message
      });
    }

    const name = full_name || cleanEmail.split('@')[0] || 'Candidate';
    let user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    if (!user) {
      const result = await run(`
        INSERT INTO users (email, full_name, password, age, phone, target_domain, experience_years, verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
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
          full_name = COALESCE(NULLIF(?, ''), full_name),
          password = COALESCE(NULLIF(?, ''), password),
          phone = COALESCE(NULLIF(?, ''), phone),
          verified = 1
        WHERE LOWER(email) = LOWER(?)
      `, [name || '', password || '', phone || '', cleanEmail]);
      user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    }

    // Sync candidate profile table
    await run(`
      UPDATE profile SET
        full_name = COALESCE(NULLIF(?, ''), full_name),
        email = ?,
        phone = COALESCE(NULLIF(?, ''), phone),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [name || '', cleanEmail, phone || '']);

    return res.json({
      success: true,
      message: 'Account created successfully!',
      user
    });
  } catch (err) {
    console.error('❌ Verify OTP API Exception:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Authentication failed: ' + err.message
    });
  }
});

/**
 * 3. LOGIN AUTHENTICATION
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = parseCleanEmail(email);

    // 1. Validate email format
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // 2. Validate password requirement
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.'
      });
    }

    // 3. Find user in database
    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.'
      });
    }

    // 4. Check verification status
    if (user.verified === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email.'
      });
    }

    // 5. Verify password
    if (user.password && user.password !== password) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password.'
      });
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      user
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Login failed: ' + err.message
    });
  }
});

/**
 * 4. FORGOT PASSWORD OTP REQUEST
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = parseCleanEmail(email);

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No account found with this email.'
      });
    }

    const name = user.full_name || cleanEmail.split('@')[0] || 'Candidate';
    const code = generateOTP();
    await saveOTP(cleanEmail, code, 'forgot_password');

    const emailResult = await sendForgotPasswordOTP(cleanEmail, name, code);

    return res.json({
      success: true,
      message: 'Reset email sent successfully. Please check your inbox and spam folder.',
      otpSent: emailResult.success
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to send password reset code: ' + err.message
    });
  }
});

/**
 * 5. RESET PASSWORD WITH OTP
 * POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, code, new_password, password } = req.body;
    const inputOtp = otp || code;
    const newPass = new_password || password;
    const cleanEmail = parseCleanEmail(email);

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

    const otpResult = await verifyOTPCode(cleanEmail, inputOtp);
    if (!otpResult.valid) {
      return res.status(400).json({
        success: false,
        error: otpResult.message,
        message: otpResult.message
      });
    }

    await run(`UPDATE users SET password = ?, verified = 1 WHERE LOWER(email) = LOWER(?)`, [newPass, cleanEmail]);
    const user = await getOne(`SELECT * FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

    await sendPasswordChangedEmail(cleanEmail, (user && user.full_name) || 'Candidate');

    return res.json({
      success: true,
      message: 'Password updated successfully! Please log in with your new password.'
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Password reset failed: ' + err.message
    });
  }
});

/**
 * 6. DELETE ACCOUNT
 * DELETE /api/auth/account
 * POST /api/auth/delete-account
 */
const handleDeleteAccount = async (req, res) => {
  try {
    const email = req.body?.email || req.query?.email;
    const cleanEmail = parseCleanEmail(email);

    if (cleanEmail) {
      await run(`DELETE FROM users WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
      await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    } else {
      await run(`DELETE FROM users`);
      await run(`DELETE FROM otp_codes`);
    }

    // Reset candidate profile table
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

    return res.json({
      success: true,
      message: 'Account deleted successfully. You can now create a new account.'
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Failed to delete account: ' + err.message
    });
  }
};

router.delete('/account', handleDeleteAccount);
router.post('/delete-account', handleDeleteAccount);

/**
 * 7. AUTH CHECK / CURRENT USER
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const user = await getOne(`SELECT * FROM users WHERE verified = 1 ORDER BY id DESC LIMIT 1`);
    return res.json({ user: user || null });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
