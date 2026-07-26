# 🏗️ Kronos AI - Project Architecture & Data Flow

## 1. System Overview

Kronos AI is designed as a decoupled, multi-tier Web & AI Application consisting of:
- **Presentation Tier**: React 18 single-page application built with Vite and custom glassmorphism CSS.
- **Application Tier**: Express.js REST API server handling authentication, job scraping, AI score analysis, email scheduling, and chatbot interactions.
- **Data Tier**: SQLite database (`database.db`) storing candidate profiles, job postings, multi-role resumes, email logs, and campaign states.
- **Integration Services**: Nodemailer (Gmail SMTP SSL), Anthropic Claude API, Playwright browser scraper.

---

## 2. Component Interaction & Flow

```
+-------------------------------------------------------------------+
|                           REACT FRONTEND                          |
|  (App.jsx, AuthModal, SearchView, Resumes, Jobs CRM, Analytics)  |
+--------------------------------─┬─────────────────────────────────+
                                  │ HTTP / REST API (fetch)
                                  ▼
+-------------------------------------------------------------------+
|                        EXPRESS.JS BACKEND                         |
|  (server.js, apiRoutes, authRoutes, emailService, scraperService) |
+--------┬──────────────────┬──────────────────┬─────────────────┬--+
         │                  │                  │                 │
         ▼                  ▼                  ▼                 ▼
+─────────────────+ +---------------+ +─────────────────+ +─────────────+
| SQLite Database | | Claude AI API | | Nodemailer SMTP | | Playwright  |
|  (database.db)  | |  (AI Scoring) | |  (Gmail SSL)    | |  (Scraper)  |
+─────────────────+ +---------------+ +─────────────────+ +─────────────+
```

---

## 3. Core Subsystems

### A. Authentication & Verification Subsystem
- Candidate enters registration details.
- Express API generates a secure 6-digit random OTP and stores it in `otp_codes` table with a 5-minute expiry.
- Nodemailer sends an HTML email template via Gmail SMTP Port 465 SSL.
- OTP verification creates user account, updates candidate profile, and invalidates the code.

### B. Multi-Portal Job Scraper Subsystem
- Playwright launches headless browser instances to scan job postings across LinkedIn, Indeed, Glassdoor, Naukri, Monster, and Google Jobs.
- Deduplication filter compares existing titles and companies in SQLite before inserting new entries.

### C. ATS & Match Analysis Subsystem
- Analyzes candidate skills and resume text against job requirements using Anthropic Claude API.
- Generates ATS score breakdown (Grammar, Formatting, Keyword Match, Missing Skills, Suggestions).

### D. Automated Email Notification Subsystem
- Dispatches Daily Job Summary Reports, Missing Profile Field Alerts, and Application Success Confirmation emails.
- Logs all mail attempts in `email_logs` table.
