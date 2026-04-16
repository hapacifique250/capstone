@echo off
REM Quick start script for Windows

setlocal enabledelayedexpansion

echo.
echo 🚀 Starting Rwanda Polytechnic Admission System
echo =============================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 📦 Docker is running
) else (
    echo ⚠ Docker is not running. Starting Docker...
    docker-machine start default 2>nul
)

REM Start PostgreSQL
echo 📦 Starting PostgreSQL...
docker run -d ^
    --name postgres ^
    -e POSTGRES_USER=admission_user ^
    -e POSTGRES_PASSWORD=secure_password_change_me ^
    -e POSTGRES_DB=admission_system ^
    -p 5432:5432 ^
    postgres:15-alpine 2>nul

timeout /t 5 /nobreak

REM Start ML Service
echo 🤖 Starting ML Service...
cd ml-service
call venv\Scripts\activate
start /b python app.py
cd ..

timeout /t 3 /nobreak

REM Start Backend
echo 🔧 Starting Backend...
cd backend
start cmd /k npm run dev
cd ..

timeout /t 5 /nobreak

REM Start Frontend
echo 🎨 Starting Frontend...
start cmd /k npm run dev

timeout /t 3 /nobreak

REM Display information
echo.
echo ✅ System Started Successfully!
echo.
echo 📍 Access Points:
echo    - Frontend: http://localhost:5173
echo    - API: http://localhost:3000
echo    - ML Service: http://localhost:5000
echo.
echo 👤 Test Credentials:
echo    Email: admin@rwandapolytechnic.edu
echo    Password: Admin@123456
echo.
echo Close this window when done.

pause
