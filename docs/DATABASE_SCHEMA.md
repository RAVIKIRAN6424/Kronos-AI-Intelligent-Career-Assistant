# 🗄️ Kronos AI - Database Schema Documentation

Database Engine: **SQLite 3** (`database.db`).

---

## 1. Tables Overview

### `users` (Candidate Accounts)
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `email`: TEXT UNIQUE NOT NULL
- `full_name`: TEXT
- `age`: INTEGER
- `phone`: TEXT
- `target_domain`: TEXT DEFAULT 'Software'
- `experience_years`: INTEGER DEFAULT 0
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### `otp_codes` (Verification Codes)
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `email`: TEXT NOT NULL
- `code`: TEXT NOT NULL
- `type`: TEXT DEFAULT 'registration'
- `expires_at`: DATETIME NOT NULL
- `is_verified`: INTEGER DEFAULT 0
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### `jobs` (Tracked Job Applications)
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `title`: TEXT NOT NULL
- `company`: TEXT NOT NULL
- `location`: TEXT NOT NULL
- `country`: TEXT DEFAULT 'India'
- `category`: TEXT DEFAULT 'Software'
- `url`: TEXT
- `source`: TEXT DEFAULT 'Scraper'
- `description`: TEXT
- `match_score`: INTEGER DEFAULT 0
- `key_skills`: TEXT
- `salary`: TEXT
- `posted_date`: TEXT
- `status`: TEXT DEFAULT 'Saved'
- `recruiter_name`: TEXT
- `recruiter_email`: TEXT
- `recruiter_status`: TEXT DEFAULT 'Not Contacted'
- `notes`: TEXT
- `created_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### `role_resumes` (Multi-Role Resumes & ATS Scores)
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `role_name`: TEXT UNIQUE NOT NULL
- `file_name`: TEXT
- `resume_text`: TEXT
- `ats_score`: INTEGER DEFAULT 85
- `grammar_score`: INTEGER DEFAULT 92
- `formatting_score`: INTEGER DEFAULT 90
- `keyword_score`: INTEGER DEFAULT 84
- `missing_skills`: TEXT
- `suggestions`: TEXT
- `updated_at`: DATETIME DEFAULT CURRENT_TIMESTAMP

### `email_logs` (Nodemailer Mail History)
- `id`: INTEGER PRIMARY KEY AUTOINCREMENT
- `recipient`: TEXT NOT NULL
- `subject`: TEXT NOT NULL
- `template_type`: TEXT DEFAULT 'General'
- `status`: TEXT DEFAULT 'success'
- `failure_reason`: TEXT
- `sent_at`: DATETIME DEFAULT CURRENT_TIMESTAMP
