# Simple Integration Test Script for TrenchAPI
# This uses pure PowerShell to test the API sequentially

param(
    [string]$BaseUrl = "http://localhost:5127",
    [string]$ApiKey = "ichliebetrench"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  TrenchAPI Integration Tests" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$testsPassed = 0
$testsFailed = 0
$testsTotal = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    $script:testsTotal++
    Write-Host "Test $testsTotal`: $Name..." -NoNewline
    
    try {
        $headers = @{
            "KEY" = $script:ApiKey
            "Content-Type" = "application/json"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            if ($Body -is [string]) {
                $params.Body = """$Body"""
            }
            else {
                $params.Body = ($Body | ConvertTo-Json -Depth 10)
            }
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " OK ($($response.StatusCode))" -ForegroundColor Green
            $script:testsPassed++
            if ($response.Content) {
                try {
                    return ($response.Content | ConvertFrom-Json)
                }
                catch {
                    # If JSON parsing fails, return raw content
                    return $response.Content
                }
            }
            return $null
        }
        else {
            Write-Host " FAILED (Expected $ExpectedStatus, got $($response.StatusCode))" -ForegroundColor Red
            $script:testsFailed++
            return $null
        }
    }
    catch {
        Write-Host " ERROR ($($_.Exception.Message))" -ForegroundColor Red
        $script:testsFailed++
        return $null
    }
}

# Start tests
$startTime = Get-Date

# Test 1: Create SpuleTyp
$spuleTyp = Test-Endpoint -Name "Create SpuleTyp" -Method POST -Url "$BaseUrl/api/SpuleTyp" -ExpectedStatus 201 -Body @{
    name = "Test SpuleTyp IT"
    schenkelzahl = 4
    bandbreite = 150.5
    schichthoehe = 80.0
    durchmesser = 200.0
    toleranzbereich = 2.5
    notiz = "Integration Test"
}

if (-not $spuleTyp) {
    Write-Host ""
    Write-Host "FEHLER: SpuleTyp konnte nicht erstellt werden. Tests abgebrochen." -ForegroundColor Red
    exit 1
}

# Test 2: Get All SpuleTypen
Test-Endpoint -Name "Get All SpuleTypen" -Method GET -Url "$BaseUrl/api/SpuleTyp" | Out-Null

# Test 3: Create SondenTyp
$sondenTyp = Test-Endpoint -Name "Create SondenTyp" -Method POST -Url "$BaseUrl/api/SondenTyp" -ExpectedStatus 201 -Body @{
    name = "Test SondenTyp IT"
    breite = 10.5
    hoehe = 15.0
    windungszahl = 50
    alpha = 0.85
    notiz = "Integration Test"
}

# Test 4: Get All SondenTypen
Test-Endpoint -Name "Get All SondenTypen" -Method GET -Url "$BaseUrl/api/SondenTyp" | Out-Null

# Test 5: Create Spule
$spule = Test-Endpoint -Name "Create Spule" -Method POST -Url "$BaseUrl/api/Spule" -ExpectedStatus 201 -Body @{
    spuleTypID = $spuleTyp.id
    auftragsnr = "IT-2026-001"
    auftragsPosNr = "POS-IT-001"
    bemessungsspannung = 230.0
    bemessungsfrequenz = 50.0
    einheit = "V"
}

# Test 6: Get Created Spule
Test-Endpoint -Name "Get Spule by ID" -Method GET -Url "$BaseUrl/api/Spule/$($spule.id)" | Out-Null

# Test 7: Create Sonde
$sonde = Test-Endpoint -Name "Create Sonde" -Method POST -Url "$BaseUrl/api/Sonde" -ExpectedStatus 201 -Body @{
    sondenTypID = $sondenTyp.id
    name = "Test Sonde IT"
    kalibrierungsfaktor = 1.5
}

# Test 8: Create Messeinstellung
$messeinstellung = Test-Endpoint -Name "Create Messeinstellung" -Method POST -Url "$BaseUrl/api/Messeinstellung" -ExpectedStatus 201 -Body @{
    name = "Test Messeinstellung IT"
    spuleID = $spule.id
    sondenTypID = $sondenTyp.id
    sondenProSchenkel = 5
}

# Test 9: Get Messeinstellung
Test-Endpoint -Name "Get Messeinstellung by ID" -Method GET -Url "$BaseUrl/api/Messeinstellung/$($messeinstellung.id)" | Out-Null

# Test 10: Create SondenPosition
$sondenPosition = Test-Endpoint -Name "Create SondenPosition" -Method POST -Url "$BaseUrl/api/SondenPosition" -ExpectedStatus 201 -Body @{
    messeinstellungID = $messeinstellung.id
    sondeID = $sonde.id
    schenkel = 1
    position = 100
}

# Test 11: Create Messung
$messung = Test-Endpoint -Name "Create Messung" -Method POST -Url "$BaseUrl/api/Messung" -ExpectedStatus 201 -Body @{
    messeinstellungID = $messeinstellung.id
    anfangszeitpunkt = "2026-01-13T10:00:00Z"
    endzeitpunkt = "2026-01-13T11:00:00Z"
    name = "Test Messung IT"
    tauchkernstellung = 50.5
    pruefspannung = 230.0
    notiz = "Integration Test"
}

# Test 12: Get Messung
Test-Endpoint -Name "Get Messung by ID" -Method GET -Url "$BaseUrl/api/Messung/$($messung.id)" | Out-Null

# Test 13: Create Messwert
$messwert = Test-Endpoint -Name "Create Messwert" -Method POST -Url "$BaseUrl/api/Messwert" -ExpectedStatus 201 -Body @{
    messungID = $messung.id
    sondenPositionID = $sondenPosition.id
    wert = 25.5
    zeitpunkt = "2026-01-13T10:00:00Z"
}

# Test 14: Get Messwerte
Test-Endpoint -Name "Get Messwerte for Messung" -Method GET -Url "$BaseUrl/api/Messung/$($messung.id)/Messwerte" | Out-Null

# Test 15: Update Spule
Test-Endpoint -Name "Update Spule" -Method PUT -Url "$BaseUrl/api/Spule/$($spule.id)" -ExpectedStatus 204 -Body @{
    id = $spule.id
    spuleTypID = $spuleTyp.id
    auftragsnr = "IT-2026-001-UPDATED"
    auftragsPosNr = "POS-IT-001-UPD"
    bemessungsspannung = 400.0
    bemessungsfrequenz = 60.0
    einheit = "V"
    notiz = "Updated"
} | Out-Null

# Test 16: Verify Update
$updatedSpule = Test-Endpoint -Name "Verify Spule Update" -Method GET -Url "$BaseUrl/api/Spule/$($spule.id)"

# Test 17: Auth Hash
Test-Endpoint -Name "Auth - Hash Password" -Method POST -Url "$BaseUrl/api/auth/hash" -Body "testPassword123" | Out-Null

# Test 18: Auth Verify (should fail)
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/verify" -Method POST -Headers @{"Content-Type"="application/json"} -Body '"wrongPassword"' -UseBasicParsing
    if ($response.StatusCode -eq 401) {
        $testsTotal++
        Write-Host "Test $testsTotal`: Auth - Verify Wrong Password... OK (401)" -ForegroundColor Green
        $testsPassed++
    }
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        $testsTotal++
        Write-Host "Test $testsTotal`: Auth - Verify Wrong Password... OK (401)" -ForegroundColor Green
        $testsPassed++
    }
    else {
        $testsTotal++
        Write-Host "Test $testsTotal`: Auth - Verify Wrong Password... ERROR" -ForegroundColor Red
        $testsFailed++
    }
}

# Cleanup Tests
Write-Host ""
Write-Host "Cleanup..." -ForegroundColor Yellow

Test-Endpoint -Name "Delete Messwert" -Method DELETE -Url "$BaseUrl/api/Messwert/$($messwert.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete Messung" -Method DELETE -Url "$BaseUrl/api/Messung/$($messung.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete SondenPosition" -Method DELETE -Url "$BaseUrl/api/SondenPosition/$($sondenPosition.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete Messeinstellung" -Method DELETE -Url "$BaseUrl/api/Messeinstellung/$($messeinstellung.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete Sonde" -Method DELETE -Url "$BaseUrl/api/Sonde/$($sonde.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete Spule" -Method DELETE -Url "$BaseUrl/api/Spule/$($spule.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete SondenTyp" -Method DELETE -Url "$BaseUrl/api/SondenTyp/$($sondenTyp.id)" -ExpectedStatus 204 | Out-Null
Test-Endpoint -Name "Delete SpuleTyp" -Method DELETE -Url "$BaseUrl/api/SpuleTyp/$($spuleTyp.id)" -ExpectedStatus 204 | Out-Null

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Test Ergebnisse" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Dauer: $([math]::Round($duration, 2)) Sekunden" -ForegroundColor White
Write-Host "Tests Gesamt:  $testsTotal" -ForegroundColor White
Write-Host "Bestanden:     $testsPassed" -ForegroundColor Green
if ($testsFailed -gt 0) {
    Write-Host "Fehlgeschlagen: $testsFailed" -ForegroundColor Red
}
$passRate = [math]::Round(($testsPassed / $testsTotal) * 100, 1)
Write-Host "Erfolgsrate:   $passRate%" -ForegroundColor $(if ($passRate -eq 100) { "Green" } else { "Yellow" })
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "Status: ALLE TESTS BESTANDEN" -ForegroundColor Green
}
else {
    Write-Host "Status: $testsFailed TESTS FEHLGESCHLAGEN" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

exit $(if ($testsFailed -eq 0) { 0 } else { 1 })
