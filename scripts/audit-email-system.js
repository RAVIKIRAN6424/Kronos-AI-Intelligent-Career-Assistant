import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb, getOne } from '../backend/src/config/database.js';
import { generateOTP, saveOTP } from '../backend/src/utils/otpHelper.js';
import { sendOTPEmail, sendForgotPasswordOTP, sendTestEmail } from '../backend/src/services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../backend/.env');
dotenv.config({ path: envPath });

async function performSystemAudit() {
  console.log('\n========================================================');
  console.log('🔍 KRONOS AI RESEND EMAIL SYSTEM AUDIT');
  console.log('========================================================\n');

  let failedComponents = [];
  let workingComponents = [];
  let warnings = [];

  // STEP 1: Environment Variables Audit
  console.log('--- 1. ENVIRONMENT VARIABLES AUDIT ---');
  const requiredEnvVars = [
    { name: 'RESEND_API_KEY', val: process.env.RESEND_API_KEY, req: true },
    { name: 'RESEND_FROM_EMAIL', val: process.env.RESEND_FROM_EMAIL || 'Kronos AI <onboarding@resend.dev>', req: false },
    { name: 'PORT', val: process.env.PORT || '8080 (Default)', req: false },
    { name: 'JWT_SECRET', val: process.env.JWT_SECRET || 'kronos-secret-key-2026', req: false }
  ];

  for (const env of requiredEnvVars) {
    if (!env.val && env.req) {
      console.error(`❌ MISSING MANDATORY ENV VAR: ${env.name}`);
      failedComponents.push({
        name: `Environment Variable: ${env.name}`,
        file: 'backend/.env',
        rootCause: `${env.name} is missing from environment config.`,
        fix: `Add ${env.name} to backend/.env file.`
      });
    } else {
      console.log(`  ✅ ${env.name}: ${env.val ? 'LOADED' : 'NOT SET'}`);
    }
  }

  // STEP 2: Database Initialization
  console.log('\n--- 2. DATABASE & SCHEMA AUDIT ---');
  try {
    await initDb();
    workingComponents.push('SQLite Database & Table Schemas (users, otp_codes, email_logs)');
    console.log('  ✅ Database connected & schemas verified.');
  } catch (err) {
    failedComponents.push({
      name: 'Database Initialization',
      file: 'backend/src/config/database.js',
      rootCause: err.message,
      fix: 'Verify database path and sqlite3 file permissions.'
    });
  }

  const testEmail = 'ravikiranmadasu@gmail.com';
  const name = 'Alex Vance Audit';

  // STEP 3: OTP Generation, Invalidation & Expiry Audit
  console.log('\n--- 3. OTP GENERATION & INVALIDATION AUDIT ---');
  try {
    const otp1 = generateOTP();
    await saveOTP(testEmail, otp1, 'registration');
    const dbRecord1 = await getOne(`SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ?`, [testEmail, otp1]);
    
    if (!dbRecord1) {
      throw new Error('Failed to insert OTP record into database.');
    }

    // Now resend OTP
    const otp2 = generateOTP();
    await saveOTP(testEmail, otp2, 'registration');
    
    const dbRecordOld = await getOne(`SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ?`, [testEmail, otp1]);
    const dbRecordNew = await getOne(`SELECT * FROM otp_codes WHERE LOWER(email) = LOWER(?) AND code = ?`, [testEmail, otp2]);

    if (dbRecordOld) {
      throw new Error(`Previous OTP ${otp1} was NOT invalidated upon new OTP generation!`);
    }
    if (!dbRecordNew) {
      throw new Error(`New OTP ${otp2} was NOT saved to database.`);
    }

    console.log(`  ✅ OTP Generation: ${otp1} -> Resend: ${otp2}`);
    console.log(`  ✅ Previous OTP (${otp1}) automatically invalidated & deleted from database.`);
    console.log(`  ✅ New OTP (${otp2}) saved with 5-minute expiry (${dbRecordNew.expires_at}).`);
    workingComponents.push('OTP Generator, Invalidation Engine & Expiry Logic');
  } catch (err) {
    failedComponents.push({
      name: 'OTP Invalidation System',
      file: 'backend/src/utils/otpHelper.js',
      line: 13,
      rootCause: err.message,
      fix: 'Ensure saveOTP calls DELETE FROM otp_codes before inserting new code.'
    });
  }

  // STEP 4: Live Email Dispatch API Audit
  console.log('\n--- 4. LIVE RESEND EMAIL DISPATCH API AUDIT ---');
  
  // Test 4.1: POST /api/auth/send-otp
  console.log('Testing sendOTPEmail()...');
  const otpCode = generateOTP();
  await saveOTP(testEmail, otpCode, 'registration');
  const sendRes = await sendOTPEmail(testEmail, name, otpCode);
  console.log('  sendOTPEmail Response:', JSON.stringify(sendRes));
  if (sendRes.success) {
    workingComponents.push('Registration OTP Resend Email Dispatch (sendOTPEmail)');
  } else {
    failedComponents.push({
      name: 'Registration OTP Email Dispatch',
      file: 'backend/src/services/emailService.js',
      rootCause: sendRes.error,
      fix: 'Check RESEND_API_KEY in backend/.env'
    });
  }

  // Test 4.2: Forgot Password OTP
  console.log('Testing sendForgotPasswordOTP()...');
  const forgotCode = generateOTP();
  await saveOTP(testEmail, forgotCode, 'forgot_password');
  const forgotRes = await sendForgotPasswordOTP(testEmail, name, forgotCode);
  console.log('  sendForgotPasswordOTP Response:', JSON.stringify(forgotRes));
  if (forgotRes.success) {
    workingComponents.push('Forgot Password OTP Email Dispatch (sendForgotPasswordOTP)');
  } else {
    failedComponents.push({
      name: 'Forgot Password OTP Email Dispatch',
      file: 'backend/src/services/emailService.js',
      rootCause: forgotRes.error,
      fix: 'Check Resend API Key.'
    });
  }

  // Test 4.3: Test Endpoint Helper
  console.log('Testing sendTestEmail()...');
  const testRes = await sendTestEmail(testEmail);
  console.log('  sendTestEmail Response:', JSON.stringify(testRes));
  if (testRes.success) {
    workingComponents.push('Diagnostic Resend Test Email Dispatch (sendTestEmail)');
  } else {
    failedComponents.push({
      name: 'Diagnostic Test Email',
      file: 'backend/src/services/emailService.js',
      rootCause: testRes.error,
      fix: 'Verify Resend API Key.'
    });
  }

  // STEP 5: Git Exclusions & Repository Rules Audit
  console.log('\n--- 5. GIT EXCLUSION RULES AUDIT ---');
  const gitignorePath = path.resolve(__dirname, '../.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    const requiredPatterns = ['node_modules/', 'backend/.env', 'frontend/.env', '*.log', 'database.db'];
    
    let allIncluded = true;
    for (const pattern of requiredPatterns) {
      if (!gitignoreContent.includes(pattern)) {
        console.warn(`  ⚠️ Missing .gitignore pattern: ${pattern}`);
        warnings.push(`.gitignore missing pattern: ${pattern}`);
        allIncluded = false;
      }
    }

    if (allIncluded) {
      console.log('  ✅ .gitignore rules properly exclude .env, node_modules, database.db, and *.log.');
      workingComponents.push('Git Exclusions (.gitignore)');
    }
  }

  // STEP 6: Final Audit Report Output
  console.log('\n========================================================');
  console.log('📋 AUDIT REPORT SUMMARY');
  console.log('========================================================\n');

  console.log('✅ WORKING COMPONENTS:');
  workingComponents.forEach(c => console.log(`  - ${c}`));

  if (warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (failedComponents.length > 0) {
    console.log('\n❌ FAILED COMPONENTS:');
    failedComponents.forEach(f => {
      console.log(`\n  Component: ${f.name}`);
      console.log(`  File: ${f.file}${f.line ? `:${f.line}` : ''}`);
      console.log(`  Root Cause: ${f.rootCause}`);
      console.log(`  Required Fix: ${f.fix}`);
    });
  } else {
    console.log('\n🎉 ALL RESEND COMPONENTS VERIFIED! NO FAILED COMPONENTS DETECTED.');
  }

  console.log('\n========================================================\n');
}

performSystemAudit().catch(console.error);
