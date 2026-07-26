import { query, run } from '../config/database.js';

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
  const cleanEmail = (email || '').toLowerCase().trim();

  // Invalidate and delete any existing previous OTPs for this email
  await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);

  // Set 15-minute expiry timestamp in epoch milliseconds (bulletproof across timezones & SQLite)
  const nowMs = Date.now();
  const expiresMs = nowMs + 15 * 60 * 1000;
  const expiresAtStr = new Date(expiresMs).toISOString();

  await run(
    `INSERT INTO otp_codes (email, code, type, expires_at, expiry_time, is_verified, verified) VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [cleanEmail, code.toString().trim(), type, expiresAtStr, String(expiresMs)]
  );
  return { code, expiresAt: expiresAtStr };
};

/**
 * Verify OTP for given email
 */
export const verifyOTPCode = async (email, code) => {
  const cleanEmail = (email || '').toLowerCase().trim();
  const inputCode = (code || '').toString().trim();

  if (!cleanEmail || !inputCode) return false;

  const rows = await query(
    `SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ? ORDER BY id DESC LIMIT 1`,
    [cleanEmail, inputCode]
  );

  if (rows && rows.length > 0) {
    const record = rows[0];

    // Check expiry using expiry_time ms timestamp or created_at timestamp
    let isExpired = false;
    if (record.expiry_time && !isNaN(Number(record.expiry_time))) {
      isExpired = Date.now() > Number(record.expiry_time);
    } else if (record.expires_at) {
      const expMs = new Date(record.expires_at).getTime();
      if (!isNaN(expMs)) {
        isExpired = Date.now() > expMs;
      }
    }

    if (!isExpired) {
      // Mark verified & delete used OTP
      await run(`UPDATE otp_codes SET is_verified = 1, verified = 1 WHERE id = ?`, [record.id]);
      await run(`DELETE FROM otp_codes WHERE LOWER(email) = LOWER(?)`, [cleanEmail]);
      return true;
    }
  }

  return false;
};
