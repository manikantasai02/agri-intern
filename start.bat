@echo off
echo ========================================================
echo   Starting AgriConnect (Backend + Frontend)
echo ========================================================

echo [1/2] Launching Backend Server on port 5000...
start "AgriConnect Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && node src/app.js"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend Client on port 5173...
start "AgriConnect Frontend (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================================
echo   AgriConnect is running!
echo   Website:  http://localhost:5173
echo   API:      http://localhost:5000/api/v1
echo ========================================================
timeout /t 3 >nul
start http://localhost:5173
