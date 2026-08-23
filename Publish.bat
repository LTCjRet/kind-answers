@echo off
if "%~1"=="" (
  echo Usage: Publish.bat "what changed"
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Publish-Site.ps1" -Root "%~dp0." -Message "%~1"
pause
