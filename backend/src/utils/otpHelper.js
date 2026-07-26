import { query, run } from '../config/database.js';

/**
 * Generate a secure 6-digit numeric OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Invalidate old OTPs and save a NEW OTP to database with 5-minute expiry
 */
export const saveOTP = async (email, code, type = 'registration') => {
  const cleanEmail = (email || '').toLowerCase().trim();

  // Invalidate and delete any existing previous OTPs for this email
  await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

  // Set 5-minute expiry time
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  await run(
    `INSERT INTO otp_codes (email, code, type, expires_at, is_verified) VALUES (?, ?, ?, ?, 0)`,
    [cleanEmail, code.toString(), type, expiresAt]
  );
  return { code, expiresAt };
};

/**
 * Verify OTP for given email
 */
export const verifyOTPCode = async (email, code) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const inputCode = (code || '').toString().trim();

  const rows = await query(
    `SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ? AND is_verified = 0 AND expires_at > CURRENT_TIMESTAMP ORDER BY id DESC LIMIT 1`,
    [cleanEmail, inputCode]
  );

  if (rows && rows.length > 0) {
    // Mark verified and delete used OTP
    await run(`UPDATE otp_codes SET is_verified = 1 WHERE id = ?`, [rows[0].id]);
    await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
    return true;
  }
  return false;
};
