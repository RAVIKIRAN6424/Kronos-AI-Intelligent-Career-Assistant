import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function buildPDF() {
  console.log('📄 Combining Markdown documentation files into HTML...');

  const docsDir = path.join(rootDir, 'docs');
  const readmePath = path.join(rootDir, 'README.md');

  const files = [
    { title: 'Master Overview', path: readmePath },
    { title: 'Project Architecture', path: path.join(docsDir, 'ARCHITECTURE.md') },
    { title: 'Feature Guide', path: path.join(docsDir, 'FEATURES.md') },
    { title: 'Technology Stack', path: path.join(docsDir, 'TECH_STACK.md') },
    { title: 'Installation Guide', path: path.join(docsDir, 'INSTALLATION.md') },
    { title: 'Folder Structure', path: path.join(docsDir, 'FOLDER_STRUCTURE.md') },
    { title: 'REST API Documentation', path: path.join(docsDir, 'API_DOCUMENTATION.md') },
    { title: 'Database Schema', path: path.join(docsDir, 'DATABASE_SCHEMA.md') },
    { title: 'CI/CD Pipeline', path: path.join(docsDir, 'CICD_EXPLANATION.md') },
    { title: 'Deployment Guide', path: path.join(docsDir, 'DEPLOYMENT_GUIDE.md') },
    { title: 'User Interface & Screenshots', path: path.join(docsDir, 'SCREENSHOTS.md') },
    { title: 'Future Enhancements', path: path.join(docsDir, 'FUTURE_ENHANCEMENTS.md') }
  ];

  let combinedMarkdown = `# ⚡ Kronos AI - Complete Enterprise Documentation\n\n`;
  combinedMarkdown += `**Generated Date**: ${new Date().toLocaleDateString()} | **Version**: 1.0.0\n`;
  combinedMarkdown += `**GitHub Repository**: https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant\n`;
  combinedMarkdown += `**Live AWS EC2**: http://65.2.220.208:8080\n\n---\n\n`;

  for (const item of files) {
    if (fs.existsSync(item.path)) {
      const content = fs.readFileSync(item.path, 'utf8');
      combinedMarkdown += `\n\n<!-- PAGE BREAK -->\n\n# ${item.title}\n\n${content}\n\n---\n`;
    }
  }

  // Simple Markdown to HTML converter
  let htmlBody = combinedMarkdown
    .replace(/^# (.*$)/gim, '<h1 style="color: #00f2fe; border-bottom: 2px solid #00f2fe; padding-bottom: 8px;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #38bdf8; margin-top: 24px;">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 style="color: #818cf8;">$1</h3>')
    .replace(/^\> (.*$)/gim, '<blockquote style="border-left: 4px solid #00f2fe; background: #0f172a; padding: 10px 16px; color: #94a3b8;">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background: #090d16; color: #38bdf8; padding: 14px; border-radius: 8px; border: 1px solid #1e293b; overflow-x: auto;"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code style="background: #1e293b; color: #00f2fe; padding: 2px 6px; border-radius: 4px;">$1</code>')
    .replace(/\n/g, '<br>');

  const htmlDoc = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Kronos AI - Complete Enterprise Documentation</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #020617;
      color: #f1f5f9;
      line-height: 1.6;
      padding: 30px;
    }
    h1, h2, h3 { font-family: system-ui, sans-serif; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      background: #0f172a;
    }
    th, td {
      border: 1px solid #334155;
      padding: 10px 14px;
      text-align: left;
    }
    th { background: #1e293b; color: #00f2fe; }
    a { color: #38bdf8; text-decoration: none; }
    hr { border: none; border-top: 1px solid #334155; margin: 30px 0; }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>
  `;

  const outputPathHtml = path.join(rootDir, 'docs', 'Kronos-AI-Documentation.html');
  fs.writeFileSync(outputPathHtml, htmlDoc, 'utf8');
  console.log('✅ Generated HTML documentation:', outputPathHtml);

  // Try Playwright PDF export if installed
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
    const pdfPath = path.join(rootDir, 'docs', 'Kronos-AI-Documentation.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
    });
    await browser.close();
    console.log('🎉 Successfully created PDF documentation:', pdfPath);

    // Also copy to root & downloads
    fs.copyFileSync(pdfPath, path.join(rootDir, 'Kronos-AI-Documentation.pdf'));
    const downloadsCopy = 'C:\\Users\\ravik\\Downloads\\kronos-ai final application\\Kronos-AI-Documentation.pdf';
    fs.copyFileSync(pdfPath, downloadsCopy);
    console.log('✅ Synchronized PDF to root and Downloads folder!');
  } catch (err) {
    console.log('ℹ️ Playwright PDF engine notice:', err.message);
  }
}

buildPDF().catch(console.error);
