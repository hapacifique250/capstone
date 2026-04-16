#!/bin/bash

# Quick start guide for Rwanda Polytechnic Admission System

cd "$(dirname "$0")" || exit

echo "🚀 Starting Rwanda Polytechnic Admission System"
echo "=============================================="
echo ""

# Function to check if service is running
check_service() {
    if curl -s "$1" > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Start PostgreSQL if using Docker
echo "📦 Starting PostgreSQL..."
docker run -d \
    --name postgres \
    -e POSTGRES_USER=admission_user \
    -e POSTGRES_PASSWORD=secure_password_change_me \
    -e POSTGRES_DB=admission_system \
    -p 5432:5432 \
    -v postgres_data:/var/lib/postgresql/data \
    postgres:15-alpine 2>/dev/null || true

sleep 5

# Start ML Service
echo "🤖 Starting ML Service..."
cd ml-service
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate
python app.py &
ML_PID=$!
cd ..
sleep 3

# Start Backend
echo "🔧 Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
sleep 5

# Start Frontend
echo "🎨 Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

sleep 3

# Display access information
echo ""
echo "✅ System Started Successfully!"
echo ""
echo "📍 Access Points:"
echo "   - Frontend: http://localhost:5173"
echo "   - API: http://localhost:3000"
echo "   - ML Service: http://localhost:5000"
echo "   - Database Admin: http://localhost:8080 (if using docker-compose)"
echo ""
echo "👤 Test Credentials:"
echo "   Email: admin@rwandapolytechnic.edu"
echo "   Password: Admin@123456"
echo ""
echo "📚 Documentation:"
echo "   - API Docs: See API_DOCUMENTATION.md"
echo "   - Deployment: See DEPLOYMENT_GUIDE.md"
echo "   - Full Info: See COMPREHENSIVE_README.md"
echo ""
echo "⚠️  Note: Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
