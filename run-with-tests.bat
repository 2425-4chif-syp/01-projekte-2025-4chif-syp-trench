@echo off
setlocal EnableDelayedExpansion
echo.
echo ==========================================
echo   TrenchAPI - Start mit Tests
echo ==========================================
echo.

docker volume prune -f >nul 2>&1
docker compose down -v >nul 2>&1

echo [1/3] Starte Docker Container...
docker compose up --build -d

if errorlevel 1 (
    echo [FEHLER] Docker Container konnten nicht gestartet werden
    exit /b 1
)

echo [1/3] Container erfolgreich gestartet
echo.

echo [2/3] Fuehre Integration Tests aus...
call TrenchAPI\http-yac\run-tests.bat

if errorlevel 1 (
    echo.
    echo [3/3] Docker Logs (letzte 30 Zeilen^):
    echo ------------------------------------------
    docker compose logs --tail=30
    echo ------------------------------------------
    echo.
    echo [INFO] Zum Anzeigen aller Logs: docker compose logs -f
    echo [INFO] Zum Stoppen: docker compose down
    exit /b 1
)

echo.
echo ==========================================
echo   System ist bereit!
echo ==========================================
echo.

REM Attach to container logs to show MQTT messages
docker compose logs -f
