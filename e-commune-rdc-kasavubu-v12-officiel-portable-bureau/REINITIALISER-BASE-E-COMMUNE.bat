@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Reinitialisation PostgreSQL e-Commune
color 4F

cls
echo ============================================================
echo       ATTENTION - REINITIALISATION BASE e-COMMUNE
echo ============================================================
echo.
echo Cette operation SUPPRIME toutes les donnees locales de la base
echo ecommune_kasavubu puis recree le pilote Kasa-Vubu.
echo Aucun Docker n'est utilise.
echo.
set /p CONFIRM=Tapez OUI pour continuer : 
if /I not "%CONFIRM%"=="OUI" (
  echo Operation annulee.
  pause
  exit /b 0
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "scripts\windows\Postgres-ECommune.ps1" -Action Reset
if errorlevel 1 (
  echo.
  echo [ERREUR] Echec de la reinitialisation PostgreSQL.
  pause
  exit /b 1
)

echo.
echo [OK] Base locale recreee. Relancez E-COMMUNE.bat
pause
exit /b 0
