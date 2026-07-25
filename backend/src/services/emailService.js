import nodemailer from 'nodemailer';
import { getOne, query } from '../config/database.js';

/**
 * Build Nodemailer Transporter from Database Settings
 */
const getTransporter = async () => {
  const settingsRows = await query(`SELECT key, value FROM settings WHERE key LIKE 'smtp_%'`);
  const settingsMap = {};
  settingsRows.forEach(row => {
    settingsMap[row.key] = row.value;
  });

  const host = settingsMap.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(settingsMap.smtp_port || process.env.SMTP_PORT || '587');
  const user = settingsMap.smtp_user || process.env.SMTP_USER;
  const pass = settingsMap.smtp_pass || process.env.SMTP_PASS;
  const from = settingsMap.smtp_from || `Kronos AI Outreach <${user || 'outreach@kronos-ai.io'}>`;

  if (user && pass && pass.trim().length > 0) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
    return { transporter, from };
  }

  return { transporter: null, from };
};

/**
 * Send OTP Verification Email
 */
export const sendOTPEmail = async (email, otpCode) => {
  const { transporter, from } = await getTransporter();

  const subject = `🔐 Kronos AI CRM - Your One-Time Passcode (OTP): ${otpCode}`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #090d16; color: #e2e8f0; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #00f2fe; margin: 0; font-size: 28px; letter-spacing: 2px;">⚡ KRONOS AI CRM</h1>
        <p style="color: #94a3b8; font-size: 14px;">Autonomous Job Search & Lead CRM Engine</p>
      </div>

      <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(0, 242, 254, 0.2); padding: 25px; border-radius: 8px; text-align: center;">
        <h2 style="color: #ffffff; margin-top: 0;">Email Verification Required</h2>
        <p style="color: #cbd5e1; font-size: 15px;">Use the 6-digit verification code below to authenticate your account and access Kronos AI CRM:</p>
        
        <div style="font-size: 38px; font-weight: bold; letter-spacing: 8px; color: #00f2fe; background: #020617; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #4facfe;">
          ${otpCode}
        </div>

        <p style="color: #64748b; font-size: 13px;">This OTP code expires in 10 minutes. If you did not request this, please ignore this message.</p>
      </div>

      <div style="text-align: center; margin-top: 25px; font-size: 12px; color: #475569;">
        © 2026 Kronos AI CRM System. All rights reserved.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({ from, to: email, subject, html });
      console.log(`✉️ Live OTP email dispatched to ${email}`);
      return { success: true, mode: 'SMTP' };
    } catch (err) {
      console.warn(`⚠️ SMTP error sending OTP, fallback to local log mode:`, err.message);
    }
  }

  console.log(`[SIMULATED DISPATCH] OTP Email to ${email} -> Code: ${otpCode}`);
  return { success: true, mode: 'Simulated', simulatedCode: otpCode };
};

/**
 * Send Cold Outreach Email to Recruiter & Log Outcome
 */
export const sendOutreachEmail = async ({ recipientEmail, subject, body, jobId = null, templateType = 'Technical' }) => {
  const { transporter, from } = await getTransporter();

  let sentStatus = 'sent';
  let sendMode = 'SMTP';

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to: recipientEmail,
        subject,
        text: body,
        html: `<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">${body.replace(/\n/g, '<br/>')}</div>`
      });
      console.log(`✉️ Live Cold Outreach Email dispatched to ${recipientEmail}`);
    } catch (err) {
      console.error(`❌ SMTP Outreach Email failed:`, err.message);
      sentStatus = 'failed';
    }
  } else {
    console.log(`[SIMULATED DISPATCH] Outreach Email to ${recipientEmail} | Subject: "${subject}"`);
    sendMode = 'Simulated';
  }

  // Update job recruiter status if jobId present
  if (jobId && sentStatus === 'sent') {
    const { run } = await import('../config/database.js');
    await run(`UPDATE jobs SET recruiter_status = 'Contacted', status = CASE WHEN status = 'Saved' THEN 'Applied' ELSE status END WHERE id = ?`, [jobId]);
  }

  return { success: sentStatus === 'sent', status: sentStatus, mode: sendMode };
};

/**
 * Validate SMTP Connection Test
 */
export const verifySMTPConnection = async () => {
  const { transporter } = await getTransporter();
  if (!transporter) {
    return { ok: false, message: 'SMTP credentials not configured in settings.' };
  }
  try {
    await transporter.verify();
    return { ok: true, message: 'SMTP Server connection verified successfully!' };
  } catch (err) {
    return { ok: false, message: `SMTP verification failed: ${err.message}` };
  }
};
