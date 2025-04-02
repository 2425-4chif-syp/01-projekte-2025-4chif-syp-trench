docker volume prune -f
docker compose down -v
cd ./backend/TrenchAPI
del Migrations /q
dotnet ef migrations add InitialCreate
cd ../..
docker compose up --build