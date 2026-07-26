@echo off
title Installing IIS URL Rewrite Module 2.1
cd /d "%~dp0"
echo =========================================================
echo KRONOS AI CRM - IIS URL Rewrite 2.1 Installation
echo =========================================================
echo.
echo Installing rewrite_amd64.msi...
msiexec /i "%~dp0..\..\rewrite_amd64.msi" /qn /norestart
if %ERRORLEVEL% EQU 0 (
    echo ✅ Microsoft IIS URL Rewrite Module 2.1 installed successfully!
) else (
    echo ⚠️ Installer completed with code %ERRORLEVEL%. Please restart IIS Manager.
)
echo.
pause
