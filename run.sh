docker volume prune -f
docker compose down -v
cd ./backend/TrenchAPI
rm -rf Migrations
dotnet ef migrations add InitialCreate
cd ../..
docker compose up --build