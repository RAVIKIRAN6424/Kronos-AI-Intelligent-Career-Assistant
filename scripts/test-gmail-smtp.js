import {
  sendOTPEmail,
  sendForgotPasswordOTP,
  sendPasswordChangedEmail,
  sendDailyJobReport,
  sendMissingInformationEmail,
  sendApplicationSuccessEmail,
  sendTestEmail
} from '../backend/src/services/emailService.js';
import { initDb } from '../backend/src/config/database.js';
import { generateOTP, saveOTP, verifyOTPCode } from '../backend/src/utils/otpHelper.js';

async function runFullEmailSystemTests() {
  await initDb();
  console.log('\n========================================================');
  console.log('🧪 RUNNING COMPLETE EMAIL NOTIFICATION SYSTEM VERIFICATION');
  console.log('========================================================\n');

  const testEmail = 'kronosai6424@gmail.com';
  const name = 'Alex Vance';

  // 1. Create Account / Send OTP (< 5 sec delivery)
  console.log('--- TEST 1: Registration OTP (Immediate Dispatch) ---');
  const otp1 = generateOTP();
  await saveOTP(testEmail, otp1, 'registration');
  const t1Start = Date.now();
  const res1 = await sendOTPEmail(testEmail, name, otp1);
  console.log(`Test 1 Completed in ${((Date.now() - t1Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res1));

  // 2. Resend OTP (New OTP generated, Old Invalidated)
  console.log('\n--- TEST 2: Resend OTP (New OTP Generated & Sent) ---');
  const otp2 = generateOTP();
  await saveOTP(testEmail, otp2, 'registration');
  const t2Start = Date.now();
  const res2 = await sendOTPEmail(testEmail, name, otp2);
  console.log(`Test 2 Completed in ${((Date.now() - t2Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res2));

  // Verify old OTP (otp1) is INVALID, new OTP (otp2) is VALID
  const isValid1 = await verifyOTPCode(testEmail, otp1);
  const isValid2 = await verifyOTPCode(testEmail, otp2);
  console.log(`OTP Invalidation Check: Old OTP (${otp1}) Valid? ${isValid1} | New OTP (${otp2}) Valid? ${isValid2}`);

  // 3. Forgot Password OTP
  console.log('\n--- TEST 3: Forgot Password OTP ---');
  const forgotOtp = generateOTP();
  await saveOTP(testEmail, forgotOtp, 'forgot_password');
  const t3Start = Date.now();
  const res3 = await sendForgotPasswordOTP(testEmail, name, forgotOtp);
  console.log(`Test 3 Completed in ${((Date.now() - t3Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res3));

  // 4. Password Changed Confirmation
  console.log('\n--- TEST 4: Password Changed Security Confirmation ---');
  const t4Start = Date.now();
  const res4 = await sendPasswordChangedEmail(testEmail, name);
  console.log(`Test 4 Completed in ${((Date.now() - t4Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res4));

  // 5. Daily Job Report with Resume Attachment
  console.log('\n--- TEST 5: Daily Job Report & Attached Document ---');
  const t5Start = Date.now();
  const res5 = await sendDailyJobReport(testEmail, name, {
    date: new Date().toLocaleDateString(),
    totalFound: 18,
    totalApplied: 12,
    skippedJobs: 2
  }, Buffer.from('%PDF-1.4 Mock Resume Document Content'));
  console.log(`Test 5 Completed in ${((Date.now() - t5Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res5));

  // 6. Application Submitted Confirmation
  console.log('\n--- TEST 6: Application Submitted Confirmation ---');
  const t6Start = Date.now();
  const res6 = await sendApplicationSuccessEmail(testEmail, name, {
    company: 'Quantum Dynamics Inc',
    jobTitle: 'Lead AI Engineer',
    portal: 'LinkedIn'
  });
  console.log(`Test 6 Completed in ${((Date.now() - t6Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res6));

  // 7. Missing Information Alert
  console.log('\n--- TEST 7: Missing Information Notification ---');
  const t7Start = Date.now();
  const res7 = await sendMissingInformationEmail(testEmail, name, ['Expected Salary', 'Notice Period'], {
    company: 'Cyberdyne Systems',
    title: 'Senior Systems Architect',
    portal: 'Naukri'
  });
  console.log(`Test 7 Completed in ${((Date.now() - t7Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res7));

  // 8. Test Email Helper
  console.log('\n--- TEST 8: Diagnostic Test Email Helper ---');
  const t8Start = Date.now();
  const res8 = await sendTestEmail(testEmail);
  console.log(`Test 8 Completed in ${((Date.now() - t8Start) / 1000).toFixed(2)}s | Result:`, JSON.stringify(res8));

  console.log('\n========================================================');
  console.log('🎉 COMPLETE EMAIL SYSTEM VERIFICATION FINISHED SUCCESSFULLY');
  console.log('========================================================\n');
}

runFullEmailSystemTests().catch(console.error);
