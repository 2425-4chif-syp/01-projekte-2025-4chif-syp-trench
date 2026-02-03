# Script to generate code coverage report with exclusions

Write-Host "Cleaning previous test results..." -ForegroundColor Cyan
Remove-Item -Path ".\TestResults" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "`nRunning tests with code coverage..." -ForegroundColor Cyan
dotnet test `
    --collect:"XPlat Code Coverage" `
    --results-directory ./TestResults `
    --settings coverlet.runsettings

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nTests failed or had errors. Check output above." -ForegroundColor Red
    Write-Host "Coverage report generation will continue with available data..." -ForegroundColor Yellow
}

Write-Host "`nGenerating HTML coverage report..." -ForegroundColor Cyan

# Find the coverage file (it will be in a GUID-named subdirectory)
$coverageFile = Get-ChildItem -Path ".\TestResults" -Filter "coverage.cobertura.xml" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $coverageFile) {
    Write-Host "`nERROR: Coverage file not found!" -ForegroundColor Red
    Write-Host "Looking for any .xml files in TestResults..." -ForegroundColor Yellow
    Get-ChildItem -Path ".\TestResults" -Filter "*.xml" -Recurse | ForEach-Object {
        Write-Host "  Found: $($_.FullName)" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "Coverage file found: $($coverageFile.FullName)" -ForegroundColor Green

# Install ReportGenerator if not already installed
Write-Host "`nChecking for ReportGenerator tool..." -ForegroundColor Cyan
dotnet tool install -g dotnet-reportgenerator-globaltool --ignore-failed-sources 2>$null

$outputDir = ".\TestResults\CoverageReport"

Write-Host "Generating HTML report..." -ForegroundColor Cyan
reportgenerator `
    -reports:"$($coverageFile.FullName)" `
    -targetdir:"$outputDir" `
    -reporttypes:"Html;Cobertura" `
    -verbosity:"Info" `
    -classfilters:"-Persistence.Migrations.*;-*.Migrations.*;-*InitialMigrate*;-*WebDbContextModelSnapshot*;-*Program;-*DataPackageService;-*MqttMeasurementService;-*FileUploadOperationFilter"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nCoverage report generated successfully!" -ForegroundColor Green
    Write-Host "Report location: $outputDir\index.html" -ForegroundColor Green
    Write-Host "`nOpening report in browser..." -ForegroundColor Cyan
    Start-Process "$outputDir\index.html"
} else {
    Write-Host "`nERROR: Failed to generate coverage report!" -ForegroundColor Red
    exit 1
}

Write-Host "`nDone!" -ForegroundColor Green
