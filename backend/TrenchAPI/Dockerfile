# Schritt 1: Basis-Image für den ASP.NET Core Web-Server
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5127

# Schritt 2: SDK-Image für den Build-Prozess
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Kopiere die Projektdateien
COPY ["TrenchAPI.csproj", "./"]
COPY ["MqttTestingData/MqttTestingData.csproj", "./MqttTestingData/"]

# Restore NuGet-Pakete
RUN dotnet restore "TrenchAPI.csproj"
RUN dotnet restore "MqttTestingData/MqttTestingData.csproj"

# Kopiere den restlichen Source Code
COPY . .

# Build und Publish
RUN dotnet publish "TrenchAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish/api
RUN dotnet publish "MqttTestingData/MqttTestingData.csproj" -c $BUILD_CONFIGURATION -o /app/publish/mqtt

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=build /app/publish/api ./api
COPY --from=build /app/publish/mqtt ./mqtt

# Starte beide Anwendungen
CMD ["sh", "-c", "dotnet ./mqtt/MqttTestingData.dll & dotnet ./api/TrenchAPI.dll"]
