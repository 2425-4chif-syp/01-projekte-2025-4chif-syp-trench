# 1) Base image for running .NET
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5127
EXPOSE 8080

# 2) SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file
COPY ["backend.sln", "./"]

# Copy project files so we can restore them
COPY ["TrenchAPI/TrenchAPI.csproj", "TrenchAPI/"]
COPY ["ConsoleMQTT/ConsoleMQTT.csproj", "ConsoleMQTT/"]
COPY ["TrenchAPI/ConsoleFillDb/ConsoleFillDb.csproj", "TrenchAPI/ConsoleFillDb/"]

# Restore individual projects instead of solution
RUN dotnet restore "TrenchAPI/TrenchAPI.csproj"
RUN dotnet restore "ConsoleMQTT/ConsoleMQTT.csproj"
RUN dotnet restore "TrenchAPI/ConsoleFillDb/ConsoleFillDb.csproj"

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

# Build the entire solution first to resolve dependencies
RUN dotnet build backend.sln -c Release

# Now publish each project individually to separate output directories
RUN dotnet publish "TrenchAPI/TrenchAPI.csproj" -c Release -o /app/publish/api --no-build
RUN dotnet publish "ConsoleMQTT/ConsoleMQTT.csproj" -c Release -o /app/publish/mqtt --no-build  
RUN dotnet publish "TrenchAPI/ConsoleFillDb/ConsoleFillDb.csproj" -c Release -o /app/publish/filldb --no-build

# 3) Final stage: copy published files and run
FROM base AS final
WORKDIR /app

COPY --from=build /app/publish/api ./api
COPY --from=build /app/publish/mqtt ./mqtt
COPY --from=build /app/publish/filldb ./filldb

# Run both apps in one container
CMD ["sh", "-c", "dotnet ./mqtt/ConsoleMQTT.dll & dotnet ./api/TrenchAPI.dll"]
