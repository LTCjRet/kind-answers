@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Check-Site.ps1" -Root "%~dp0."
pause
