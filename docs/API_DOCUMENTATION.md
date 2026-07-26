# 🔌 Kronos AI - REST API Reference Documentation

The Express.js REST API server operates on Port 3001 (or Port 8080 unified). Base Endpoint: `/api`.

---

## 1. Authentication & Email OTP Routes (`/api/auth`)

### `POST /api/auth/send-otp`
- **Description**: Generates a 6-digit numeric OTP and sends an account verification email via Nodemailer Gmail SMTP.
- **Request Body**:
  ```json
  {
    "email": "candidate@domain.com",
    "full_name": "Alex Vance"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Verification code sent to candidate@domain.com. Code expires in 5 minutes.",
    "expires_in": 300
  }
  ```

### `POST /api/auth/verify-otp`
- **Description**: Verifies candidate email + OTP code against non-expired SQLite `otp_codes` records, creates user account, and invalidates code.
- **Request Body**:
  ```json
  {
    "email": "candidate@domain.com",
    "otp": "123456",
    "full_name": "Alex Vance",
    "password": "Password#2026"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "Account verified successfully!",
    "user": { "email": "candidate@domain.com", "full_name": "Alex Vance" }
  }
  ```

### `POST /api/auth/forgot-password`
- **Description**: Sends password reset verification OTP code.

### `POST /api/auth/reset-password`
- **Description**: Verifies reset code and updates candidate password.

---

## 2. Jobs CRM & Multi-Portal Search (`/api/jobs`)

### `GET /api/jobs`
- **Query Params**: `search`, `status`, `category`, `country`, `min_score`.
- **Response**: Array of job objects.

### `POST /api/jobs`
- **Description**: Creates a new job application entry.

### `PUT /api/jobs/:id`
- **Description**: Updates job status (`Saved`, `Applied`, `Interviewing`, `Offer`) or notes.

### `DELETE /api/jobs/:id`
- **Description**: Deletes a job listing.

---

## 3. Email Notification & Log Endpoints (`/api/reports` & `/api/alerts`)

### `POST /api/reports/daily`
- **Description**: Dispatches daily job automation report email with metrics and optional PDF.

### `POST /api/alerts/missing-info`
- **Description**: Dispatches missing profile field alert email when an application requires specific details.

### `POST /api/alerts/application-success`
- **Description**: Dispatches successful job application confirmation email.

### `GET /api/email-logs`
- **Description**: Returns recent email dispatch log history from `email_logs` table.
