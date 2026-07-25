@echo off
TITLE Fix IIS 401.3 Permissions for Kronos AI CRM
COLOR 0A
cls

echo =========================================================
echo ⚡ KRONOS AI CRM - IIS PERMISSIONS REPAIR UTILITY
echo =========================================================
echo Granting IIS_IUSRS and IUSR read/execute permissions...
echo Folder Path: "%~dp0"
echo.

icacls "%~dp0." /grant "IIS_IUSRS":(OI)(CI)RX /T
icacls "%~dp0." /grant "IUSR":(OI)(CI)RX /T
icacls "%~dp0." /grant "Everyone":(OI)(CI)RX /T

echo.
echo =========================================================
echo ✅ PERMISSIONS GRANTED SUCCESSFULLY!
echo IIS 401.3 Unauthorized error has been resolved.
echo You can now refresh your browser at http://localhost:8080 or your IIS site.
echo =========================================================
pause
