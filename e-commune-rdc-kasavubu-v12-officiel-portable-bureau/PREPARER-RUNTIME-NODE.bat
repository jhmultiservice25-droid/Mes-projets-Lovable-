@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "RUNTIME_DIR=%CD%\runtime"
set "RUNTIME_NODE=%RUNTIME_DIR%\node.exe"
set "NODE_VERSION=v24.21.0"
set "NODE_ZIP=node-v24.21.0-win-x64.zip"
set "NODE_URL=https://nodejs.org/download/release/v24.21.0/node-v24.21.0-win-x64.zip"
set "NODE_SHA256=158f7685b44de51f6c0df1d153526cbcd3e1bc739a8dfc607721cef75de9e541"

if exist "%RUNTIME_NODE%" (
  "%RUNTIME_NODE%" --version >nul 2>&1
  if not errorlevel 1 exit /b 0
  del /q "%RUNTIME_NODE%" >nul 2>&1
)

if not exist "%RUNTIME_DIR%" mkdir "%RUNTIME_DIR%" >nul 2>&1

rem First choice: reuse a Node.js already installed on Windows.
set "SYSTEM_NODE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined SYSTEM_NODE set "SYSTEM_NODE=%%N"
if not defined SYSTEM_NODE if exist "%ProgramFiles%\nodejs\node.exe" set "SYSTEM_NODE=%ProgramFiles%\nodejs\node.exe"
if not defined SYSTEM_NODE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "SYSTEM_NODE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined SYSTEM_NODE if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "SYSTEM_NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"

if defined SYSTEM_NODE (
  echo [INFO] Node.js trouve sur ce PC. Creation de la copie portable...
  copy /y "%SYSTEM_NODE%" "%RUNTIME_NODE%" >nul
  if exist "%RUNTIME_NODE%" (
    "%RUNTIME_NODE%" --version >nul 2>&1
    if not errorlevel 1 exit /b 0
  )
)

echo [INFO] Node.js n'est pas installe. Telechargement du runtime portable officiel %NODE_VERSION%...
echo [INFO] Internet est requis uniquement pour cette premiere preparation.

set "TMP_DIR=%TEMP%\ecommune-node-%RANDOM%%RANDOM%"
set "TMP_ZIP=%TMP_DIR%\%NODE_ZIP%"
set "TMP_EXTRACT=%TMP_DIR%\extract"
mkdir "%TMP_DIR%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ProgressPreference='SilentlyContinue'; Invoke-WebRequest -UseBasicParsing -Uri '%NODE_URL%' -OutFile '%TMP_ZIP%'"
if errorlevel 1 goto DOWNLOAD_ERROR
if not exist "%TMP_ZIP%" goto DOWNLOAD_ERROR

for /f "tokens=*" %%H in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-FileHash -Algorithm SHA256 -LiteralPath '%TMP_ZIP%').Hash.ToLower()"') do set "DOWNLOADED_SHA=%%H"
if /I not "!DOWNLOADED_SHA!"=="%NODE_SHA256%" (
  echo [ERREUR] La verification SHA-256 du runtime Node.js a echoue.
  echo Attendu : %NODE_SHA256%
  echo Recu    : !DOWNLOADED_SHA!
  rmdir /s /q "%TMP_DIR%" >nul 2>&1
  exit /b 12
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -LiteralPath '%TMP_ZIP%' -DestinationPath '%TMP_EXTRACT%' -Force"
if errorlevel 1 goto DOWNLOAD_ERROR

if not exist "%TMP_EXTRACT%\node-v24.21.0-win-x64\node.exe" goto DOWNLOAD_ERROR
copy /y "%TMP_EXTRACT%\node-v24.21.0-win-x64\node.exe" "%RUNTIME_NODE%" >nul
rmdir /s /q "%TMP_DIR%" >nul 2>&1

if not exist "%RUNTIME_NODE%" goto DOWNLOAD_ERROR
"%RUNTIME_NODE%" --version
if errorlevel 1 goto DOWNLOAD_ERROR
exit /b 0

:DOWNLOAD_ERROR
echo.
echo [ERREUR] Impossible de preparer le runtime Node.js portable.
echo Verifiez la connexion Internet puis relancez ce fichier.
if exist "%TMP_DIR%" rmdir /s /q "%TMP_DIR%" >nul 2>&1
exit /b 11
