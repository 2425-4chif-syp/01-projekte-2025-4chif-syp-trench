docker volume prune -f
docker compose down -v
REM Migrations werden jetzt automatisch beim Start der Anwendung ausgeführt
REM Sie müssen nicht mehr manuell erstellt werden
docker compose up --build