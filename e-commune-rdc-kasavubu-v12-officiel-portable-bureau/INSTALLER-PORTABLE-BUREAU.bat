@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
title Installation e-Commune - Bureau Windows
color 1F
cls

echo ============================================================
echo    e-COMMUNE RDC - INSTALLATION PORTABLE SUR LE BUREAU
echo ============================================================
echo.

set "DESKTOP="
for /f "usebackq delims=" %%D in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "[Environment]::GetFolderPath('Desktop')"`) do set "DESKTOP=%%D"
if not defined DESKTOP set "DESKTOP=%USERPROFILE%\Desktop"

set "APPDIR=%DESKTOP%\e-Commune-Kasa-Vubu"
set "SHORTCUT=%DESKTOP%\e-Commune Kasa-Vubu.lnk"
set "SOURCE=%CD%"

echo [INFO] Bureau Windows : %DESKTOP%
echo [INFO] Dossier portable : %APPDIR%
echo.

if /I "%SOURCE%"=="%APPDIR%" goto COPY_DONE

if not exist "%APPDIR%" mkdir "%APPDIR%" >nul 2>&1
robocopy "%SOURCE%" "%APPDIR%" /E /R:1 /W:1 /XD logs node_modules .next .git /XF "INSTALLER-PORTABLE-BUREAU.bat" >nul
set "RC=!ERRORLEVEL!"
if !RC! GEQ 8 (
  color 4F
  echo [ERREUR] Impossible de copier e-Commune sur le Bureau. Code Robocopy: !RC!
  pause
  exit /b 20
)

:COPY_DONE
if not exist "%APPDIR%\PREPARER-RUNTIME-NODE.bat" (
  color 4F
  echo [ERREUR] Le dossier portable est incomplet.
  pause
  exit /b 21
)

echo [INFO] Preparation de Node.js portable...
call "%APPDIR%\PREPARER-RUNTIME-NODE.bat"
if errorlevel 1 (
  color 4F
  echo [ERREUR] Node.js portable n'a pas pu etre prepare.
  pause
  exit /b 22
)

echo [INFO] Creation du raccourci Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $s=$w.CreateShortcut('%SHORTCUT%'); $s.TargetPath='%APPDIR%\E-COMMUNE.bat'; $s.WorkingDirectory='%APPDIR%'; if (Test-Path '%APPDIR%\portable\assets\ecommune.ico') { $s.IconLocation='%APPDIR%\portable\assets\ecommune.ico,0' }; $s.Description='e-Commune RDC - Commune pilote de Kasa-Vubu'; $s.WindowStyle=1; $s.Save()"
if errorlevel 1 (
  color 4F
  echo [ERREUR] Impossible de creer le raccourci du Bureau.
  pause
  exit /b 23
)

echo.
echo ============================================================
echo [OK] e-Commune est installe sur le Bureau.
echo [OK] Raccourci : e-Commune Kasa-Vubu
echo [OK] Moteur    : Node.js portable
echo ============================================================
echo.
echo Lancement de l'application...
start "" "%APPDIR%\E-COMMUNE.bat"
timeout /t 2 /nobreak >nul
exit /b 0
