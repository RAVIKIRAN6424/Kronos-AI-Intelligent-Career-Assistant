@echo off
title Kronos System Diagnostics
cd /d "%~dp0\.."
echo Running Kronos System Diagnostics...
node backend/src/diagnose.js
pause
