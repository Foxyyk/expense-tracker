#!/usr/bin/env pwsh
# Reset and Restart Backend API
# This script kills the old backend process and starts a fresh one with debugging enabled

Write-Host "=== Expense Tracker API - Reset & Restart ===" -ForegroundColor Cyan

# Step 1: Kill existing processes
Write-Host "`n[1/3] Stopping existing backend processes..." -ForegroundColor Yellow
try {
    # Kill on port 5299
    $process = netstat -ano | Select-String ":5299" | Select-Object -First 1
    if ($process) {
        $pid = ($process -split '\s+')[-1]
        Write-Host "Found process on port 5299 (PID: $pid)" -ForegroundColor Gray
        Stop-Process -ID $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✓ Process stopped" -ForegroundColor Green
    } else {
        Write-Host "No process found on port 5299" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Could not stop process: $_" -ForegroundColor Red
}

# Step 2: Clean build
Write-Host "`n[2/3] Cleaning build artifacts..." -ForegroundColor Yellow
$apiPath = "ExpenseTrackerAPI"
if (Test-Path $apiPath) {
    try {
        Remove-Item -Path "$apiPath\bin" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$apiPath\obj" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Build artifacts cleaned" -ForegroundColor Green
    }
    catch {
        Write-Host "Warning: Could not clean artifacts: $_" -ForegroundColor Yellow
    }
}

# Step 3: Start backend
Write-Host "`n[3/3] Starting backend API..." -ForegroundColor Yellow
Write-Host "Location: $apiPath" -ForegroundColor Gray
Write-Host "Watch for these debug messages:" -ForegroundColor Cyan
Write-Host "  ✓ 'Database initialized successfully'" -ForegroundColor Gray
Write-Host "  ✓ 'JWT Token Received from Authorization header'" -ForegroundColor Gray
Write-Host "  ✓ 'JWT Token Validated Successfully'" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray

if (Test-Path $apiPath) {
    Push-Location $apiPath
    & dotnet run
    Pop-Location
} else {
    Write-Host "✗ API folder not found: $apiPath" -ForegroundColor Red
}
