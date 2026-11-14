@echo off
cd /d "%~dp0"
echo Starting blog admin panel...
node "%~dp0tools\admin.js"
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js not found or admin.js failed.
  pause
)
