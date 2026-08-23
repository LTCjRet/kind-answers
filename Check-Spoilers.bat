@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Check-Spoilers.ps1" -Root "%~dp0."
pause
