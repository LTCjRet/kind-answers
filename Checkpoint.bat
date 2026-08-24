@echo off
if "%~1"=="" (
  echo Usage: Checkpoint.bat "what you changed"
  echo    eg: Checkpoint.bat "tightened the opening of the fireplace chapter"
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Checkpoint-Page.ps1" -Root "%~dp0." -Message "%~1"
pause
