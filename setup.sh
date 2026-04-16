#!/bin/bash

# Rwanda Polytechnic Admission System - Setup Script
# This script sets up the entire application

set -e

echo "🚀 Rwanda Polytechnic Fair Admission System - Setup"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check prerequisites
echo -e "\n${BLUE}Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm $(npm --version)"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi
echo -e "${GREEN}✓${NC} Python $(python3 --version)"

# 2. Setup Backend
echo -e "\n${BLUE}Setting up Backend...${NC}"
cd backend

if [ -f .env ]; then
    echo -e "${YELLOW}⚠${NC}  .env file exists, skipping creation"
else
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env file"
fi

# Update .env with local PostgreSQL URL
sed -i 's|DATABASE_URL=.*|DATABASE_URL="postgresql://admission_user:secure_password@localhost:5432/admission_system"|' .env

echo -e "${GREEN}✓${NC} Installing dependencies..."
npm install --legacy-peer-deps

echo -e "${GREEN}✓${NC} Generating Prisma client..."
npx prisma generate

echo "⚠️  Database migration required before first run"
echo "   Run: npm run migration:create"

cd ..

# 3. Setup ML Service
echo -e "\n${BLUE}Setting up ML Service...${NC}"
cd ml-service

if [ ! -d "venv" ]; then
    echo -e "${GREEN}✓${NC} Creating Python virtual environment..."
    python3 -m venv venv
fi

echo -e "${GREEN}✓${NC} Activating virtual environment and installing dependencies..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate
pip install --quiet -r requirements.txt

echo -e "${GREEN}✓${NC} ML Service ready"

cd ..

# 4. Setup Frontend
echo -e "\n${BLUE}Setting up Frontend...${NC}"

if [ -f .env.local ]; then
    echo -e "${YELLOW}⚠${NC}  .env.local file exists, skipping creation"
else
    cp .env.example .env.local
    echo -e "${GREEN}✓${NC} Created .env.local file"
fi

echo -e "${GREEN}✓${NC} Installing frontend dependencies..."
npm install --legacy-peer-deps

# 5. Generate synthetic data
echo -e "\n${BLUE}Generating sample data...${NC}"
python3 data/generate_synthetic_data.py

# 6. Display next steps
echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Set up PostgreSQL database:"
echo "   - Ensure PostgreSQL is running on localhost:5432"
echo "   - Create database: createdb admission_system"
echo "   - Or use: docker run -d --name postgres -e POSTGRES_PASSWORD=secure_password -p 5432:5432 postgres:15-alpine"
echo ""
echo "2. Run database migrations:"
echo "   cd backend"
echo "   npm run migration:create"
echo "   npm run db:seed"
echo ""
echo "3. Start ML Service:"
echo "   cd ml-service"
echo "   source venv/bin/activate  # or venv\\Scripts\\activate on Windows"
echo "   python app.py"
echo ""
echo "4. Start Backend (in new terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "5. Start Frontend (in new terminal):"
echo "   npm run dev"
echo ""
echo "6. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   API: http://localhost:3000"
echo "   ML Service: http://localhost:5000"
echo ""
echo -e "${BLUE}Or use Docker Compose for everything:${NC}"
echo "   docker-compose up -d"
echo ""
