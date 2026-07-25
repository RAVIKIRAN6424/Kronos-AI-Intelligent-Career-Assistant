# ⚡ Kronos AI CRM - Autonomous AI Job Search & Cold Outreach Engine

[![Live AWS Server](https://img.shields.io/badge/AWS%20EC2%20Live-http%3A%2F%2F65.2.220.208%3A8080-00f2fe?style=for-the-badge&logo=amazonaws)](http://65.2.220.208:8080)
[![Production Ready](https://img.shields.io/badge/Production-IIS%20%2B%20Express%20%2B%20React-10b981?style=for-the-badge)](http://65.2.220.208:8080)

**Live AWS Server**: [http://65.2.220.208:8080](http://65.2.220.208:8080)

Kronos AI CRM is a state-of-the-art, full-stack AI career automation platform. It features a dark cyberpunk glassmorphism UI with interactive 3D particle canvas effects (`RobotBackground.jsx`), multi-industry job stream support (Software, Mechanical, Electrical, Civil, Business, Data Science, Finance, Healthcare), multi-country location targeting (India metro hubs + International), email OTP authentication, automated Playwright web scraping, Anthropic Claude AI match scoring & cold email synthesis, Nodemailer SMTP dispatching, IIS / EC2 deployment rules, and background cron scheduling.

---

## 🌐 Live AWS Production Server

The application is deployed live on AWS EC2:
- **AWS Server URL**: [http://65.2.220.208:8080](http://65.2.220.208:8080)
- **API Base Endpoint**: [http://65.2.220.208:8080/api](http://65.2.220.208:8080/api)
- **Health Check**: [http://65.2.220.208:8080/health](http://65.2.220.208:8080/health)

---

## 🚀 Quick Start Guide

### Option 1: Automated Windows Launcher
Double-click `run-app.bat` or run in terminal:
```cmd
run-app.bat
```
This script will automatically:
1. Verify Node.js environment.
2. Install backend and frontend dependencies if needed (`npm install`).
3. Boot the unified production engine on **http://localhost:8080**.

---

### Option 2: Manual Installation & Startup

#### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend API will start at `http://localhost:5000`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web UI will start at `http://localhost:5173`.

---

## 🛠️ System Health & Diagnostics

Run system diagnostics script to verify SQLite database connection, SMTP credentials, port availability, and Anthropic API key authorization:
```cmd
diagnose.bat
```

---

## 🌟 Key System Features

1. **Cyberpunk Glassmorphism UI & Interactive 3D Canvas**:
   - Custom HTML5 particle mesh & cyber robot avatar reacting to mouse movements.
   - Dynamic theme swapper: Cyber Cyan, Neon Violet, Emerald Grid, Solar Gold, Crimson Void.

2. **Authentication & Domain Onboarding**:
   - Email sign-in with live OTP email dispatch & verification.
   - Candidate onboarding wizard for domain selection, location preferences, and age/phone details.

3. **Multi-Domain & Multi-Location Support**:
   - Multi-industry streams: Software Engineering, Mechanical Engineering, Electrical & Power, Civil Infrastructure, Business & Sales Management, Data Science & AI.
   - Target locations: India hubs (Bengaluru, Mumbai, Pune, Delhi NCR, Hyderabad, Chennai) + Global (US, UK, Canada, Germany, UAE, Singapore, Remote).

4. **Jobs CRM Pipeline**:
   - Filterable Data Table and Kanban board (Saved, Applied, Interviewing, Offer, Rejected).
   - Real-time match score progress bars, recruiter email triggers, and note editing modals.

5. **Live Playwright Job Scraper**:
   - Headless browser automated scraping across public search aggregators and live boards.
   - Keyword, domain stream, and location customization.

6. **Anthropic Claude AI Integration**:
   - Match Score (0-100%) and skill gap analysis.
   - Hyper-personalized cold outreach email generator with tone customization (Formal, Technical, Startup, Casual, Executive).
   - Built-in smart offline heuristic fallback engine when API key is not provided.

7. **Email Dispatcher & Automation**:
   - Nodemailer SMTP dispatcher for live email delivery to recruiter contacts and verification OTPs.
   - Node-Cron scheduler for automated background scraping tasks.

---

## 📁 Repository Structure
```
c:\AI-JOB-APPLICATION/
├── backend/
│   ├── src/
│   │   ├── config/database.js    # SQLite schema & seed data
│   │   ├── routes/auth.js        # Email OTP Auth endpoints
│   │   ├── routes/api.js         # RESTful endpoints
│   │   ├── services/
│   │   │   ├── aiService.js      # Anthropic Claude API & Heuristics
│   │   │   ├── scraperService.js # Playwright Web Scraper
│   │   │   ├── emailService.js   # Nodemailer SMTP engine
│   │   │   └── schedulerService.js # Node-cron background jobs
│   │   ├── utils/otpHelper.js    # OTP generation & validation
│   │   ├── diagnose.js           # Diagnostics runner
│   │   └── server.js             # Express app entrypoint
│   ├── database.db               # SQLite Database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # RobotBackground, Navbar, AuthModal, etc.
│   │   ├── views/                # Dashboard, Jobs CRM, Scraper, AI Outreach, etc.
│   │   ├── utils/api.js          # Fetch client wrapper
│   │   ├── index.css             # Glassmorphic CSS design system & themes
│   │   ├── App.jsx               # Main React Application
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── run-app.bat                   # Double-process Windows launcher
├── diagnose.bat                  # Diagnostic utility launcher
└── README.md
```

---

© 2026 Kronos AI CRM. All rights reserved.
