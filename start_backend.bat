@echo off
chcp 65001 >nul
echo 🚀 News Balance Analyzer - Backend Service
echo ============================================
echo.
echo Starting the backend service that will run continuously...
echo.
echo This service will:
echo 📰 Scrape news every 5 minutes
echo 📝 Process articles every 10 minutes  
echo 📊 Provide real-time status updates
echo.
echo Press Ctrl+C to stop the service
echo.
echo ============================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python 3.8+ and try again.
    pause
    exit /b 1
)

REM Check if required files exist
if not exist "filter_recent.py" (
    echo ❌ filter_recent.py not found!
    pause
    exit /b 1
)

if not exist "process_articles.py" (
    echo ❌ process_articles.py not found!
    pause
    exit /b 1
)

if not exist "backend_runner.py" (
    echo ❌ backend_runner.py not found!
    pause
    exit /b 1
)

echo ✅ All required files found
echo 🐍 Python version:
python --version
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Warning: .env.local file not found
    echo Make sure you have ANTHROPIC_API_KEY configured
    echo.
)

echo 🚀 Starting backend service...
echo 📡 The service will run in the background
echo 💡 Check backend_runner.log for detailed logs
echo.
echo ============================================
echo.

REM Start the backend service
python backend_runner.py

echo.
echo 🛑 Backend service stopped
pause
