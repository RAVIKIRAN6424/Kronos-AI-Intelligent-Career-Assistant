import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { run } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/.env variables are loaded
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured.");
}

if (!RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not configured.");
}

const resend = new Resend(RESEND_API_KEY);

/**
 * Log email dispatch result into SQLite database email_logs table
 */
export async function logEmail(recipient, subject, templateType, status = 'success', failureReason = null) {
  try {
    await run(
      `INSERT INTO email_logs (recipient, subject, template_type, status, failure_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [recipient, subject, templateType, status, failureReason]
    );
  } catch (err) {
    console.warn('⚠️ Email log insert notice:', err.message);
  }
}

/**
 * Pure Resend SDK Email Dispatcher
 */
async function sendResendMail({ to, subject, html, attachments = [] }) {
  const cleanRecipient = (to || '').trim();
  const senderEmail = process.env.RESEND_FROM_EMAIL;

  if (!senderEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  if (senderEmail.toLowerCase().includes('onboarding@resend.dev')) {
    throw new Error("Invalid sender: onboarding@resend.dev is disallowed. Please configure a verified domain sender in RESEND_FROM_EMAIL.");
  }

  console.log('\n=========================================');
  console.log('RESEND EMAIL DISPATCH REQUEST');
  console.log(`Sender: ${senderEmail}`);
  console.log(`Recipient: ${cleanRecipient}`);
  console.log(`Subject: ${subject}`);

  try {
    const payload = {
      from: senderEmail,
      to: cleanRecipient,
      subject,
      html
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content
      }));
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      const errorMsg = error.message || JSON.stringify(error);
      console.error('❌ Resend API Error:', errorMsg);
      console.log('=========================================\n');

      const isResendTestingError = errorMsg.toLowerCase().includes('testing emails');

      return {
        success: false,
        error: errorMsg,
        isResendTestingError,
        rawError: error
      };
    }

    const messageId = data?.id || 'resend-message-id';
    console.log(`✅ Resend Message ID: ${messageId}`);
    console.log('=========================================\n');

    return {
      success: true,
      messageId
    };
  } catch (err) {
    const errorMsg = err.message || err.toString();
    console.error('❌ Resend Exception:', errorMsg);
    console.log('=========================================\n');

    const isResendTestingError = errorMsg.toLowerCase().includes('testing emails');

    return {
      success: false,
      error: errorMsg,
      isResendTestingError,
      rawError: err
    };
  }
}

/**
 * Reusable Cyberpunk HTML Template Generator
 */
function getEmailHTMLTemplate({ title, badge, userName, bodyContent, ctaButton }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #040814;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      background-color: #040814;
      padding: 30px 10px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #081020;
      border: 1px solid rgba(0, 242, 254, 0.3);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 242, 254, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #09162e 0%, #030a18 100%);
      padding: 30px 24px;
      text-align: center;
      border-bottom: 1px solid rgba(0, 242, 254, 0.2);
    }
    .logo-badge {
      display: inline-block;
      padding: 6px 14px;
      background: rgba(0, 242, 254, 0.12);
      border: 1px solid #00f2fe;
      border-radius: 20px;
      color: #00f2fe;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 24px;
      margin: 8px 0 0 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px 28px;
      line-height: 1.6;
      font-size: 15px;
      color: #cbd5e1;
    }
    .otp-box {
      background: rgba(0, 242, 254, 0.08);
      border: 2px dashed #00f2fe;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      color: #00f2fe;
      letter-spacing: 8px;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #00f2fe, #9d4edd);
      color: #040814;
      font-weight: 800;
      text-decoration: none;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 14px;
      letter-spacing: 0.5px;
    }
    .footer {
      background-color: #030712;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
    }
    th, td {
      padding: 10px 12px;
      font-size: 13px;
      border: 1px solid rgba(0, 242, 254, 0.15);
      text-align: left;
    }
    th {
      background: rgba(0, 242, 254, 0.12);
      color: #00f2fe;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo-badge">${badge || 'KRONOS AI CAREER ASSISTANT'}</div>
        <h1>${title}</h1>
      </div>
      <div class="content">
        <p style="font-weight: 700; color: #ffffff;">Hello ${userName || 'User'},</p>
        ${bodyContent}
        ${ctaButton ? `<div style="text-align: center;"><a href="${ctaButton.url}" class="btn">${ctaButton.text}</a></div>` : ''}
      </div>
      <div class="footer">
        <p>⚡ <strong>Kronos AI Intelligent Career Assistant</strong></p>
        <p>© 2026 Kronos AI Systems. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Registration OTP Email
 */
export async function sendOTPEmail(email, userNameOrOtp = 'User', otpCode = null) {
  let userName = userNameOrOtp;
  let otp = otpCode;

  if (!otpCode) {
    otp = userNameOrOtp;
    userName = email ? email.split('@')[0] : 'Candidate';
  }

  const subject = 'Verify your Kronos AI Account';
  const html = getEmailHTMLTemplate({
    title: 'Account Verification',
    badge: 'KRONOS AI ACCOUNT SETUP',
    userName,
    bodyContent: `
      <p>Welcome to <strong>Kronos AI Intelligent Career Assistant</strong>.</p>
      <p>Please enter the 6-digit verification code below to verify your account and launch your automation engine:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Expires in 5 minutes</div>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">If you did not request this verification code, please ignore this email.</p>
    `
  });

  const result = await sendResendMail({ to: email, subject, html });

  if (result.success) {
    await logEmail(email, subject, 'Registration OTP', 'success');
    return { success: true, message: 'OTP sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(email, subject, 'Registration OTP', 'failed', result.error);
    return {
      success: false,
      error: result.error,
      isResendTestingError: result.isResendTestingError,
      otp
    };
  }
}

/**
 * 2. Forgot Password OTP Email
 */
export async function sendForgotPasswordOTP(email, userName = 'User', otp) {
  const subject = 'Kronos AI - Password Reset Verification Code';
  const html = getEmailHTMLTemplate({
    title: 'Password Reset Request',
    badge: 'SECURITY VERIFICATION',
    userName,
    bodyContent: `
      <p>We received a request to reset your password for your <strong>Kronos AI Account</strong>.</p>
      <p>Use the secure verification code below to continue:</p>
      <div class="otp-box">
        <div class="otp-code">${otp}</div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Valid for 5 minutes</div>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">If you did not request a password reset, please secure your account immediately.</p>
    `
  });

  const result = await sendResendMail({ to: email, subject, html });

  if (result.success) {
    await logEmail(email, subject, 'Forgot Password OTP', 'success');
    return { success: true, message: 'OTP sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(email, subject, 'Forgot Password OTP', 'failed', result.error);
    return {
      success: false,
      error: result.error,
      isResendTestingError: result.isResendTestingError,
      otp
    };
  }
}

/**
 * 3. Password Changed Confirmation Email
 */
export async function sendPasswordChangedEmail(email, userName = 'User') {
  const subject = 'Security Notification: Your Kronos AI Password Was Changed';
  const html = getEmailHTMLTemplate({
    title: 'Password Successfully Changed',
    badge: 'SECURITY ALERT',
    userName,
    bodyContent: `
      <p>This email confirms that your password for your <strong>Kronos AI Account</strong> was updated successfully on <strong>${new Date().toLocaleString()}</strong>.</p>
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0; color: #10b981; font-weight: 700;">✅ Account credentials updated successfully.</p>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">If you did not perform this change, please reset your password immediately or contact support.</p>
    `
  });

  const result = await sendResendMail({ to: email, subject, html });

  if (result.success) {
    await logEmail(email, subject, 'Password Changed Alert', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(email, subject, 'Password Changed Alert', 'failed', result.error);
    return { success: false, error: result.error, isResendTestingError: result.isResendTestingError };
  }
}

/**
 * 4. Daily Job Report Email
 */
export async function sendDailyJobReport(email, userName = 'User', reportData = {}, pdfAttachment = null) {
  const dateStr = reportData.date || new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  const subject = `Kronos AI Daily Job Report - ${dateStr}`;

  const jobRows = (reportData.jobs || [
    { portal: 'LinkedIn', company: 'Nexus Cybernetics', role: 'Lead AI Architect', resume: 'Software_Engineer_Resume.pdf', status: 'Applied' },
    { portal: 'Indeed', company: 'Precision Mech India', role: 'Automation Specialist', resume: 'DevOps_Resume.pdf', status: 'Applied' }
  ]).map(j => `
    <tr>
      <td><strong>${j.portal}</strong></td>
      <td>${j.company}</td>
      <td>${j.role}</td>
      <td>${j.resume || 'Default'}</td>
      <td style="color: ${j.status === 'Applied' ? '#10b981' : '#f43f5e'}; font-weight: 700;">${j.status} ${j.reason ? `(${j.reason})` : ''}</td>
    </tr>
  `).join('');

  const html = getEmailHTMLTemplate({
    title: 'Daily Job Automation Summary',
    badge: 'DAILY RECRUITMENT INTELLIGENCE',
    userName,
    bodyContent: `
      <p>Your Kronos AI Autonomous Campaign cycle has completed for <strong>${dateStr}</strong>.</p>
      <table>
        <thead>
          <tr>
            <th>Portal</th>
            <th>Company</th>
            <th>Job Role</th>
            <th>Resume Used</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${jobRows}</tbody>
      </table>
    `
  });

  const attachments = [];
  if (pdfAttachment) {
    attachments.push({
      filename: `Kronos_Daily_Report_${Date.now()}.pdf`,
      content: pdfAttachment,
      contentType: 'application/pdf'
    });
  }

  const result = await sendResendMail({ to: email, subject, html, attachments });

  if (result.success) {
    await logEmail(email, subject, 'Daily Job Report', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(email, subject, 'Daily Job Report', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 5. Missing Information Alert Email
 */
export async function sendMissingInformationEmail(email, userName = 'User', missingFields = ['Expected Salary'], jobDetails = {}) {
  const subject = 'Action Required: Missing Profile Information for Application';
  const missingList = missingFields.map(f => `<li style="margin-bottom: 6px; color: #f43f5e; font-weight: 700;">${f}</li>`).join('');

  const html = getEmailHTMLTemplate({
    title: 'Action Required: Application Paused',
    badge: 'PROFILE COMPLETION ALERT',
    userName,
    bodyContent: `
      <p>Kronos AI attempted to submit an application for <strong>${jobDetails.title || 'Senior Engineer'}</strong> at <strong>${jobDetails.company || 'Target Employer'}</strong>, but required additional profile fields:</p>
      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid #f43f5e; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
        <ul style="margin: 0; padding-left: 20px;">${missingList}</ul>
      </div>
    `
  });

  const result = await sendResendMail({ to: email, subject, html });

  if (result.success) {
    await logEmail(email, subject, 'Missing Profile Alert', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(email, subject, 'Missing Profile Alert', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 6. Application Success Email
 */
export async function sendApplicationSuccessEmail(email, userName = 'User', applicationDetails = {}) {
  const company = applicationDetails.company || 'Target Company';
  const subject = `Application Submitted Successfully - ${company}`;

  const html = getEmailHTMLTemplate({
    title: 'Application Submitted!',
    badge: 'APPLICATION CONFIRMATION',
    userName,
    bodyContent: `
      <p>Great news! Kronos AI has successfully submitted your job application to <strong>${company}</strong>.</p>
    `
  });

  const result = await sendResendMail({ to: email, subject, html });

  if (result.success) {
    await logEmail(email, subject, 'Application Success', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(email, subject, 'Application Success', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 7. Test Email Helper
 */
export async function sendTestEmail(toEmail) {
  const recipient = toEmail || 'ravikiranmadasu@gmail.com';
  const subject = 'Kronos AI Resend SDK Integration Diagnostic';
  const html = getEmailHTMLTemplate({
    title: 'Resend Email Service System Diagnostic',
    badge: 'SYSTEM INTEGRATION TEST',
    userName: recipient.split('@')[0] || 'User',
    bodyContent: `
      <p>Congratulations! Your <strong>Resend SDK Integration</strong> for Kronos AI is working perfectly.</p>
    `
  });

  const result = await sendResendMail({ to: recipient, subject, html });

  if (result.success) {
    await logEmail(recipient, subject, 'Test Email', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    await logEmail(recipient, subject, 'Test Email', 'failed', result.error);
    return { success: false, error: result.error, isResendTestingError: result.isResendTestingError };
  }
}
