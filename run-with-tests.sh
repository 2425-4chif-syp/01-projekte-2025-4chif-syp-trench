#!/bin/bash
set -e

echo ""
echo "=========================================="
echo "  TrenchAPI - Start mit Tests"
echo "=========================================="
echo ""

docker volume prune -f >/dev/null 2>&1 || true
docker compose down -v >/dev/null 2>&1 || true

echo "[1/3] Starte Docker Container..."
docker compose up --build -d

if [ $? -ne 0 ]; then
    echo "[FEHLER] Docker Container konnten nicht gestartet werden"
    exit 1
fi

echo "[1/3] Container erfolgreich gestartet"
echo ""

echo "[2/3] Fuehre Integration Tests aus..."
cd TrenchAPI/http-yac
./run-tests.sh
TEST_RESULT=$?
cd ../..

if [ $TEST_RESULT -ne 0 ]; then
    echo ""
    echo "[3/3] Docker Logs (letzte 30 Zeilen):"
    echo "------------------------------------------"
    docker compose logs --tail=30
    echo "------------------------------------------"
    echo ""
    echo "[INFO] Zum Anzeigen aller Logs: docker compose logs -f"
    echo "[INFO] Zum Stoppen: docker compose down"
    exit 1
fi

echo ""
echo "=========================================="
echo "  System ist bereit!"
echo "=========================================="
echo ""

# Attach to container logs to show MQTT messages
docker compose logs -f
