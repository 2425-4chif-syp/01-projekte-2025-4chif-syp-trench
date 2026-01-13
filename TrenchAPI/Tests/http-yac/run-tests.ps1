# Run HTTP YAC Integration Tests
# This script waits for the API to be ready and then runs the tests

param(
    [string]$ApiHost = "http://localhost:5127",
    [int]$MaxRetries = 30,
    [int]$RetryDelay = 2
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TrenchAPI Integration Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if API is ready
function Test-ApiReady {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri "$Url/api/SpuleTyp" -Method GET -Headers @{"KEY"="ichliebetrench"} -TimeoutSec 5 -UseBasicParsing
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Wait for API to be ready
Write-Host "[1/3] Warte auf API ($ApiHost)..." -ForegroundColor Yellow
$attempts = 0
$apiReady = $false

while (-not $apiReady -and $attempts -lt $MaxRetries) {
    $attempts++
    
    if (Test-ApiReady -Url $ApiHost) {
        $apiReady = $true
        Write-Host "[1/3] API ist bereit!" -ForegroundColor Green
    }
    else {
        Write-Host "      Versuch $attempts/$MaxRetries..." -ForegroundColor DarkGray
        if ($attempts -lt $MaxRetries) {
            Start-Sleep -Seconds $RetryDelay
        }
    }
}

if (-not $apiReady) {
    Write-Host ""
    Write-Host "[FEHLER] API ist nicht erreichbar nach $MaxRetries Versuchen" -ForegroundColor Red
    Write-Host "         Stelle sicher, dass die API auf $ApiHost laeuft" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if httpyac is installed
Write-Host "[2/3] Pruefe httpyac Installation..." -ForegroundColor Yellow
$httpyacInstalled = Get-Command httpyac -ErrorAction SilentlyContinue 2>$null
if (-not $httpyacInstalled) {
    Write-Host "      httpyac wird installiert..." -ForegroundColor Yellow
    npm install -g httpyac 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[FEHLER] httpyac Installation fehlgeschlagen" -ForegroundColor Red
        Write-Host "         Installiere manuell: npm install -g httpyac" -ForegroundColor Red
        exit 1
    }
    Write-Host "[2/3] httpyac erfolgreich installiert" -ForegroundColor Green
}
else {
    Write-Host "[2/3] httpyac ist bereits installiert" -ForegroundColor Green
}

Write-Host ""
Write-Host "[3/3] Fuehre Tests aus..." -ForegroundColor Yellow
Write-Host ""

# Get the directory of this script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$simpleTestScript = Join-Path $scriptDir "simple-tests.ps1"

# Check if test file exists
if (-not (Test-Path $simpleTestScript)) {
    Write-Host ""
    Write-Host "[FEHLER] Test-Script nicht gefunden: $simpleTestScript" -ForegroundColor Red
    exit 1
}

# Run the simple PowerShell tests
$testStartTime = Get-Date

try {
    & $simpleTestScript -BaseUrl $ApiHost -ApiKey "ichliebetrench"
    if ($LASTEXITCODE -ne $null) {
        $exitCode = $LASTEXITCODE
    }
    else {
        $exitCode = 0
    }
}
catch {
    Write-Host "Fehler beim Ausfuehren der Tests: $_" -ForegroundColor Red
    $exitCode = 1
}

$testEndTime = Get-Date
$duration = $testEndTime - $testStartTime

# Exit code is already set by simple-tests.ps1
exit $exitCode

