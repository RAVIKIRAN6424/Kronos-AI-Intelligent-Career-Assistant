import { query, run } from '../config/database.js';

/**
 * Generate a 6-digit numeric OTP code
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Save OTP to database with 10-minute expiry
 */
export const saveOTP = async (email, code) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  await run(
    `INSERT INTO otp_codes (email, code, expires_at) VALUES (?, ?, ?)`,
    [email, code, expiresAt]
  );
  return { code, expiresAt };
};

/**
 * Verify OTP for given email
 */
export const verifyOTPCode = async (email, code) => {
  const rows = await query(
    `SELECT * FROM otp_codes WHERE email = ? AND code = ? AND expires_at > DATETIME('now') ORDER BY id DESC LIMIT 1`,
    [email, code]
  );

  if (rows && rows.length > 0) {
    // Delete used OTP
    await run(`DELETE FROM otp_codes WHERE email = ?`, [email]);
    return true;
  }
  return false;
};
