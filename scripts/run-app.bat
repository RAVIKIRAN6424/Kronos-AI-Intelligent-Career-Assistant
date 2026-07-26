@echo off
title KRONOS AI CRM Launcher
cd /d "%~dp0\.."
echo =========================================================
echo KRONOS AI CRM — Autonomous Career Engine
echo =========================================================
echo.
echo [1/3] Building Production Bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed. Launching standalone frontend fallback...
)

echo.
echo [2/3] Starting Express Backend Server (Port 3001)...
start "Kronos Express Backend API" cmd /k "npm --prefix backend start"

echo.
echo [3/3] Launching Web Application...
timeout /t 2 >nul
start http://localhost:8080/
start http://localhost:3001/

echo.
echo =========================================================
echo 🎉 Kronos AI Engine is running!
echo • App Dashboard: http://localhost:8080/
echo • Express API:   http://localhost:3001/api/health
echo =========================================================
pause
