# 📁 Kronos AI - Clean Enterprise Folder Structure Map

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
│   │   ├── utils/        # Helper Utilities
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
