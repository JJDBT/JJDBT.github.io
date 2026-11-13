@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 博客管理面板

echo.
echo   正在启动博客管理面板...
echo.

start "" /b cmd /c "timeout /t 2 >nul & start http://127.0.0.1:4321/"

node "%~dp0tools\admin.js"

if errorlevel 1 (
  echo.
  echo   面板启动失败，请确认已安装 Node.js。
  echo.
  pause
)
