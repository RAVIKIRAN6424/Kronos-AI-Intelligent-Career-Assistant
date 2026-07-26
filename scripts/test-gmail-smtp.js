import { sendOTPEmail, sendForgotPasswordOTP, sendDailyJobReport, sendTestEmail } from '../backend/src/services/emailService.js';
import { initDb } from '../backend/src/config/database.js';

async function runGmailTests() {
  await initDb();
  console.log('\n========================================================');
  console.log('🧪 RUNNING AUTOMATED GMAIL SMTP DISPATCH TESTS');
  console.log('========================================================\n');

  const testEmail = 'kronosai6424@gmail.com';

  // 1. Registration OTP Test
  console.log('--- TEST 1: Registration OTP Delivery ---');
  const regRes = await sendOTPEmail(testEmail, 'Ravi Kiran', '987654');
  console.log('Test 1 Result:', JSON.stringify(regRes, null, 2));

  // 2. Forgot Password OTP Test
  console.log('\n--- TEST 2: Forgot Password OTP Delivery ---');
  const forgotRes = await sendForgotPasswordOTP(testEmail, 'Ravi Kiran', '456789');
  console.log('Test 2 Result:', JSON.stringify(forgotRes, null, 2));

  // 3. Daily Job Report Test
  console.log('\n--- TEST 3: Daily Job Summary Report Delivery ---');
  const reportRes = await sendDailyJobReport(testEmail, 'Ravi Kiran', {
    date: new Date().toLocaleDateString(),
    totalFound: 15,
    totalApplied: 10,
    skippedJobs: 1,
    startTime: '09:00 AM',
    stopTime: '06:00 PM'
  });
  console.log('Test 3 Result:', JSON.stringify(reportRes, null, 2));

  // 4. Test Email Endpoint Helper Test
  console.log('\n--- TEST 4: Diagnostic Test Email Endpoint Helper ---');
  const testRes = await sendTestEmail(testEmail);
  console.log('Test 4 Result:', JSON.stringify(testRes, null, 2));

  console.log('\n========================================================');
  console.log('🎉 GMAIL SMTP INTEGRATION TESTING COMPLETE');
  console.log('========================================================\n');
}

runGmailTests().catch(console.error);
