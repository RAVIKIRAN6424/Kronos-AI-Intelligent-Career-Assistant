# ⚡ Kronos AI - Intelligent Career Assistant & CRM

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Deployment-00f2fe?style=for-the-badge&logo=vercel)](https://kronos-ai-intelligent-career-assist.vercel.app/)
[![Production Status](https://img.shields.io/badge/Status-Live%20%26%20Active-10b981?style=for-the-badge)](https://kronos-ai-intelligent-career-assist.vercel.app/)
[![Node.js CI/CD](https://img.shields.io/badge/CI%2FCD-Node.js%20Pipeline-9d4edd?style=for-the-badge&logo=githubactions)](https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant/actions)
[![License](https://img.shields.io/badge/License-MIT-fbbf24?style=for-the-badge)](LICENSE)

> **Live Hosted URL**: [https://kronos-ai-intelligent-career-assist.vercel.app/](https://kronos-ai-intelligent-career-assist.vercel.app/)  
> **GitHub Repository**: [https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git](https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git)

---

## 📌 Executive Summary

**Kronos AI** is an autonomous career intelligence system and job application management CRM. Designed with a glassmorphic interface and interactive 3D particle canvas (`RobotBackground`), Kronos AI automates job discovery, ATS resume matching, cold email recruiter outreach, and application tracking.

---

## 🏛️ Project Architecture

```
                                  ┌────────────────────────┐
                                  │   Browser / React UI   │
                                  └───────────┬────────────┘
                                              │
                                              ▼
                                ┌───────────────────────────┐
                                │ Express.js REST API Server│
                                └─────────────┬─────────────┘
                                              │
         ┌────────────────────────┬───────────┴────────────┬────────────────────────┐
         │                        │                        │                        │
         ▼                        ▼                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ SQLite Database │      │  Claude AI API  │      │ Playwright Engine│      │  Nodemailer SMTP│
│ (database.db)   │      │ (ATS & Match)   │      │ (Multi Scraper) │      │  (Gmail SSL)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## 🌟 Key Application Features

1. **🎨 8 Dynamic Visual Themes**:
   - **Cyber Cyan** (High-tech navy & electric cyan)
   - **Neon Violet** (Midnight purple & outrun magenta)
   - **Emerald Grid** (Matrix green)
   - **Solar Gold** (Royal obsidian & sunburst gold)
   - **Crimson Void** (Cyber red)
   - **Cyber Synthwave** (Sunset pink)
   - **Midnight Matrix** (Bio-luminescent green)
   - **Hyper Crimson** (Fiery magma red)

2. **🔍 Multi-Portal Job Search & Generator**:
   - Live job scanning across LinkedIn, Indeed, Glassdoor, Naukri, Monster, and Google Jobs.
   - Filter by domain stream (Software, Mechanical, Electrical, Civil, Business, Data Science) and location.

3. **📄 Multi-Role Resumes & ATS Scoring**:
   - Role-specific resume management (Software Engineer, Java Developer, AWS Architect, DevOps, Mechanical Engineer, Data Analyst).
   - Truthful ATS match score evaluation (0-100%) and dark glass text area editor.

4. **✉️ Nodemailer Email System & OTP Verification**:
   - Gmail SMTP integration (`smtp.gmail.com:465` SSL).
   - 6-digit random OTP account verification and password reset.
   - Automatic 60-second OTP resend cooldown timer.
   - Daily job summary reports, missing profile field alerts, and application submission notifications.

5. **📊 Kanban Application CRM & Funnel Intelligence**:
   - Conversion metrics (Saved, Applied, Interviewing, Offer).
   - Recruiter email outreach generator and Nodemailer dispatch logging.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Glassmorphic CSS design system, HTML5, Lucide Icons, SystemJS.
- **Backend**: Node.js, Express.js REST API, SQLite3 (`database.db`), dotenv.
- **AI & Services**: Anthropic Claude API, Playwright browser scraper, Nodemailer, Node-Cron scheduler.
- **CI/CD & Hosting**: GitHub Actions, Docker, Nginx, Vercel (`https://kronos-ai-intelligent-career-assist.vercel.app/`).

---

## 📂 Enterprise Folder Structure

```
Kronos-AI/
│
├── frontend/             # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/   # UI Components (AuthModal, Navbar, RobotBackground)
│   │   ├── pages/        # Page Views (Landing, Dashboard, Jobs CRM, Portals, Resumes, etc.)
│   │   ├── layouts/      # App Layout wrappers
│   │   ├── hooks/        # Custom React hooks (useTheme)
│   │   ├── context/      # Context state providers
│   │   ├── services/     # API Client Service (api.js)
│   │   ├── utils/        # Utilities
│   │   └── styles/       # Design System & 8 Visual Themes (index.css)
│   ├── public/           # Static public assets
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/              # Node.js + Express REST API Server
│   ├── src/
│   │   ├── controllers/  # Route Controllers
│   │   ├── routes/       # Express API Endpoints (api.js, auth.js)
│   │   ├── middleware/   # Logger & Auth Middlewares
│   │   ├── models/       # Data Models
│   │   ├── services/     # Scraper, AI & Nodemailer Email Services
│   │   ├── database/     # SQLite Connector
│   │   ├── config/       # App Configuration (database.js)
│   │   ├── uploads/      # Uploaded Resume Documents
│   │   └── server.js     # Server Entrypoint
│   ├── database.db       # SQLite Database
│   ├── package.json
│   └── .env.example
│
├── docs/                 # Documentation Bundle
│   ├── ARCHITECTURE.md
│   ├── FEATURES.md
│   ├── TECH_STACK.md
│   ├── INSTALLATION.md
│   ├── FOLDER_STRUCTURE.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── CICD_EXPLANATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SCREENSHOTS.md
│   └── FUTURE_ENHANCEMENTS.md
│
├── scripts/              # Operational Utility Scripts
│   ├── run-app.bat       # 1-Click App Launcher
│   ├── install.bat       # Dependency Installer
│   ├── diagnose.bat      # System Diagnostic Utility
│   └── sync-dist.js      # Production Build Synchronizer
│
├── deployment/           # Infrastructure & Server Configuration
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── web.config
│
├── .github/              # GitHub Actions CI/CD Workflows
│   └── workflows/
│       └── ci-cd.yml
│
├── .gitignore
├── LICENSE
├── package.json
└── README.md
```

---

## 💻 Installation & Setup Guide

### Quick 1-Click Installation
```bash
# Clone Repository
git clone https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git
cd Kronos-AI-Intelligent-Career-Assistant

# Install All Dependencies (Root, Backend, Frontend)
scripts/install.bat

# Launch Application (Port 8080 & Port 3001)
scripts/run-app.bat
```

### Manual Installation
```bash
# Install Dependencies
npm install
npm --prefix backend install
npm --prefix frontend install

# Build Production Assets
npm run build

# Start Backend Server
npm start
```

---

## 🗄️ Database Schema Summary

The SQLite database (`database.db`) manages 11 normalized tables:
- `users`: Candidate credentials and profiles.
- `otp_codes`: 6-digit random OTP verification codes with expiration.
- `jobs`: Tracked job applications and match scores.
- `profile`: Extended candidate experience, skills, and target roles.
- `role_resumes`: Role-specific resume texts and ATS scores.
- `connected_portals`: Integrated search portal account status.
- `outreach_logs`: Recruiter email dispatch history.
- `email_logs`: Nodemailer SMTP email dispatch logs.
- `automation_config`: Automation schedules and modes.
- `bot_engine_state`: Live campaign execution states.
- `chatbot_messages`: AI assistant message history.

---

## ⚙️ CI/CD Pipeline & Deployment

### GitHub Actions Pipeline ([.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml))
- Triggered on `push` and `pull_request` to `main` branch.
- Matrix testing across Node.js `18.x` and `20.x`.
- Executes dependency installation, Vite compilation, and build verification.

### Live Vercel Deployment
- **Live Hosted URL**: [https://kronos-ai-intelligent-career-assist.vercel.app/](https://kronos-ai-intelligent-career-assist.vercel.app/)
- **Reverse Proxy & Edge Network**: Vercel Serverless Edge Network forwarding static assets and API routes (`/api`).

---

## 🔮 Future Enhancements

1. **OAuth2 Social Sign-In**: Integrate Google and LinkedIn OAuth2 authentication.
2. **Auto-Apply Browser Extension**: Chrome Extension for 1-click Easy Apply auto-filling.
3. **Advanced AI Voice Bot**: Real-time voice interview simulation using Web Speech API.
4. **Multi-Tenant Enterprise Dashboard**: Recruiter-facing analytics and team collaboration.

---

© 2026 Kronos AI Systems. Licensed under [MIT License](LICENSE).
