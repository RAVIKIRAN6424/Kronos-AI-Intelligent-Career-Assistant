import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function buildMasterPDF() {
  console.log('⚡ Generating Kronos-AI-Master-Complete-Documentation.pdf...');

  const docsDir = path.join(rootDir, 'docs');
  const readmePath = path.join(rootDir, 'README.md');

  const docFiles = [
    { title: 'Executive Overview & GitHub Guide', path: readmePath },
    { title: 'System Architecture & Data Flow', path: path.join(docsDir, 'ARCHITECTURE.md') },
    { title: 'Comprehensive Application Features', path: path.join(docsDir, 'FEATURES.md') },
    { title: 'Technology Stack & Dependencies', path: path.join(docsDir, 'TECH_STACK.md') },
    { title: 'Installation & Setup Guide', path: path.join(docsDir, 'INSTALLATION.md') },
    { title: 'Enterprise Folder Directory Map', path: path.join(docsDir, 'FOLDER_STRUCTURE.md') },
    { title: 'REST API Specification', path: path.join(docsDir, 'API_DOCUMENTATION.md') },
    { title: 'Database Schema & Table Specifications', path: path.join(docsDir, 'DATABASE_SCHEMA.md') },
    { title: 'CI/CD Build & Test Pipeline', path: path.join(docsDir, 'CICD_EXPLANATION.md') },
    { title: 'Deployment Guide (CI/CD & Docker)', path: path.join(docsDir, 'DEPLOYMENT_GUIDE.md') },
    { title: 'User Interface & Theme Guide', path: path.join(docsDir, 'SCREENSHOTS.md') },
    { title: 'Future Product Roadmap', path: path.join(docsDir, 'FUTURE_ENHANCEMENTS.md') }
  ];

  let combinedMarkdown = `# ⚡ Kronos AI - Master Complete Enterprise Documentation\n\n`;
  combinedMarkdown += `**Application Name**: Kronos AI Intelligent Career Assistant & CRM\n`;
  combinedMarkdown += `**GitHub Repository**: https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git\n`;
  combinedMarkdown += `**Generated Date**: ${new Date().toLocaleString()} | **Version**: 1.0.0 (Production Master)\n\n---\n\n`;

  // Append exhaustive detailed sections
  for (const item of docFiles) {
    if (fs.existsSync(item.path)) {
      const content = fs.readFileSync(item.path, 'utf8');
      combinedMarkdown += `\n\n# 📌 ${item.title}\n\n${content}\n\n---\n`;
    }
  }

  // Append Additional Deep Code & Schema Details
  combinedMarkdown += `
# 🛠️ Deep Component & Operational Specification

## 1. Authentication & Security Policy
- **Password Complexity Engine**: Mandatory minimum 8 characters, at least 1 uppercase letter (\`A-Z\`), at least 1 lowercase letter (\`a-z\`), at least 1 number (\`0-9\`), and at least 1 special character (\`!@#$%^&*\`).
- **OTP Verification Cycle**: 6-digit random number generated via SQLite \`otp_codes\` table. Codes expire after 5 minutes (\`DATETIME('now', '+5 minutes')\`).
- **60-Second Cooldown Timer**: Frontend \`AuthModal.jsx\` enforces a 60-second countdown timer before allowing candidates to resend an OTP code (\`Resend Code in 60s\`).

## 2. Nodemailer Gmail SMTP Configuration
- **Host**: \`smtp.gmail.com\`
- **Port**: \`465\` (SSL Encrypted Connection)
- **Authentication**: Google App Password (\`EMAIL_USER=kronosai6424@gmail.com\`, \`EMAIL_PASS=atzr geyq ytdu eovb\`).
- **Fallback Terminal Logging**: Generated OTP codes and mail dispatch statuses are logged directly to the server terminal (\`✉️ Dispatched Registration OTP to: user@domain.com | OTP Code: 123456\`).

## 3. Operational Batch Utilities
- \`scripts/run-app.bat\`: Launches Express API server (Port 3001) and Vite dev server (Port 8080).
- \`scripts/install.bat\`: Automatically runs \`npm install\` across root, \`backend/\`, and \`frontend/\`.
- \`scripts/diagnose.bat\`: Validates system requirements, database connectivity, and node dependencies.
- \`scripts/sync-dist.js\`: Synchronizes Vite build output from \`frontend/dist\` to root \`dist/\` and patches SystemJS legacy hash tags.
`;

  // HTML Renderer
  let htmlBody = combinedMarkdown
    .replace(/^# (.*$)/gim, '<h1 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px; font-size: 24px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #38bdf8; margin-top: 20px; font-size: 18px;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #818cf8; font-size: 15px;">$1</h3>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #00f2fe; background: #0f172a; padding: 10px 16px; color: #94a3b8; margin: 12px 0;">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background: #090d16; color: #38bdf8; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; overflow-x: auto; font-family: monospace; font-size: 12px;"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background: #1e293b; color: #00f2fe; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">$1</code>')
    .replace(/\n/g, '<br>');

  const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kronos AI - Master Complete Enterprise Documentation</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #020617;
      color: #f1f5f9;
      line-height: 1.6;
      padding: 24px;
    }
    h1, h2, h3 { font-family: system-ui, sans-serif; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      background: #0f172a;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #334155;
      padding: 8px 12px;
      text-align: left;
    }
    th { background: #1e293b; color: #00f2fe; }
    a { color: #38bdf8; text-decoration: none; }
    hr { border: none; border-top: 1px solid #334155; margin: 24px 0; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>
  `;

  const pdfPath = path.join(rootDir, 'docs', 'Kronos-AI-Master-Complete-Documentation.pdf');
  const pdfRootPath = path.join(rootDir, 'Kronos-AI-Master-Complete-Documentation.pdf');
  const pdfDownloadsPath = 'C:\\Users\\ravik\\Downloads\\kronos-ai final application\\Kronos-AI-Master-Complete-Documentation.pdf';
  const pdfArtifactPath = 'C:\\Users\\ravik\\.gemini\\antigravity-ide\\brain\\1fb31000-2542-423a-8eff-6e9964277458\\Kronos-AI-Master-Complete-Documentation.pdf';

  // Save HTML export
  fs.writeFileSync(path.join(rootDir, 'docs', 'Kronos-AI-Master-Complete-Documentation.html'), htmlDoc, 'utf8');

  // Render PDF using Playwright Chromium
  try {
    let playwright;
    const backendPlaywrightPath = path.join(rootDir, 'backend', 'node_modules', 'playwright', 'index.js');
    if (fs.existsSync(backendPlaywrightPath)) {
      playwright = await import(`file://${backendPlaywrightPath.replace(/\\/g, '/')}`);
    } else {
      playwright = await import('playwright');
    }

    const chromeEngine = playwright.chromium || (playwright.default && playwright.default.chromium);
    
    let chromePath;
    const chromeCandidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    for (const p of chromeCandidates) {
      if (fs.existsSync(p)) {
        chromePath = p;
        break;
      }
    }

    const launchOpts = { headless: true };
    if (chromePath) {
      launchOpts.executablePath = chromePath;
    }

    const browser = await chromeEngine.launch(launchOpts);
    const page = await browser.newPage();
    await page.setContent(htmlDoc);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }
    });

    await browser.close();
    console.log('🎉 Successfully generated Master PDF:', pdfPath);

    // Sync PDF to root and extra locations if they exist
    fs.copyFileSync(pdfPath, pdfRootPath);
    if (fs.existsSync(path.dirname(pdfDownloadsPath))) {
      fs.copyFileSync(pdfPath, pdfDownloadsPath);
    }
    if (fs.existsSync(path.dirname(pdfArtifactPath))) {
      fs.copyFileSync(pdfPath, pdfArtifactPath);
    }
    console.log('✅ Synchronized Master PDF!');
  } catch (err) {
    console.error('❌ PDF Generation Error:', err.message);
  }
}

buildMasterPDF().catch(console.error);
