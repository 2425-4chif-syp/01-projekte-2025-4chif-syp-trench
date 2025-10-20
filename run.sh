docker volume prune -f
docker compose down -v
cd ./TrenchAPI/WebAPI
rm -rf ../Migrations
dotnet ef migrations add InitialCreate
cd ../..
docker compose up --build