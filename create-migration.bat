@echo off
if "%1"=="" (
    echo Verwendung: create-migration.bat ^<MigrationName^>
    echo Beispiel: create-migration.bat InitialCreate
    exit /b 1
)

echo Lösche alten Migrations-Ordner...
cd TrenchAPI\Persistence
if exist Migrations (
    rmdir /s /q Migrations
    echo Migrations-Ordner gelöscht.
)

echo Erstelle neue Migration: %1
dotnet ef migrations add %1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Migration erfolgreich erstellt!
    echo Bitte committe die neuen Migrations-Dateien ins Repository.
) else (
    echo.
    echo Fehler beim Erstellen der Migration!
)
cd ..\..

