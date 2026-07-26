@echo off
echo =========================================================
echo KRONOS AI CRM - Installation & Dependency Setup
echo =========================================================
echo.
cd /d "%~dp0\.."
echo Installing Root & Backend Dependencies...
call npm install
cd backend
call npm install
cd ..\frontend
echo Installing Frontend Dependencies...
call npm install
cd ..
echo.
echo =========================================================
echo ✅ Installation Complete! Run scripts\run-app.bat to launch.
echo =========================================================
pause
