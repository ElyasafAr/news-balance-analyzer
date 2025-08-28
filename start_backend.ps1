# News Balance Analyzer - Backend Service Starter
# PowerShell script to start the backend service

Write-Host "🚀 News Balance Analyzer - Backend Service" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting the backend service that will run continuously..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This service will:" -ForegroundColor White
Write-Host "📰 Scrape news every 5 minutes" -ForegroundColor Green
Write-Host "📝 Process articles every 10 minutes" -ForegroundColor Green
Write-Host "📊 Provide real-time status updates" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found:" -ForegroundColor Green
    Write-Host $pythonVersion -ForegroundColor White
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+ and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if required files exist
$requiredFiles = @("filter_recent.py", "process_articles.py", "backend_runner.py")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ All required files found" -ForegroundColor Green

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local file not found" -ForegroundColor Yellow
    Write-Host "Make sure you have ANTHROPIC_API_KEY configured" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "🚀 Starting backend service..." -ForegroundColor Green
Write-Host "📡 The service will run in the background" -ForegroundColor Cyan
Write-Host "💡 Check backend_runner.log for detailed logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Start the backend service
try {
    python backend_runner.py
} catch {
    Write-Host "❌ Error starting backend service: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🛑 Backend service stopped" -ForegroundColor Yellow
Read-Host "Press Enter to exit"
