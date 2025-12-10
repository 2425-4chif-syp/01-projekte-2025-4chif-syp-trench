docker volume prune -f
docker compose down -v
# Migrations werden jetzt automatisch beim Start der Anwendung ausgeführt
# Sie müssen nicht mehr manuell erstellt werden
docker compose up --build