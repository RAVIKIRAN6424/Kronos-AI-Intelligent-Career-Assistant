# Kronos AI CRM - REST API Reference

The Kronos AI CRM backend is built on Express.js and SQLite3. Base API Endpoint: `http://localhost:3001/api` (or relative `/api`).

---

## 1. System & Health Endpoints
- **`GET /api/health`**
  - Returns backend server status, timestamp, and active environment.
- **`GET /api/diagnose`**
  - Runs system diagnostic check for SQLite database, Playwright browser, and SMTP credentials.

---

## 2. Job CRM Endpoints
- **`GET /api/jobs`**
  - Fetches all tracked jobs.
- **`GET /api/jobs/recent`**
  - Returns recent job opportunities across active portals.
- **`POST /api/jobs`**
  - Adds a new job listing.
- **`PUT /api/jobs/:id`**
  - Updates job status (`Saved`, `Applied`, `Interviewing`, `Offer`), recruiter details, or notes.
- **`DELETE /api/jobs/:id`**
  - Deletes a job entry by ID.
- **`POST /api/jobs/deduplicate`**
  - Removes duplicate job records from database.

---

## 3. Scraper Endpoints
- **`POST /api/scrape`**
  - Triggers Playwright live scraper for specified keywords, location, and country across multi-portal targets.

---

## 4. AI & Outreach Endpoints
- **`POST /api/ai/analyze`**
  - Generates ATS score analysis, skill gap matches, and keyword recommendations.
- **`POST /api/ai/generate-email`**
  - Generates personalized cold email templates for technical, referral, or executive outreach.
- **`POST /api/outreach/send`**
  - Sends email via Nodemailer SMTP and logs outreach history.

---

## 5. Candidate Profile & Resumes Endpoints
- **`GET /api/profile`** & **`PUT /api/profile`**
  - Fetches and updates target titles, preferred locations, and skills.
- **`GET /api/resumes`** & **`POST /api/resumes`**
  - Manages role-specific resumes and ATS optimization scores.

---

## 6. Automation & Settings Endpoints
- **`GET /api/portals`** & **`PUT /api/portals/:id`**
  - Retrieves connected portals status and updates login credential states.
- **`GET /api/settings`** & **`PUT /api/settings`**
  - Manages SMTP server credentials, Claude API keys, and background cron schedules.
