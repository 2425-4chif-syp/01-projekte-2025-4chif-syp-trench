#!/bin/bash

if [ -z "$1" ]; then
    echo "Verwendung: ./create-migration.sh <MigrationName>"
    echo "Beispiel: ./create-migration.sh InitialCreate"
    exit 1
fi

echo "Lösche alten Migrations-Ordner..."
cd TrenchAPI/Persistence

if [ -d "Migrations" ]; then
    rm -rf Migrations
    echo "Migrations-Ordner gelöscht."
fi

echo "Erstelle neue Migration: $1"
dotnet ef migrations add "$1"

if [ $? -eq 0 ]; then
    echo ""
    echo "Migration erfolgreich erstellt!"
    echo "Bitte committe die neuen Migrations-Dateien ins Repository."
else
    echo ""
    echo "Fehler beim Erstellen der Migration!"
fi

cd ../..

