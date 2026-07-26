# 💻 Kronos AI - Installation & Setup Guide

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Browser**: Google Chrome / Microsoft Edge / Playwright Chromium

---

## 1. Quick 1-Click Installation (Windows Batch)

Run `scripts/install.bat` from root or execute in shell:

```bash
# Step 1: Install all dependencies (root, backend, frontend)
scripts/install.bat

# Step 2: Launch application server & browser
scripts/run-app.bat
```

---

## 2. Manual Step-by-Step Installation

### Step A: Clone Repository
```bash
git clone https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git
cd Kronos-AI-Intelligent-Career-Assistant
```

### Step B: Install Root & Subproject Dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### Step C: Configure Environment Variables (`backend/.env`)
Create `backend/.env` with your Gmail credentials:

```env
PORT=3001
NODE_ENV=production
EMAIL_USER=kronosai6424@gmail.com
EMAIL_PASS=atzr geyq ytdu eovb
DATABASE_PATH=./database.db
```

### Step D: Build Production Bundle & Start Backend Server
```bash
npm run build
npm start
```

### Step E: Open Web Application
Navigate to [http://localhost:8080](http://localhost:8080) in your web browser.
