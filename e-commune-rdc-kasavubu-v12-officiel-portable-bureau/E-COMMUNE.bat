@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title e-Commune RDC - Kasa-Vubu
color 1F
cls

echo ============================================================
echo        e-COMMUNE RDC - KASA-VUBU
echo        MODE PORTABLE NODE.JS WINDOWS
echo ============================================================
echo.

set "RUNTIME_NODE=%CD%\runtime\node.exe"
if not exist "%RUNTIME_NODE%" (
  echo [INFO] Preparation du moteur Node.js portable...
  call "%CD%\PREPARER-RUNTIME-NODE.bat"
  if errorlevel 1 goto NODE_ERROR
)

"%RUNTIME_NODE%" --version >nul 2>&1
if errorlevel 1 goto NODE_ERROR

echo [OK] Moteur Node.js portable pret.
"%RUNTIME_NODE%" --version
echo [INFO] Demarrage de e-Commune...
echo [INFO] Gardez cette fenetre ouverte pendant l'utilisation.
echo.

"%RUNTIME_NODE%" "%CD%\portable\server.js"
set "ERR=%ERRORLEVEL%"
echo.
if not "%ERR%"=="0" (
  color 4F
  echo [ERREUR] e-Commune s'est arretee avec le code %ERR%.
  echo Consultez logs\demarrage-portable.log si le fichier existe.
  echo.
  pause
)
exit /b %ERR%

:NODE_ERROR
color 4F
echo.
echo [ERREUR] Le moteur Node.js portable n'a pas pu etre prepare.
echo Relancez PREPARER-RUNTIME-NODE.bat avec Internet actif.
echo.
pause
exit /b 1
