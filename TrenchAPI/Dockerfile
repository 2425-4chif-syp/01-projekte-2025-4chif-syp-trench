# 1) Base image for running .NET
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5127
EXPOSE 8080

# 2) SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files so we can restore them (skip solution file to avoid test project issues)
COPY ["WebAPI/WebAPI.csproj", "WebAPI/"]
COPY ["ConsoleMQTT/ConsoleMQTT.csproj", "ConsoleMQTT/"]
COPY ["ConsoleFillDb/ConsoleFillDb.csproj", "ConsoleFillDb/"]
COPY ["Core/Core.csproj", "Core/"]
COPY ["Persistence/Persistence.csproj", "Persistence/"]
COPY ["Utils/Utils.csproj", "Utils/"]

# Restore only the projects we need (skip TrenchAPI.Tests which targets .NET 10.0)
RUN dotnet restore "WebAPI/WebAPI.csproj"
RUN dotnet restore "ConsoleMQTT/ConsoleMQTT.csproj"
RUN dotnet restore "ConsoleFillDb/ConsoleFillDb.csproj"

# Copy the rest of the source code
COPY . .

# Clean obj and bin directories to avoid assembly attribute conflicts and folder conflicts
RUN find . -name "obj" -type d -exec rm -rf {} + || true
RUN find . -name "bin" -type d -exec rm -rf {} + || true

# Build & Publish each project separately using solution-level build
# Clean everything first
RUN dotnet clean || true
RUN find . -name "obj" -type d -exec rm -rf {} + || true
RUN find . -name "bin" -type d -exec rm -rf {} + || true

# Build each project individually (skip solution to avoid test project)
RUN dotnet build "WebAPI/WebAPI.csproj" -c Release
RUN dotnet build "ConsoleMQTT/ConsoleMQTT.csproj" -c Release
RUN dotnet build "ConsoleFillDb/ConsoleFillDb.csproj" -c Release

# Now publish each project individually to separate output directories
RUN dotnet publish "WebAPI/WebAPI.csproj" -c Release -o /app/publish/api --no-build
RUN dotnet publish "ConsoleMQTT/ConsoleMQTT.csproj" -c Release -o /app/publish/mqtt --no-build  
RUN dotnet publish "ConsoleFillDb/ConsoleFillDb.csproj" -c Release -o /app/publish/filldb --no-build

# 3) Final stage: copy published files and run
FROM base AS final
WORKDIR /app

COPY --from=build /app/publish/api ./api
COPY --from=build /app/publish/mqtt ./mqtt
COPY --from=build /app/publish/filldb ./filldb

# Run both apps in one container
CMD ["sh", "-c", "dotnet ./mqtt/ConsoleMQTT.dll & dotnet ./api/WebAPI.dll"]
