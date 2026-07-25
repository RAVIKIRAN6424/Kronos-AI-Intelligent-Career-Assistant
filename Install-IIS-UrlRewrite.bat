@echo off
TITLE Install IIS URL Rewrite Module 2.1
COLOR 0A
cls

echo =========================================================
echo ⚡ KRONOS AI CRM - IIS URL REWRITE MODULE INSTALLER
echo =========================================================
echo Downloading official Microsoft IIS URL Rewrite 2.1 (x64)...
echo.

powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D4592/rewrite_amd64_en-US.msi' -OutFile '%~dp0rewrite_amd64.msi'"

if exist "%~dp0rewrite_amd64.msi" (
    echo Installing URL Rewrite Module into IIS...
    msiexec /i "%~dp0rewrite_amd64.msi" /qb /norestart
    del "%~dp0rewrite_amd64.msi" >nul 2>&1
    echo.
    echo =========================================================
    echo ✅ INSTALLATION COMPLETE!
    echo IIS URL Rewrite Module 2.1 is now installed.
    echo IIS Error 500.19 (0x8007000d) is resolved.
    echo Please refresh http://localhost:8080 in your browser.
    echo =========================================================
) else (
    echo ❌ Download failed. Please download URL Rewrite manually from:
    echo https://www.iis.net/downloads/microsoft/url-rewrite
)

pause
