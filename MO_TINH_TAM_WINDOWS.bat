@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo CHUA CAI NODE.JS. Hay cai Node.js LTS truoc.
  pause
  exit /b 1
)
node "tools\tinh-tam-launcher\launcher.cjs" --game "%CD%"
pause
