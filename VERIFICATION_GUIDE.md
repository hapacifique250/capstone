# ✅ Verification & Testing Guide

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.8+ installed (`python --version`)
- [ ] PostgreSQL 13+ available
- [ ] Docker & Docker Compose installed (if using containers)
- [ ] Git installed

### File Structure
- [ ] `backend/` directory exists with source code
- [ ] `ml-service/` directory with Python files
- [ ] `src/` frontend React components
- [ ] `prisma/schema.prisma` exists
- [ ] All documentation files present

### Configuration Files
- [ ] `backend/.env.example` exists
- [ ] `docker-compose.yml` exists
- [ ] `Dockerfile` files for each service
- [ ] `package.json` files present
- [ ] `requirements.txt` for Python

## 🚀 Deployment Verification

### Step 1: Start Services

#### Option A: Docker Compose (Recommended)
```bash
cd fair-efficient-unbiased-1
docker-compose up -d

# Verify all containers are running
docker-compose ps
# Should show: postgres, backend, ml-service, frontend - all "Up"
```

#### Option B: Manual Start
```bash
# Terminal 1: PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=secure_password_change_me \
  -e POSTGRES_DB=admission_system \
  -p 5432:5432 \
  postgres:15-alpine

# Terminal 2: ML Service
cd ml-service
python app.py

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
npm run dev
```

### Step 2: Health Checks

```bash
# API Health
curl http://localhost:3000/health
# Expected: { "status": "ok", "timestamp": "..." }

# ML Service Health
curl http://localhost:5000/health
# Expected: { "status": "ok", "timestamp": "..." }

# Database Connection
curl http://localhost:3000/api
# Expected: API documentation JSON
```

### Step 3: Database Initialization

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
# Expected: ✓ Created admin user, ✓ Created programs...
```

### Step 4: Test Data Generation

```bash
cd data
python generate_synthetic_data.py
# Expected: ✓ Generated 500 applicants
#           ✓ Saved to synthetic_data.json

# Verify
ls -la synthetic_data.json
# Should show file size ~2MB+
```

## 🧪 API Testing

### Test Authentication

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
# Expected: 201 status with token

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
# Expected: 200 status with token

# Get current user (use token from login)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3000/api/auth/me
# Expected: 200 status with user data
```

### Test Programs

```bash
# List programs
curl http://localhost:3000/api/programs
# Expected: 200 status with program array

# Get specific program
curl http://localhost:3000/api/programs/prog-001
# Expected: 200 status with program details
```

### Test ML Service

```bash
# Make prediction
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "mathSkill": 75.5,
    "technicalSkill": 80.0,
    "scienceSkill": 70.0,
    "communication": 75.0,
    "problemSolving": 78.0,
    "pathway": "REB",
    "gender": "Male"
  }'
# Expected: Probabilities and confidence score

# Get model metrics
curl http://localhost:5000/metrics
# Expected: Model accuracy, precision, recall, f1
```

## 📊 Application Testing

### Manual Test Flow

1. **User Registration**
   - Open http://localhost:5173
   - Register new account
   - Verify email confirmation (development mode skips this)

2. **View Programs**
   - Login to applicant dashboard
   - See list of available programs
   - Click program to view requirements

3. **Submit Application**
   - Click "New Application"
   - Select program and choice priority
   - Enter academic data (REB or TVET)
   - Submit

4. **Check Status**
   - Return to dashboard
   - See application status
   - View scores breakdown

5. **Admin Processing**
   - Login as admin (`admin@rwandapolytechnic.edu / Admin@123456`)
   - Go to Admin Dashboard
   - Click "Process Admissions"
   - View results

6. **Check Fairness**
   - In Admin Dashboard
   - Navigate to "Fairness Report"
   - Review metrics by gender, district, pathway

## 🔍 Detailed Verification Checklist

### Backend API

```bash
# Check all routes are registered
curl http://localhost:3000/api

# Verify error handling
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:3000/api/auth/me
# Expected: 401 Unauthorized

# Verify rate limiting (should work for valid requests)
for i in {1..5}; do 
  curl http://localhost:3000/api/programs
done
```

### Database

```bash
# Connect to database
psql -U admission_user -d admission_system

# Check users table
SELECT COUNT(*) FROM users;
# Expected: At least 1 (admin user)

# Check programs table
SELECT COUNT(*) FROM programs;
# Expected: At least 3 (seeded programs)

# Check indexes exist
SELECT * FROM pg_indexes WHERE tablename IN ('users', 'applicants', 'applications');
```

### ML Service

```bash
# Train model (if data available)
curl -X POST http://localhost:5000/train \
  -H "Content-Type: application/json" \
  -d '{"data": [{"mathSkill": 75, "technicalSkill": 80, ...}]}'

# Verify model metrics updated
curl http://localhost:5000/metrics
```

### Frontend

- [ ] Page loads without errors (check browser console)
- [ ] Authentication flows work (register/login)
- [ ] Navigation between routes works
- [ ] API calls return data (check network tab)
- [ ] Charts render correctly
- [ ] Forms validate input
- [ ] Error messages display
- [ ] Responsive design works on mobile

## 🐛 Common Issues & Solutions

### Issue: "Port already in use"
```bash
# Kill process using port
# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Database connection refused"
```bash
# Check PostgreSQL is running
ps aux | grep postgres  # Linux/Mac
tasklist | findstr postgres  # Windows

# Verify DATABASE_URL in .env
cat backend/.env | grep DATABASE_URL

# Test connection
psql postgresql://user:password@localhost:5432/admission_system
```

### Issue: "Module not found"
```bash
# Reinstall dependencies
cd backend && npm install
cd ../ml-service && pip install -r requirements.txt

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

### Issue: "ML Service not responding"
```bash
# Check if Flask is running
curl http://localhost:5000/health

# Check Python path
which python3

# Check requirements installed
pip list | grep scikit-learn,flask

# Reinstall
pip install -r requirements.txt --force-reinstall
```

## 📊 Performance Testing

### Load Testing

```bash
# Using Apache Bench (ab)
ab -n 1000 -c 10 http://localhost:3000/api/programs

# Expected: High success rate, <500ms avg response time
```

### Database Performance

```sql
-- Check slow queries
EXPLAIN ANALYZE 
SELECT * FROM applications 
WHERE program_id = 'xxx' AND status = 'SUBMITTED'
ORDER BY final_score DESC;

-- Should use indexes (check Seq Scan vs Index Scan)
```

## 📈 Monitoring

### View Logs

```bash
# Docker Compose
docker-compose logs backend
docker-compose logs ml-service
docker-compose logs postgres

# Follow logs
docker-compose logs -f backend
```

### Database Monitoring

```sql
-- Current connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname != 'pg_catalog' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## ✅ Final Verification

Run this comprehensive test:

```bash
#!/bin/bash

echo "🔍 Rwanda Polytechnic Admission System - Verification"
echo "===================================================="

# 1. API Health
echo -n "API Health Check... "
if curl -s http://localhost:3000/health | grep -q "ok"; then
  echo "✅"
else
  echo "❌"
fi

# 2. ML Service Health
echo -n "ML Service Health Check... "
if curl -s http://localhost:5000/health | grep -q "ok"; then
  echo "✅"
else
  echo "❌"
fi

# 3. Database Connection
echo -n "Database Connection... "
if psql -U admission_user -d admission_system -c "SELECT 1" > /dev/null 2>&1; then
  echo "✅"
else
  echo "❌"
fi

# 4. Get Programs
echo -n "Programs API... "
if curl -s http://localhost:3000/api/programs | grep -q "Computer Science"; then
  echo "✅"
else
  echo "❌"
fi

# 5. ML Prediction
echo -n "ML Prediction... "
if curl -s -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"mathSkill": 75, "technicalSkill": 80, "scienceSkill": 70, "communication": 75, "problemSolving": 78, "pathway": "REB"}' \
  | grep -q "admissionProbability"; then
  echo "✅"
else
  echo "❌"
fi

echo ""
echo "✅ System Ready for Testing!"
```

Save as `verify.sh` and run:
```bash
bash verify.sh
```

---

**Once all checks pass, your system is ready for production use!** 🚀
