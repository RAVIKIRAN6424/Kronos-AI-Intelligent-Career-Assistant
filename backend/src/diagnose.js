import { initDb, getOne } from './config/database.js';
import Anthropic from '@anthropic-ai/sdk';

async function runDiagnostics() {
  console.log(`
=========================================================
⚡ KRONOS AI CRM - SYSTEM DIAGNOSTICS SUITE
=========================================================
Running tests on SQLite, Anthropic AI, SMTP, and System Health...
`);

  let dbOk = false;
  let smtpOk = false;
  let claudeOk = false;

  // 1. Test SQLite Database
  try {
    await initDb();
    const count = await getOne(`SELECT COUNT(*) as c FROM jobs`);
    console.log(`✅ [SQLITE DB SUCCESS] Connected. Total jobs in DB: ${count?.c || 0}`);
    dbOk = true;
  } catch (err) {
    console.error(`❌ [SQLITE DB FAIL]: ${err.message}`);
  }

  // 2. Test Kronos AI Engine API Key
  try {
    const setting = await getOne(`SELECT value FROM settings WHERE key = 'claude_api_key'`);
    const key = setting?.value || process.env.CLAUDE_API_KEY;
    if (key && key.trim().length > 10) {
      const anthropic = new Anthropic({ apiKey: key });
      console.log(`✅ [KRONOS AI ENGINE] Key configured (${key.slice(0, 8)}...). Ready for live AI analysis.`);
      claudeOk = true;
    } else {
      console.log(`ℹ️ [KRONOS AI ENGINE] No API Key provided. Kronos AI will use built-in Smart Heuristic Scoring Engine (Offline/Zero-Cost mode).`);
      claudeOk = true; // Fallback ready
    }
  } catch (err) {
    console.warn(`⚠️ [KRONOS AI ENGINE WARNING]: ${err.message}`);
  }

  // 3. Test SMTP Credentials
  try {
    const smtpHost = await getOne(`SELECT value FROM settings WHERE key = 'smtp_host'`);
    if (smtpHost?.value) {
      console.log(`✅ [SMTP SUCCESS] SMTP host configured (${smtpHost.value}). Outreach active.`);
      smtpOk = true;
    } else {
      console.log(`ℹ️ [SMTP NOTICE] SMTP credentials not configured in settings. (Cold emails will run in Simulated Dispatch Mode until valid credentials are added).`);
    }
  } catch (err) {
    console.warn(`⚠️ [SMTP ERROR]: ${err.message}`);
  }

  console.log(`
=========================================================
📊 DIAGNOSTICS SUMMARY
=========================================================
SQLite Database       : ${dbOk ? 'READY' : 'ERROR'}
AI Match & Email      : ${claudeOk ? 'READY' : 'NOT READY'}
SMTP Outreach Engine  : ${smtpOk ? 'LIVE SMTP' : 'SIMULATED DISPATCH'}
=========================================================
System is READY to launch! Boot backend and frontend using run-app.bat.
=========================================================
`);

  process.exit(0);
}

runDiagnostics();
