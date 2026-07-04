@echo off
title SyncScore AI - Quiz Generator Agent Launcher
echo ===============================================================
echo        SyncScore AI - Quiz Generator Agent Launcher
echo ===============================================================
echo.

:: Check if Node.js is installed and available in PATH
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [STATUS] Node.js is not detected in your system's PATH.
    echo [STATUS] Launching standalone interactive dashboard preview in default browser...
    echo.
    timeout /t 2 >nul
    start "" "C:\Users\440 G6\.gemini\antigravity-ide\brain\546d8485-4d15-4288-8983-655a6fcb6352\scratch\interactive_preview.html"
    exit /b
)

echo [STATUS] Node.js detected in PATH.
echo [STATUS] Installing backend dependencies...
echo.
call npm install

echo.
echo [STATUS] Starting Express backend server process...
start /b cmd /c "node server.js"

echo.
echo [STATUS] Server starting on http://localhost:5000
echo [STATUS] Launching interactive dashboard preview...
timeout /t 3 >nul
start "" "C:\Users\440 G6\.gemini\antigravity-ide\brain\546d8485-4d15-4288-8983-655a6fcb6352\scratch\interactive_preview.html"
