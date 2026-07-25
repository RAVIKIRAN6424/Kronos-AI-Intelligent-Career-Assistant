# ⚡ Kronos AI - Intelligent Career Assistant

[![AWS EC2 Live Deployment](https://img.shields.io/badge/AWS%20EC2%20Live-http%3A%2F%2F65.2.220.208%3A8080-00f2fe?style=for-the-badge&logo=amazonaws)](http://65.2.220.208:8080)
[![Production Status](https://img.shields.io/badge/Status-Live%20%26%20Active-10b981?style=for-the-badge)](http://65.2.220.208:8080)

> **Live AWS Server Link**: [http://65.2.220.208:8080](http://65.2.220.208:8080)

---

## 🚀 Application Overview

**Kronos AI** is an intelligent, autonomous career assistant and job application management platform. Built with a modern cyberpunk glassmorphism interface and interactive particle animation engine, Kronos AI automates job discovery, skill matching, resume customization, and recruiter cold email outreach.

---

## 🌟 Key Application Features

1. **Autonomous Job Scraper Engine**:
   - Automated web scraping using Playwright across tech, engineering, and business job boards.
   - Filter by domain stream (Software, Mechanical, Electrical, Civil, Business, Data Science, Healthcare) and target locations (India Tech Hubs & Global Remote).

2. **AI Resume & Match Scoring Engine**:
   - Claude AI match score calculation (0–100%) against target job descriptions.
   - Skill gap identification and tailored resume optimization suggestions.

3. **Recruiter Cold Email Outreach**:
   - Automated personalized cold outreach email generation.
   - Customized email tones (Formal, Technical, Startup, Executive, Casual).
   - Instant Nodemailer SMTP integration for direct email dispatch.

4. **Interactive CRM & Kanban Board**:
   - Track application stages: Saved, Applied, Interviewing, Offer, Rejected.
   - Recruiter contact management, note taking, and deadline reminders.

5. **Email OTP Authentication**:
   - Secure candidate sign-in with live email OTP generation and verification.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React (Vite), Glassmorphic CSS design system, Interactive 3D Canvas (`RobotBackground`), Lucide Icons.
- **Backend**: Node.js, Express REST API, SQLite (`database.sqlite`).
- **AI & Automation**: Anthropic Claude API, Playwright browser scraping, Nodemailer SMTP, Node-Cron scheduler.

---

## 🌐 Live AWS Hosting Link

- **Live Application URL**: [http://65.2.220.208:8080](http://65.2.220.208:8080)
- **API Endpoint**: [http://65.2.220.208:8080/api](http://65.2.220.208:8080/api)

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git
cd Kronos-AI-Intelligent-Career-Assistant

# 2. Run single-command launcher
run-app.bat
```

Or run manually:

```bash
# Start Backend
cd backend
npm install
npm start

# Start Frontend
cd frontend
npm install
npm run dev
```

---

© 2026 Kronos AI Intelligent Career Assistant. All rights reserved.
