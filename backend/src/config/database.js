import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../database.db');
const verboseSqlite = sqlite3.verbose();

export const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
  } else {
    console.log('⚡ Connected to SQLite database at:', dbPath);
  }
});

export const initDb = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1. Users Table (Auth)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          password TEXT,
          age INTEGER,
          phone TEXT,
          verified INTEGER DEFAULT 1,
          target_domain TEXT DEFAULT 'Software',
          experience_years INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Safely ensure password and verified columns exist on existing installations
      db.run(`ALTER TABLE users ADD COLUMN password TEXT`, () => {});
      db.run(`ALTER TABLE users ADD COLUMN verified INTEGER DEFAULT 1`, () => {});

      // 2. OTP Codes Table (Account Verification & Forgot Password)
      db.run(`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          type TEXT DEFAULT 'verification',
          expires_at DATETIME NOT NULL,
          expiry_time DATETIME,
          is_verified INTEGER DEFAULT 0,
          verified INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Safely ensure type, verified, and expiry_time columns exist on existing database installations
      db.run(`ALTER TABLE otp_codes ADD COLUMN type TEXT DEFAULT 'registration'`, () => {});
      db.run(`ALTER TABLE otp_codes ADD COLUMN is_verified INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE otp_codes ADD COLUMN verified INTEGER DEFAULT 0`, () => {});
      db.run(`ALTER TABLE otp_codes ADD COLUMN expiry_time DATETIME`, () => {});
      db.run(`DELETE FROM otp_codes WHERE is_verified = 1 OR expires_at < CURRENT_TIMESTAMP`, () => {});

      // Email Dispatch Logs Table (Step 15)
      db.run(`
        CREATE TABLE IF NOT EXISTS email_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipient TEXT NOT NULL,
          subject TEXT NOT NULL,
          template_type TEXT DEFAULT 'General',
          status TEXT DEFAULT 'success',
          failure_reason TEXT,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 3. Jobs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          company TEXT NOT NULL,
          location TEXT NOT NULL,
          country TEXT DEFAULT 'India',
          category TEXT DEFAULT 'Software',
          url TEXT,
          source TEXT DEFAULT 'Scraper',
          description TEXT,
          match_score INTEGER DEFAULT 0,
          key_skills TEXT,
          salary TEXT,
          posted_date TEXT,
          posted_at DATETIME,
          experience_level TEXT,
          status TEXT DEFAULT 'Saved',
          recruiter_name TEXT,
          recruiter_email TEXT,
          recruiter_status TEXT DEFAULT 'Not Contacted',
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Ensure posted_at and experience_level columns exist on existing installations
      db.run(`ALTER TABLE jobs ADD COLUMN posted_at DATETIME`, () => {});
      db.run(`ALTER TABLE jobs ADD COLUMN experience_level TEXT`, () => {});

      // 4. Candidate Profile Table
      db.run(`
        CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          full_name TEXT,
          email TEXT,
          phone TEXT,
          age INTEGER,
          location TEXT,
          target_domain TEXT,
          target_titles TEXT,
          experience_years INTEGER,
          skills TEXT,
          resume_text TEXT,
          resume_summary TEXT,
          preferred_locations TEXT,
          remote_only INTEGER DEFAULT 0,
          expected_salary TEXT,
          report_email TEXT,
          report_time TEXT,
          report_enabled INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Ensure new email reporting columns exist on existing installations
      db.run(`ALTER TABLE profile ADD COLUMN report_email TEXT`, () => {});
      db.run(`ALTER TABLE profile ADD COLUMN report_time TEXT`, () => {});
      db.run(`ALTER TABLE profile ADD COLUMN report_enabled INTEGER DEFAULT 0`, () => {});

      // 5. Outreach Logs Table
      db.run(`
        CREATE TABLE IF NOT EXISTS outreach_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          job_id INTEGER,
          recipient_email TEXT NOT NULL,
          email_subject TEXT NOT NULL,
          email_body TEXT NOT NULL,
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          status TEXT DEFAULT 'sent',
          template_type TEXT DEFAULT 'Technical',
          response_received INTEGER DEFAULT 0,
          FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE SET NULL
        )
      `);

      // 6. Settings Table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);

      // 7. Connected Job Portals Table (Step 8)
      db.run(`
        CREATE TABLE IF NOT EXISTS connected_portals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          portal_name TEXT UNIQUE NOT NULL,
          is_connected INTEGER DEFAULT 0,
          is_enabled INTEGER DEFAULT 1,
          account_email TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 8. Multi-Role Resumes Table (Step 6 & 7)
      db.run(`
        CREATE TABLE IF NOT EXISTS role_resumes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role_name TEXT UNIQUE NOT NULL,
          file_name TEXT,
          resume_text TEXT,
          ats_score INTEGER DEFAULT 85,
          grammar_score INTEGER DEFAULT 92,
          formatting_score INTEGER DEFAULT 90,
          keyword_score INTEGER DEFAULT 84,
          missing_skills TEXT,
          suggestions TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 9. Automation Engine Settings Table (Step 9)
      db.run(`
        CREATE TABLE IF NOT EXISTS automation_config (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          mode TEXT DEFAULT 'Automatic',
          daily_start_time TEXT DEFAULT '09:00',
          daily_stop_time TEXT DEFAULT '18:00',
          repeat_days TEXT DEFAULT 'Everyday',
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 10. Bot Live Session State (Step 10)
      db.run(`
        CREATE TABLE IF NOT EXISTS bot_engine_state (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          is_running INTEGER DEFAULT 0,
          started_time TEXT,
          current_portal TEXT DEFAULT 'LinkedIn',
          current_job TEXT DEFAULT 'Idle',
          applications_today INTEGER DEFAULT 0,
          last_stopped_time TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 11. AI Chatbot Messages Table (Step 16)
      db.run(`
        CREATE TABLE IF NOT EXISTS chatbot_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sender TEXT NOT NULL,
          text TEXT NOT NULL,
          has_audio INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error initializing tables:', err);
          return reject(err);
        }
        seedDefaults().then(resolve).catch(reject);
      });
    });
  });
};

const seedDefaults = () => {
  return new Promise((resolve) => {
    // Seed Settings
    const defaultSettings = [
      ['claude_api_key', ''],
      ['smtp_host', 'smtp.gmail.com'],
      ['smtp_port', '587'],
      ['smtp_user', 'demo.kronos.ai@gmail.com'],
      ['smtp_pass', ''],
      ['smtp_from', 'Kronos AI Outreach <demo.kronos.ai@gmail.com>'],
      ['auto_scraper_enabled', 'false'],
      ['scraper_interval_hours', '24'],
      ['active_theme', 'cyber-cyan']
    ];

    defaultSettings.forEach(([key, val]) => {
      db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, val]);
    });

    // Seed Default Connected Job Portals (Step 8)
    const portals = [
      ['LinkedIn', 1, 1, 'candidate@linkedin.com'],
      ['Indeed', 1, 1, 'candidate@indeed.com'],
      ['Glassdoor', 1, 1, 'candidate@glassdoor.com'],
      ['Google Jobs', 1, 1, 'candidate@gmail.com'],
      ['Naukri', 0, 1, 'candidate@naukri.com'],
      ['Monster', 0, 0, 'candidate@monster.com']
    ];
    portals.forEach(([pName, conn, enab, email]) => {
      db.run(`INSERT OR IGNORE INTO connected_portals (portal_name, is_connected, is_enabled, account_email) VALUES (?, ?, ?, ?)`, [pName, conn, enab, email]);
    });

    // Seed Default Multi-Role Resumes (Step 6 & 7)
    const defaultResumes = [
      ['Software Engineer', 'Software_Engineer_Resume.pdf', 'Software & Web Specialist proficient in React, Node.js, and Python API development.', 94, 96, 92, 95, 'GraphQL Telemetry, Kubernetes', 'Add quantifiable achievements for microservice latency optimization.'],
      ['Java Developer', 'Java_Developer_Resume.pdf', 'Java Backend Specialist experienced in Spring Boot, Microservices, Hibernate, PostgreSQL, and Enterprise Architecture.', 88, 90, 89, 86, 'Kafka Streaming, Docker Swarm', 'Highlight Spring Security OAuth2 implementation.'],
      ['AWS Engineer', 'AWS_Cloud_Resume.pdf', 'AWS Cloud Architect certified in ECS, Lambda, Terraform, CloudFormation, S3, IAM, and Serverless Infrastructure.', 91, 94, 90, 89, 'CloudWatch Alarms, DynamoDB Streams', 'Include cost-reduction stats for cloud infrastructure.'],
      ['Data Analyst', 'Data_Analyst_Resume.pdf', 'Data Science & BI Analyst proficient in SQL, Python, Pandas, Tableau, PyTorch, and Predictive Churn Models.', 89, 91, 88, 88, 'Snowflake, PowerBI DAX', 'Add regression analysis project benchmarks.'],
      ['Mechanical Engineer', 'Mechanical_Engineer_Resume.pdf', 'CAD & Mechatronics Design Engineer experienced in SolidWorks, Finite Element Analysis (FEA), and Automated CNC Assembly.', 86, 88, 85, 84, 'Ansys Simulation, GD&T', 'Include CAD certifications and manufacturing safety compliance.'],
      ['DevOps Engineer', 'DevOps_Resume.pdf', 'DevOps & CI/CD Specialist proficient in Kubernetes, Terraform, Docker, GitHub Actions, and Prometheus Telemetry.', 92, 93, 91, 92, 'Helm Charts, ArgoCD', 'Mention automated zero-downtime blue/green deployment pipelines.']
    ];
    defaultResumes.forEach(([role, file, txt, ats, gram, fmt, kwd, miss, sug]) => {
      db.run(`INSERT OR IGNORE INTO role_resumes (role_name, file_name, resume_text, ats_score, grammar_score, formatting_score, keyword_score, missing_skills, suggestions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [role, file, txt, ats, gram, fmt, kwd, miss, sug]);
    });

    // Seed Automation Config (Step 9)
    db.run(`INSERT OR IGNORE INTO automation_config (id, mode, daily_start_time, daily_stop_time, repeat_days) VALUES (1, 'Automatic', '09:00', '18:00', 'Everyday')`);

    // Seed Bot Engine State (Step 10)
    db.run(`INSERT OR IGNORE INTO bot_engine_state (id, is_running, started_time, current_portal, current_job, applications_today, last_stopped_time) VALUES (1, 0, NULL, 'LinkedIn', 'Idle', 0, NULL)`);

    // Seed Initial User Profile if empty
    db.get(`SELECT COUNT(*) as count FROM profile`, [], (err, row) => {
      if (!err && row.count === 0) {
        db.run(`
          INSERT INTO profile (
            id, full_name, email, phone, age, location, target_domain, target_titles, experience_years,
            skills, resume_text, resume_summary, preferred_locations, remote_only, expected_salary
          ) VALUES (
            1, 'RAVI KIRAN MADASU', 'ravikiran@kronos-ai.io', '+91 XXXXX XXXXX', 26, 'Bengaluru, India', 'Software',
            'Full Stack Developer, Senior Software Engineer, Mechanical Lead', 4,
            'React, Node.js, Python, SolidWorks, System Design, SQL, Docker',
            'Candidate Software & Engineering Specialist proficient in modern frameworks, system architecture, and domain development.',
            'Experienced developer & engineer specializing in scalable systems, React, Express, Python, and CAD deployments.',
            'Bengaluru, Mumbai, Hyderabad, Pune, Remote, USA, United Kingdom', 1, '₹18,000,000 - ₹28,000,000 PA / $110,000 USD'
          )
        `);
      }
    });

    // Seed Sample Jobs across multiple domains (Software, Mechanical, Electrical, Civil, Business, Data Science)
    db.get(`SELECT COUNT(*) as count FROM jobs`, [], (err, row) => {
      if (!err && row.count === 0) {
        const seedJobs = [
          {
            title: 'Lead AI & Full Stack Architect',
            company: 'Nexus Cybernetics',
            location: 'Bengaluru, Karnataka',
            country: 'India',
            category: 'Software',
            url: 'https://linkedin.com/jobs/sample-1',
            source: 'LinkedIn',
            description: 'Architecting intelligent CRM dashboards, Node.js REST services, React frontend with dynamic canvas visualizations, and integration with Anthropic Claude API for autonomous outreach.',
            match_score: 96,
            key_skills: 'React, Node.js, Express, Anthropic API, Systems Design, SQLite',
            salary: '₹24,000,000 - ₹32,000,000 PA',
            posted_date: '2 days ago',
            status: 'Applied',
            recruiter_name: 'Dr. Sarah Connor',
            recruiter_email: 'sarah.connor@nexuscyber.io',
            recruiter_status: 'Contacted',
            notes: 'Applied via online portal. Followed up with personalized cold email regarding AI agent design.'
          },
          {
            title: 'Senior Automation & Robotics Engineer',
            company: 'Precision Mechanics India',
            location: 'Pune, Maharashtra',
            country: 'India',
            category: 'Mechanical',
            url: 'https://indeed.com/jobs/sample-2',
            source: 'Indeed',
            description: 'Designing high-precision CNC automation components, mechatronics control loops, thermal stress analysis, and hydraulic actuation systems for electric vehicle manufacturing assembly.',
            match_score: 88,
            key_skills: 'CAD, SolidWorks, Robotics, Mechatronics, MATLAB, Thermal Analysis',
            salary: '₹14,000,000 - ₹20,000,000 PA',
            posted_date: '1 day ago',
            status: 'Saved',
            recruiter_name: 'Vikram Sharma',
            recruiter_email: 'v.sharma@precisionmech.in',
            recruiter_status: 'Not Contacted',
            notes: 'Requires CAD certification and 3+ years experience in automated assembly lines.'
          },
          {
            title: 'Lead Power Distribution & Embedded Engineer',
            company: 'Voltaic Grid Dynamics',
            location: 'Hyderabad, Telangana',
            country: 'India',
            category: 'Electrical',
            url: 'https://glassdoor.com/jobs/sample-3',
            source: 'Glassdoor',
            description: 'Managing high-voltage grid telemetry, IoT microcontrollers (ESP32/ARM Cortex), PCB layout design in Altium, and smart sensor signal analysis for renewable energy distribution.',
            match_score: 91,
            key_skills: 'PCB Layout, Altium, Embedded C++, Microcontrollers, Smart Grids',
            salary: '₹18,000,000 - ₹25,000,000 PA',
            posted_date: '3 days ago',
            status: 'Interviewing',
            recruiter_name: 'Ananya Roy',
            recruiter_email: 'ananya.roy@voltaicgrid.com',
            recruiter_status: 'Replied',
            notes: 'Round 1 technical phone screen completed. Technical design assignment scheduled for Friday.'
          },
          {
            title: 'Structural Systems Project Lead',
            company: 'Skyscraper Infra Tech',
            location: 'Mumbai, Maharashtra',
            country: 'India',
            category: 'Civil',
            url: 'https://google.com/jobs/sample-4',
            source: 'Google Jobs',
            description: 'Overseeing structural design validation, Primavera P6 scheduling, reinforced concrete load testing, and BIM modeling (Revit) for high-rise commercial smart towers.',
            match_score: 82,
            key_skills: 'AutoCAD, Revit BIM, Structural Engineering, Primavera P6, Construction Safety',
            salary: '₹16,000,000 - ₹22,000,000 PA',
            posted_date: '4 days ago',
            status: 'Saved',
            recruiter_name: 'Rajesh Kulkarni',
            recruiter_email: 'rajesh.k@skyscraperinfra.com',
            recruiter_status: 'Not Contacted',
            notes: 'Project site in BKC Mumbai. Highly interested in green building certification experience.'
          },
          {
            title: 'Global Growth Strategy Manager',
            company: 'Aetheria Business Solutions',
            location: 'Gurugram / NCR',
            country: 'India',
            category: 'Business',
            url: 'https://linkedin.com/jobs/sample-5',
            source: 'LinkedIn',
            description: 'Driving cross-border revenue operations, B2B SaaS partnership development, financial forecasting models, and executive pitch presentations for APAC market expansion.',
            match_score: 89,
            key_skills: 'B2B Sales, Market Analysis, Financial Modeling, Executive Pitching, CRM Operations',
            salary: '₹22,000,000 - ₹30,000,000 PA',
            posted_date: 'Just now',
            status: 'Offer',
            recruiter_name: 'Jennifer Aniston',
            recruiter_email: 'jennifer@aetheriasolutions.com',
            recruiter_status: 'Replied',
            notes: 'Received initial offer letter. Negotiating relocation allowance and remote flex options.'
          },
          {
            title: 'Staff Machine Learning & Data Scientist',
            company: 'Hyperion Analytics Corp',
            location: 'San Francisco, CA (Remote)',
            country: 'United States',
            category: 'Data Science',
            url: 'https://google.com/jobs/sample-6',
            source: 'Google Jobs',
            description: 'Building PyTorch LLM fine-tuning pipelines, vector embeddings with Pinecone/PGVector, customer churn predictive models, and real-time streaming analytics in Apache Kafka.',
            match_score: 95,
            key_skills: 'Python, PyTorch, LLMs, Vector DBs, SQL, Distributed Systems, MLops',
            salary: '$140,000 - $185,000 USD',
            posted_date: '5 hours ago',
            status: 'Saved',
            recruiter_name: 'Marcus Brody',
            recruiter_email: 'm.brody@hyperionanalytics.com',
            recruiter_status: 'Not Contacted',
            notes: 'Remote position with US working hours. Excellent compensation and stock package.'
          }
        ];

        const stmt = db.prepare(`
          INSERT INTO jobs (
            title, company, location, country, category, url, source, description, match_score,
            key_skills, salary, posted_date, status, recruiter_name, recruiter_email, recruiter_status, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        seedJobs.forEach(job => {
          stmt.run([
            job.title, job.company, job.location, job.country, job.category, job.url, job.source,
            job.description, job.match_score, job.key_skills, job.salary, job.posted_date,
            job.status, job.recruiter_name, job.recruiter_email, job.recruiter_status, job.notes
          ]);
        });
        stmt.finalize();
      }
      resolve();
    });
  });
};

// Helper async DB wrappers
function sanitizeParams(params) {
  if (!Array.isArray(params)) return [];
  return params.map(p => (p === undefined ? null : p));
}

export const query = (sql, params = []) => {
  const cleanParams = sanitizeParams(params);
  return new Promise((resolve, reject) => {
    db.all(sql, cleanParams, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  const cleanParams = sanitizeParams(params);
  return new Promise((resolve, reject) => {
    db.get(sql, cleanParams, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  const cleanParams = sanitizeParams(params);
  return new Promise((resolve, reject) => {
    db.run(sql, cleanParams, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};
