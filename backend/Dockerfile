# 1) Base image for running .NET
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5127

# 2) SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy the solution file
COPY ["backend.sln", "./"]

# Copy project files so we can restore them
COPY ["TrenchAPI/TrenchAPI.csproj", "TrenchAPI/"]
COPY ["ConsoleMQTT/ConsoleMQTT.csproj", "ConsoleMQTT/"]

# Restore the solution (restores all projects in it)
RUN dotnet restore "backend.sln"

# Copy the rest of the source code
COPY . .

# Build & Publish each project separately (or you could build the entire solution)
RUN dotnet publish "TrenchAPI/TrenchAPI.csproj" -c $BUILD_CONFIGURATION -o /app/publish/api
RUN dotnet publish "ConsoleMQTT/ConsoleMQTT.csproj" -c $BUILD_CONFIGURATION -o /app/publish/mqtt

# 3) Final stage: copy published files and run
FROM base AS final
WORKDIR /app

COPY --from=build /app/publish/api ./api
COPY --from=build /app/publish/mqtt ./mqtt

# Run both apps in one container
CMD ["sh", "-c", "dotnet ./mqtt/ConsoleMQTT.dll & dotnet ./api/TrenchAPI.dll"]
