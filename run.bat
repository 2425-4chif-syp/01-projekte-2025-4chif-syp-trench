docker volume prune -f
docker compose down -v
cd ./TrenchAPI/WebAPI
del ..\Migrations /q
dotnet ef migrations add InitialCreate
cd ../..
docker compose up --build -d
cd ./TrenchAPI/ConsoleFillDB
dotnet run
cd ../..