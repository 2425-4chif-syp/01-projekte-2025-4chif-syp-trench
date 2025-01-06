FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["TrenchAPI.csproj", "TrenchAPI/"]
RUN dotnet restore "TrenchAPI/TrenchAPI.csproj"
COPY . . 
WORKDIR "/src/"

# Setze die richtigen Berechtigungen für das Zielverzeichnis
RUN mkdir -p /app/build && chmod -R 777 /app/build

RUN dotnet build "TrenchAPI.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "TrenchAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish . 
ENTRYPOINT ["dotnet", "TrenchAPI.dll"]
