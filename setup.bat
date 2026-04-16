@echo off
REM Rwanda Polytechnic Admission System - Windows Setup Script

echo.
echo 🚀 Rwanda Polytechnic Fair Admission System - Setup
echo ==================================================

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)
echo ✓ Node.js is installed

REM Check Python
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python is not installed. Please install Python 3.8+
    exit /b 1
)
echo ✓ Python is installed

REM Setup Backend
echo.
echo 🔧 Setting up Backend...
cd backend

if exist .env (
    echo ⚠  .env file exists, skipping creation
) else (
    copy .env.example .env
    echo ✓ Created .env file
)

echo ✓ Installing dependencies...
call npm install --legacy-peer-deps

echo ✓ Generating Prisma client...
call npx prisma generate

cd ..

REM Setup ML Service
echo.
echo 🔧 Setting up ML Service...
cd ml-service

if not exist venv (
    echo ✓ Creating Python virtual environment...
    python -m venv venv
)

echo ✓ Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --quiet -r requirements.txt

cd ..

REM Setup Frontend
echo.
echo 🔧 Setting up Frontend...

if exist .env.local (
    echo ⚠  .env.local file exists, skipping creation
) else (
    copy .env.example .env.local
    echo ✓ Created .env.local file
)

echo ✓ Installing frontend dependencies...
call npm install --legacy-peer-deps

REM Generate data
echo.
echo 📊 Generating sample data...
python data\generate_synthetic_data.py

REM Done
echo.
echo ✅ Setup Complete!
echo.
echo 📋 Next Steps:
echo.
echo 1. Start PostgreSQL:
echo    docker run -d --name postgres -e POSTGRES_PASSWORD=secure_password -p 5432:5432 postgres:15-alpine
echo.
echo 2. Run database migrations:
echo    cd backend
echo    npm run migration:create
echo    npm run db:seed
echo.
echo 3. Start ML Service:
echo    cd ml-service
echo    venv\Scripts\activate
echo    python app.py
echo.
echo 4. Start Backend (new terminal):
echo    cd backend
echo    npm run dev
echo.
echo 5. Start Frontend (new terminal):
echo    npm run dev
echo.
echo 6. Access the application:
echo    Frontend: http://localhost:5173
echo    API: http://localhost:3000
echo    ML Service: http://localhost:5000
echo.
echo Or use Docker Compose:
echo    docker-compose up -d
echo.
pause
