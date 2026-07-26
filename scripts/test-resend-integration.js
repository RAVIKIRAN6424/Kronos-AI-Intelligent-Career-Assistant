import { sendOTPEmail, sendForgotPasswordOTP, sendTestEmail } from '../backend/src/services/emailService.js';
import { initDb } from '../backend/src/config/database.js';

async function runResendTests() {
  await initDb();
  console.log('\n========================================================');
  console.log('🧪 TESTING RESEND SDK WITH OWNER EMAIL: ravikiranmadasu@gmail.com');
  console.log('========================================================\n');

  const testEmail = 'ravikiranmadasu@gmail.com';

  // Test 1: Registration OTP Delivery
  console.log('--- TEST 1: Registration OTP Delivery ---');
  const otpRes = await sendOTPEmail(testEmail, 'Ravi Kiran', '987654');
  console.log('Test 1 Result:', JSON.stringify(otpRes, null, 2));

  // Test 2: Forgot Password OTP Delivery
  console.log('\n--- TEST 2: Forgot Password OTP Delivery ---');
  const forgotRes = await sendForgotPasswordOTP(testEmail, 'Ravi Kiran', '456789');
  console.log('Test 2 Result:', JSON.stringify(forgotRes, null, 2));

  // Test 3: Test Email Endpoint Helper
  console.log('\n--- TEST 3: Resend Diagnostic Test Email ---');
  const testRes = await sendTestEmail(testEmail);
  console.log('Test 3 Result:', JSON.stringify(testRes, null, 2));

  console.log('\n========================================================');
  console.log('🎉 RESEND SDK INTEGRATION TESTING COMPLETE');
  console.log('========================================================\n');
}

runResendTests().catch(console.error);
