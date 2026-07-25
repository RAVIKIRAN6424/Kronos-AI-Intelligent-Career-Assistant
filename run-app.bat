@echo off
TITLE Kronos AI CRM - Autonomous Job Search & Cold Outreach Engine
COLOR 0A
cls

echo =========================================================
echo ⚡ KRONOS AI CRM - STARTUP UTILITY
echo =========================================================
echo [1/3] Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH! Please install Node.js v18+.
    pause
    exit /b 1
)

echo [2/3] Verifying and installing dependencies...
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo [3/3] Launching Production Backend Engine & SPA Server (Port 8080)...
start "Kronos AI Engine (Port 8080)" cmd /k "npm start"
timeout /t 2 >nul
start "" "http://localhost:8080"

echo.
echo =========================================================
echo 🚀 KRONOS AI CRM IS LAUNCHED!
echo 🌐 Web App & API : http://localhost:8080
echo =========================================================
echo Keep this window open while using Kronos AI CRM.
pause
