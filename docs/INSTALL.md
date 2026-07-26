# Kronos AI CRM - Installation & Setup Guide

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browser**: Google Chrome / Microsoft Edge / Playwright Chromium

---

## 1. Quick Installation (1-Click)
Run `scripts/install.bat` from root or execute in shell:

```bash
npm run install:all
```

This installs root, backend, and frontend dependencies automatically.

---

## 2. Running Locally (Development Mode)

```bash
# Terminal 1: Run Production Build & Node Server
scripts/run-app.bat

# Or run frontend & backend in development mode:
npm run dev:backend
npm run dev:frontend
```

---

## 3. Standalone Double-Click Execution
Double-click `dist/index.html` or `Launch-Kronos-AI-CRM.html` in any web browser. The app runs via built-in SystemJS fallback without requiring a live Web Server.
