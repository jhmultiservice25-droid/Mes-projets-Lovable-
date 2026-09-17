@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title Diagnostic e-Commune RDC
cls

echo ============================================================
echo              DIAGNOSTIC e-COMMUNE RDC
echo ============================================================
echo.

if not exist "portable\server.js" (
  echo [ECHEC] portable\server.js est absent.
  goto END
)
echo [OK] Serveur portable present.

if not exist "runtime\node.exe" (
  echo [INFO] Runtime Node.js portable absent. Preparation...
  call "PREPARER-RUNTIME-NODE.bat"
  if errorlevel 1 (
    echo [ECHEC] Runtime Node.js portable non disponible.
    goto END
  )
)

echo [OK] Runtime Node.js portable :
"runtime\node.exe" --version
if errorlevel 1 (
  echo [ECHEC] runtime\node.exe ne peut pas etre execute.
  goto END
)

echo.
echo [INFO] Test syntaxique du serveur...
"runtime\node.exe" --check "portable\server.js"
if errorlevel 1 goto END
echo [OK] Syntaxe serveur valide.

echo.
echo [INFO] Test syntaxique de l'interface...
"runtime\node.exe" --check "portable\app.js"
if errorlevel 1 goto END
echo [OK] Syntaxe interface valide.

echo.
echo [OK] e-Commune est pret a demarrer depuis le Bureau.
:END
echo.
pause
