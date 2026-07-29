# Technical Assessment Submission
**Position:** Software Developer (Onsite) - Hyderabad, India

Dear Hiring Team,

Thank you for the opportunity to present my technical project. I am excited to submit my assessment for the Software Developer (Onsite) role. Below is a detailed breakdown of how I have successfully addressed and fulfilled each of the assessment steps.

## Assessment Steps Fulfilled

### 1. Build a Web App (Business Value) Using AI
**Project Name:** Kronos AI - Intelligent Career Assistant & CRM

**Business Value:** Kronos AI solves a massive pain point in the recruitment and job-seeking lifecycle by acting as an autonomous career engine. It scans multiple live job boards (LinkedIn, Indeed, Glassdoor, etc.), evaluates user resumes against job descriptions using AI to generate an ATS Match Score, and automates recruiter outreach via a Kanban CRM. This drastically reduces the time users spend searching for jobs and formatting emails, driving immense value for career management.

**AI Integration:**
- Uses **Anthropic Claude API** to parse resumes and perform dynamic ATS matching against live job descriptions.
- Employs AI to generate customized cold-outreach emails tailored to the specific job listing and the candidate's skills.
- Intelligent data extraction from unstructured job postings.

### 2. Push the Code to GIT
- The complete source code has been pushed and is maintained in a GitHub repository.
- It includes a structured monorepo architecture separating the `frontend` (React/Vite) and `backend` (Express.js/SQLite).
- All changes are strictly version-controlled, following best practices for commits and branching.

### 3. Write CI/CD Pipeline using AI on GIT
- I have engineered a robust CI/CD pipeline using **GitHub Actions**.
- The pipeline (`.github/workflows/ci-cd.yml`) is triggered on every push and pull request to the `main` branch.
- **Pipeline Stages:**
  1. **Build & Verify:** Uses a matrix strategy to test across Node.js 18.x and 20.x. It safely installs all dependencies across the monorepo, executes a production Vite build, and verifies the existence of deployment artifacts (e.g., `dist/index.html`).
  2. **Deployment:** Conditionally triggered upon successful builds for direct deployment.

### 4. Deploy to Vercel Using CI/CD Pipeline
- The application's frontend is fully deployed and hosted on **Vercel**.
- The deployment is fully integrated into the GitHub Actions CI/CD pipeline via the `amondnet/vercel-action@v25` step.
- Every successful build on the `main` branch securely deploys a fresh production build to Vercel using environment secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).
- **Live URL:** [https://kronos-ai-intelligent-career-assist.vercel.app/](https://kronos-ai-intelligent-career-assist.vercel.app/)

### 5. Write Documentation Using AI
- Comprehensive project documentation has been generated and included.
- The `README.md` serves as a master guide, detailing the project architecture, features, tech stack, API endpoints, and instructions for running the application locally.
- This submission document itself outlines the structural alignment of the project with the assessment requirements.

### 6. Send it to Us
- This PDF document and the corresponding links represent the final submission step for the assessment.

---

### Links & Resources
- **Live Frontend (Vercel):** https://kronos-ai-intelligent-career-assist.vercel.app/
- **Live Backend API (Render):** https://kronos-ai-intelligent-career-assistant.onrender.com/health
- **GitHub Repository:** https://github.com/RAVIKIRAN6424/Kronos-AI-Intelligent-Career-Assistant.git

I am looking forward to discussing my project and architecture decisions with the team. Thank you for your time and consideration.

Sincerely,
**Candidate**
