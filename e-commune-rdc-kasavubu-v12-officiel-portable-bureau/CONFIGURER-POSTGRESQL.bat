@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Configuration PostgreSQL e-Commune
color 1F

cls
echo ============================================================
echo        CONFIGURATION POSTGRESQL LOCAL e-COMMUNE
echo ============================================================
echo.
echo Ce programme n'utilise pas Docker.
echo Il configure PostgreSQL installe directement sous Windows.
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "scripts\windows\Postgres-ECommune.ps1" -Action Ensure -Reconfigure
if errorlevel 1 (
  color 4F
  echo.
  echo [ERREUR] Configuration PostgreSQL non terminee.
  pause
  exit /b 1
)

echo.
echo [OK] PostgreSQL local est configure pour e-Commune.
echo Vous pouvez maintenant double-cliquer sur E-COMMUNE.bat
pause
exit /b 0
