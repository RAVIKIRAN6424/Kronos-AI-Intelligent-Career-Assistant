# 🛠️ Kronos AI - Technology Stack & Dependencies

## 1. Frontend Technologies
- **Framework**: React 18 single-page application built with Vite (`vite@5.4.21`).
- **Styling**: Vanilla Glassmorphic CSS design system with HSL variables (`index.css`).
- **Icons**: Lucide React (`lucide-react@^0.428.0`).
- **Compatibility**: Standalone SystemJS file-protocol execution loader for direct double-click launching.

---

## 2. Backend Technologies
- **Runtime**: Node.js v18 LTS / v20 LTS.
- **Web Framework**: Express.js (`express@^4.19.2`).
- **Database Engine**: SQLite3 (`sqlite3@^5.1.7`) with verbose async wrappers.
- **Environment Management**: `dotenv@^16.4.5`.
- **CORS**: `cors@^2.8.5`.

---

## 3. Automation, AI & Email Libraries
- **Email Library**: Nodemailer (`nodemailer@^6.9.14`) configured for Gmail SMTP SSL Port 465.
- **Web Scraping Engine**: Playwright Chromium (`playwright@^1.46.0`).
- **AI Engine**: Anthropic Claude SDK (`@anthropic-ai/sdk@^0.26.0`).
- **Cron Scheduler**: Node-Cron (`node-cron@^3.0.3`).

---

## 4. Infrastructure & CI/CD
- **Version Control**: Git & GitHub.
- **CI/CD Pipeline**: GitHub Actions (`.github/workflows/ci-cd.yml`).
- **Containerization**: Docker & Docker Compose (`deployment/docker-compose.yml`).
- **Reverse Proxy**: Nginx (`deployment/nginx.conf`).
- **Hosting Platform**: Live Vercel Deployment (`https://kronos-ai-intelligent-career-assist.vercel.app/`).
