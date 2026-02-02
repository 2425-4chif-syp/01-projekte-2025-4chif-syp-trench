@echo off
REM Run HTTP YAC Integration Tests

REM Change to the script directory
cd /d "%~dp0"

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -NoLogo -NoProfile -Command "& '%~dp0run-tests.ps1'; exit $LASTEXITCODE"

exit /b %errorlevel%
