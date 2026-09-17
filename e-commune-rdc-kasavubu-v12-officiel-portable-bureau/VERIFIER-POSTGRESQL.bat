@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Verification PostgreSQL e-Commune
color 1F

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "scripts\windows\Postgres-ECommune.ps1" -Action Test
if errorlevel 1 (
  color 4F
  echo.
  echo PostgreSQL n'est pas pret. Lancez CONFIGURER-POSTGRESQL.bat
  pause
  exit /b 1
)

echo.
echo [OK] PostgreSQL est accessible.
pause
exit /b 0
