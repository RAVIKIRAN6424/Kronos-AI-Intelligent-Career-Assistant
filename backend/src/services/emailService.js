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

const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn('⚠️ RESEND_API_KEY is missing from process.env');
}

const resend = new Resend(resendApiKey);

// Default sender address as specified in requirements
const FROM_EMAIL = 'Kronos AI <onboarding@resend.dev>';

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
 * Helper to dispatch emails via Resend SDK
 */
async function sendResendMail({ to, subject, html, attachments = [] }) {
  try {
    const payload = {
      from: FROM_EMAIL,
      to,
      subject,
      html
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(att => ({
        filename: att.filename,
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content
      }));
    }

    console.log('Calling Resend...');
    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error('\n=========================================');
      console.error('Resend API Error:', error.message || error);
      console.error('=========================================\n');
      return { success: false, error: error.message || JSON.stringify(error) };
    }

    console.log('Email sent successfully.');
    return { success: true, messageId: data?.id || 'resend-id' };
  } catch (err) {
    console.error('\n=========================================');
    console.error('Resend API Error:', err.message || err);
    console.error('=========================================\n');
    return { success: false, error: err.message || err.toString() };
  }
}

/**
 * Reusable Responsive Cyberpunk HTML Template Generator
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
    .footer a {
      color: #00f2fe;
      text-decoration: none;
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
        <p>Support Contact: <a href="mailto:support@resend.dev">support@resend.dev</a></p>
        <p>© 2026 Kronos AI Systems. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Registration & Resend OTP Email (sendOTPEmail)
 */
export async function sendOTPEmail(email, userNameOrOtp = 'User', otpCode = null) {
  const startTime = Date.now();
  let userName = userNameOrOtp;
  let otp = otpCode;

  if (!otpCode) {
    otp = userNameOrOtp;
    userName = email ? email.split('@')[0] : 'Candidate';
  }

  console.log('\n=========================================');
  console.log('OTP REQUEST RECEIVED');
  console.log(`Email: ${email}`);
  console.log(`Generated OTP: ${otp}`);
  console.log('Saving OTP...');

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

  const result = await sendResendMail({
    to: email,
    subject,
    html
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Registration OTP', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log(`OTP Delivery Failed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Registration OTP', 'failed', result.error);
    return { success: false, error: result.error, otp };
  }
}

/**
 * 2. Forgot Password OTP Email (sendForgotPasswordOTP)
 */
export async function sendForgotPasswordOTP(email, userName = 'User', otp) {
  const startTime = Date.now();
  console.log('\n=========================================');
  console.log('FORGOT PASSWORD OTP REQUEST');
  console.log(`Email: ${email}`);
  console.log(`Generated OTP: ${otp}`);
  console.log('Saving OTP...');

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

  const result = await sendResendMail({
    to: email,
    subject,
    html
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Forgot Password OTP', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log(`Password Reset OTP Failed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Forgot Password OTP', 'failed', result.error);
    return { success: false, error: result.error, otp };
  }
}

/**
 * 3. Password Changed Confirmation Email (sendPasswordChangedEmail)
 */
export async function sendPasswordChangedEmail(email, userName = 'User') {
  const startTime = Date.now();
  console.log('\n=========================================');
  console.log('PASSWORD CHANGED CONFIRMATION REQUEST');
  console.log(`Email: ${email}`);

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

  const result = await sendResendMail({
    to: email,
    subject,
    html
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Password Changed Alert', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log('=========================================\n');
    await logEmail(email, subject, 'Password Changed Alert', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 4. Daily Automation Job Summary Report & Resume Attached (sendDailyJobReport)
 */
export async function sendDailyJobReport(email, userName = 'User', reportData = {}, pdfAttachment = null) {
  const startTime = Date.now();
  const dateStr = reportData.date || new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  const subject = `Kronos AI Daily Job Report - ${dateStr}`;

  console.log('\n=========================================');
  console.log('DAILY JOB REPORT REQUEST');
  console.log(`Email: ${email}`);

  const jobRows = (reportData.jobs || [
    { portal: 'LinkedIn', company: 'Nexus Cybernetics', role: 'Lead AI Architect', resume: 'Software_Engineer_Resume.pdf', status: 'Applied' },
    { portal: 'Indeed', company: 'Precision Mech India', role: 'Automation Specialist', resume: 'DevOps_Resume.pdf', status: 'Applied' },
    { portal: 'Naukri', company: 'Skyscraper Infra Tech', role: 'Structural Engineer', resume: 'Mechanical_Resume.pdf', status: 'Skipped', reason: 'Requires Expected Salary' }
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
      
      <table style="margin-bottom: 20px;">
        <tr><th>Metric</th><th>Details</th></tr>
        <tr><td>Campaign Date</td><td>${dateStr}</td></tr>
        <tr><td>Execution Window</td><td>${reportData.startTime || '09:00 AM'} - ${reportData.stopTime || '06:00 PM'}</td></tr>
        <tr><td>Total Jobs Found</td><td><strong>${reportData.totalFound || 14}</strong></td></tr>
        <tr><td>Applications Submitted</td><td><strong style="color: #10b981;">${reportData.totalApplied || 8}</strong></td></tr>
        <tr><td>Skipped Applications</td><td><strong style="color: #f43f5e;">${reportData.skippedJobs || 2}</strong></td></tr>
      </table>

      <h3 style="color: #ffffff; font-size: 16px; margin-top: 24px;">Application Details</h3>
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
        <tbody>
          ${jobRows}
        </tbody>
      </table>

      <p style="font-size: 13px; color: #94a3b8; margin-top: 16px;">Attached to this email is your compiled performance report document.</p>
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

  const result = await sendResendMail({
    to: email,
    subject,
    html,
    attachments
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Daily Job Report', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log('=========================================\n');
    await logEmail(email, subject, 'Daily Job Report', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 5. Missing Information Alert Email (sendMissingInformationEmail)
 */
export async function sendMissingInformationEmail(email, userName = 'User', missingFields = ['Expected Salary', 'Portfolio URL'], jobDetails = {}) {
  const startTime = Date.now();
  console.log('\n=========================================');
  console.log('MISSING INFORMATION ALERT REQUEST');
  console.log(`Email: ${email}`);

  const subject = 'Action Required: Missing Profile Information for Application';
  const missingList = missingFields.map(f => `<li style="margin-bottom: 6px; color: #f43f5e; font-weight: 700;">${f}</li>`).join('');

  const html = getEmailHTMLTemplate({
    title: 'Action Required: Application Paused',
    badge: 'PROFILE COMPLETION ALERT',
    userName,
    bodyContent: `
      <p>Kronos AI attempted to submit an application for <strong>${jobDetails.title || 'Senior Engineer'}</strong> at <strong>${jobDetails.company || 'Target Employer'}</strong> on <strong>${jobDetails.portal || 'LinkedIn'}</strong>, but required additional profile fields:</p>
      
      <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid #f43f5e; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
        <h4 style="color: #f43f5e; margin: 0 0 10px 0;">Required Missing Fields:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${missingList}
        </ul>
      </div>

      <p>This single application has been paused to ensure accuracy. Please log into your Kronos AI Dashboard and update your profile preferences.</p>
    `,
    ctaButton: {
      text: 'Update Profile Settings',
      url: 'https://kronos-ai-intelligent-career-assist.vercel.app/'
    }
  });

  const result = await sendResendMail({
    to: email,
    subject,
    html
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Missing Profile Alert', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log('=========================================\n');
    await logEmail(email, subject, 'Missing Profile Alert', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 6. Successful Application Confirmation Email (sendApplicationSuccessEmail)
 */
export async function sendApplicationSuccessEmail(email, userName = 'User', applicationDetails = {}) {
  const startTime = Date.now();
  const company = applicationDetails.company || 'Target Company';
  const subject = `Application Submitted Successfully - ${company}`;

  console.log('\n=========================================');
  console.log('APPLICATION SUCCESS CONFIRMATION REQUEST');
  console.log(`Email: ${email}`);

  const html = getEmailHTMLTemplate({
    title: 'Application Submitted!',
    badge: 'APPLICATION CONFIRMATION',
    userName,
    bodyContent: `
      <p>Great news! Kronos AI has successfully submitted your job application:</p>
      
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 4px 0;">🏢 <strong>Company:</strong> ${company}</p>
        <p style="margin: 4px 0;">🎯 <strong>Job Title:</strong> ${applicationDetails.jobTitle || applicationDetails.title || 'Specialist'}</p>
        <p style="margin: 4px 0;">🌐 <strong>Portal:</strong> ${applicationDetails.portal || 'LinkedIn'}</p>
        <p style="margin: 4px 0;">📄 <strong>Resume Used:</strong> ${applicationDetails.resumeUsed || 'Software_Engineer_Resume.pdf'}</p>
        <p style="margin: 4px 0;">⏰ <strong>Submission Time:</strong> ${applicationDetails.time || new Date().toLocaleString()}</p>
      </div>

      <p style="font-size: 13px; color: #94a3b8;">This opportunity has been logged in your Kronos Jobs CRM Kanban board for real-time response tracking.</p>
    `
  });

  const result = await sendResendMail({
    to: email,
    subject,
    html
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(email, subject, 'Application Success', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log('=========================================\n');
    await logEmail(email, subject, 'Application Success', 'failed', result.error);
    return { success: false, error: result.error };
  }
}

/**
 * 7. Test Email Helper (sendTestEmail)
 */
export async function sendTestEmail(toEmail) {
  const startTime = Date.now();
  const recipient = toEmail || '6424ravikiran@gmail.com';

  console.log('\n=========================================');
  console.log('TEST EMAIL REQUEST');
  console.log(`Email: ${recipient}`);

  const subject = 'Kronos AI Resend SDK Integration Diagnostic';
  const html = getEmailHTMLTemplate({
    title: 'Resend Email Service System Diagnostic',
    badge: 'SYSTEM INTEGRATION TEST',
    userName: recipient.split('@')[0] || 'User',
    bodyContent: `
      <p>Congratulations! Your <strong>Resend SDK Integration</strong> for Kronos AI is working perfectly.</p>
      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #10b981; font-weight: 700;">✅ Resend Email API Status: Active & Connected</p>
      </div>
      <p style="font-size: 13px; color: #94a3b8;">Dispatched via Resend API Key using onboarding@resend.dev.</p>
    `
  });

  const result = await sendResendMail({
    to: recipient,
    subject,
    html
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log(`Completed in ${durationSec} seconds.`);
    console.log('=========================================\n');
    await logEmail(recipient, subject, 'Test Email', 'success');
    return { success: true, message: 'Email sent successfully.', messageId: result.messageId };
  } else {
    console.log('=========================================\n');
    await logEmail(recipient, subject, 'Test Email', 'failed', result.error);
    return { success: false, error: result.error };
  }
}
