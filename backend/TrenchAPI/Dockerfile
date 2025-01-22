# Schritt 1: Basis-Image für den ASP.NET Core Web-Server
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5127

# Schritt 2: SDK-Image für den Build-Prozess
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release

# Wechsel ins Backend/TrenchAPI Verzeichnis
WORKDIR /src/TrenchAPI

RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Kopiere die .csproj-Datei und stelle sicher, dass alle Abhängigkeiten wiederhergestellt werden
COPY ["TrenchAPI.csproj", "./"]

# Führe den Restore-Befehl aus, um alle NuGet-Abhängigkeiten zu laden
RUN dotnet restore "TrenchAPI.csproj"

# Kopiere den Rest des Codes in das Container-Dateisystem
COPY . .

# Baue das Projekt und gib das Zielverzeichnis für die Ausgabe an
RUN dotnet build "TrenchAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Schritt 3: Veröffentliche das Projekt
FROM build AS publish
RUN dotnet publish "TrenchAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish

# Schritt 4: Bereitstellung des veröffentlichten Projekts
FROM base AS final
WORKDIR /app

COPY --from=build /src/TrenchAPI/. ./
COPY --from=publish /app/publish .

# Definiere den Einstiegspunkt für den Container
ENTRYPOINT ["dotnet", "TrenchAPI.dll"]
