import { query, run, getOne } from '../config/database.js';

/**
 * Safe email cleaning helper (User requirement: Never use `(email || "").toLowerCase()`)
 */
export const getCleanEmail = (email) => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

/**
 * Generate a secure 6-digit numeric OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Invalidate old OTPs and save a NEW OTP to database with 15-minute expiry
 */
export const saveOTP = async (email, code, type = 'registration') => {
  const cleanEmail = getCleanEmail(email);
  if (!cleanEmail) return null;

  // Invalidate and delete any existing previous OTPs for this email
  await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

  // Set 15-minute expiry timestamp in epoch milliseconds
  const nowMs = Date.now();
  const expiresMs = nowMs + 15 * 60 * 1000;
  const expiresAtStr = new Date(expiresMs).toISOString();

  await run(
    `INSERT INTO otp_codes (email, code, type, expires_at, expiry_time, is_verified, verified, created_at) VALUES (?, ?, ?, ?, ?, 0, 0, CURRENT_TIMESTAMP)`,
    [cleanEmail, code.toString().trim(), type, expiresAtStr, String(expiresMs)]
  );
  return { code, expiresAt: expiresAtStr };
};

/**
 * Verify OTP for given email with granular status reports:
 * - Invalid OTP
 * - OTP expired
 * - OTP already used
 * - Account created successfully / OTP verified
 */
export const verifyOTPCode = async (email, code) => {
  const cleanEmail = getCleanEmail(email);
  const inputCode = (code || '').toString().trim();

  if (!cleanEmail || !inputCode) {
    return {
      valid: false,
      status: 'INVALID_INPUT',
      message: 'Email address and 6-digit OTP code are required.'
    };
  }

  // Find latest record for email & code
  const rows = await query(
    `SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ? ORDER BY id DESC LIMIT 1`,
    [cleanEmail, inputCode]
  );

  if (!rows || rows.length === 0) {
    // Check if email has ANY OTP record to differentiate wrong code from missing email
    const anyEmailRecord = await getOne(
      `SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) ORDER BY id DESC LIMIT 1`,
      [cleanEmail]
    );

    if (anyEmailRecord && (anyEmailRecord.is_verified === 1 || anyEmailRecord.verified === 1)) {
      return {
        valid: false,
        status: 'ALREADY_USED',
        message: 'OTP code has already been used. Please request a new code.'
      };
    }

    return {
      valid: false,
      status: 'INVALID_OTP',
      message: 'Invalid OTP code. Please check your email code and try again.'
    };
  }

  const record = rows[0];

  // 1. Check if already used
  if (record.is_verified === 1 || record.verified === 1) {
    return {
      valid: false,
      status: 'ALREADY_USED',
      message: 'OTP code has already been used. Please request a new code.'
    };
  }

  // 2. Check if expired
  let isExpired = false;
  if (record.expiry_time && !isNaN(Number(record.expiry_time))) {
    isExpired = Date.now() > Number(record.expiry_time);
  } else if (record.expires_at) {
    const expMs = new Date(record.expires_at).getTime();
    if (!isNaN(expMs)) {
      isExpired = Date.now() > expMs;
    }
  }

  if (isExpired) {
    return {
      valid: false,
      status: 'EXPIRED_OTP',
      message: 'OTP code has expired. Please request a new code.'
    };
  }

  // Mark verified & delete used OTP
  await run(`UPDATE otp_codes SET is_verified = 1, verified = 1 WHERE id = ?`, [record.id]);
  await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

  return {
    valid: true,
    status: 'VERIFIED',
    message: 'OTP verified successfully!'
  };
};
