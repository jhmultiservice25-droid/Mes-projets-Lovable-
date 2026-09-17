@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "DESKTOP="
for /f "usebackq delims=" %%D in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "[Environment]::GetFolderPath('Desktop')"`) do set "DESKTOP=%%D"
if not defined DESKTOP set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\e-Commune Kasa-Vubu.lnk"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$w=New-Object -ComObject WScript.Shell; $s=$w.CreateShortcut('%SHORTCUT%'); $s.TargetPath='%CD%\E-COMMUNE.bat'; $s.WorkingDirectory='%CD%'; if (Test-Path '%CD%\portable\assets\ecommune.ico') { $s.IconLocation='%CD%\portable\assets\ecommune.ico,0' }; $s.Description='e-Commune RDC - Commune pilote de Kasa-Vubu'; $s.WindowStyle=1; $s.Save()"
if errorlevel 1 (
  echo [ERREUR] Le raccourci n'a pas pu etre cree.
  pause
  exit /b 1
)
echo [OK] Raccourci cree sur le Bureau : e-Commune Kasa-Vubu
pause
exit /b 0
