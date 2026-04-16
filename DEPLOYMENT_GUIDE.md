# Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 13+
- Node.js 18+ (if not using Docker)
- Python 3.8+ (if not using Docker)

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd fair-admission-system

# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run migration:deploy
docker-compose exec backend npm run db:seed

# View logs
docker-compose logs -f
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ML Service: http://localhost:5000
- Database Admin: http://localhost:8080

### Option 2: Manual Deployment

#### 1. Setup Database

```bash
# Create PostgreSQL database
createdb admission_system

# Or using Docker:
docker run -d \
  --name postgres \
  -e POSTGRES_USER=admission_user \
  -e POSTGRES_PASSWORD=your_secure_password \
  -e POSTGRES_DB=admission_system \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 2. Deploy Backend

```bash
cd backend

# Install dependencies
npm install --production

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Seed data
npm run db:seed

# Start with PM2 (recommended for production)
npm install -g pm2
pm2 start dist/index.js --name "admission-api"
```

#### 3. Deploy ML Service

```bash
cd ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start with Gunicorn
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app

# Or with PM2
npm install -g pm2
pm2 start "gunicorn --bind 0.0.0.0:5000 --workers 4 app:app" --name "ml-service" --interpreter python
```

#### 4. Deploy Frontend

```bash
# Build
npm run build

# Serve with Nginx or any static server
npm install -g serve
serve -s dist -p 3000
```

## Environment Configuration

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/admission_system

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRY=7d

# Server
PORT=3000
NODE_ENV=production

# ML Service
ML_SERVICE_URL=http://localhost:5000

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=app-specific-password
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_ML_SERVICE_URL=https://ml.yourdomain.com
```

## Production Checklist

- [ ] Use HTTPS for all endpoints
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Configure CORS to specific origins
- [ ] Enable database backups
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting
- [ ] Enable request logging
- [ ] Use environment variables (not hardcoded secrets)
- [ ] Set NODE_ENV=production
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Configure database connection pooling
- [ ] Set up automated deployments
- [ ] Configure health checks

## Scaling

### Horizontal Scaling

```yaml
# Multiple backend instances with load balancer
services:
  backend-1:
    # ...
  backend-2:
    # ...
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Caching Layer

```bash
# Add Redis for caching
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_applicants_pathway ON applicants(pathway);
CREATE INDEX idx_applications_program_status ON applications(program_id, status);
CREATE INDEX idx_admissions_applicant ON admissions(applicant_id);
```

## Monitoring

### Application Performance

```bash
# PM2 monitoring
pm2 monit

# Logs
docker-compose logs -f backend
docker-compose logs -f ml-service
```

### Database Monitoring

```bash
# Connect to PostgreSQL
psql -U admission_user -d admission_system

# Check connections
SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;

# Check slow queries
SELECT query_time, query FROM pg_stat_statements ORDER BY query_time DESC;
```

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# ML Service health
curl http://localhost:5000/health

# Database
curl http://localhost:3000/api
```

## Backup & Recovery

### Database Backup

```bash
# Backup
pg_dump -U admission_user -d admission_system > backup.sql

# Docker backup
docker exec postgres pg_dump -U admission_user admission_system > backup.sql

# Restore
psql -U admission_user -d admission_system < backup.sql
```

### Automated Backups with Cron

```bash
# Add to crontab
0 2 * * * pg_dump -U admission_user -d admission_system > /backups/db_$(date +\%Y\%m\%d).sql
```

### File Backups

```bash
# Backup ML models
tar -czf models_backup.tar.gz ml-service/models/

# Backup uploaded data
rsync -avz /data /backups/data_$(date +%Y%m%d)
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Verify connection
psql postgres://admission_user:password@localhost:5432/admission_system

# Check connection pool
netstat -an | grep 5432
```

### API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Check if port is in use
lsof -i :3000

# Restart service
docker-compose restart backend
```

### ML Service Errors

```bash
# Check Python errors
docker-compose logs ml-service

# Test endpoint
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"mathSkill": 75, "technicalSkill": 80, ...}'
```

### High Memory Usage

```sql
-- PostgreSQL: Check query performance
EXPLAIN ANALYZE SELECT * FROM applications WHERE status = 'SUBMITTED';

-- Add missing indexes
CREATE INDEX idx_applications_status ON applications(status);
```

## Updating the Application

```bash
# Pull latest code
git pull origin main

# Update dependencies
cd backend && npm install --production
cd ../ml-service && pip install -r requirements.txt

# Run migrations
cd backend && npm run migration:deploy

# Rebuild Docker images
docker-compose build --no-cache
docker-compose up -d

# Verify
docker-compose ps
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Performance Optimization

```typescript
// Backend optimizations
// 1. Database query optimization with Prisma select
const users = await prisma.user.findMany({
  select: { id: true, email: true }, // Only fetch needed fields
});

// 2. Implement caching
const redis = new Redis();
const cachedData = await redis.get('admin-stats');

// 3. Use pagination
const apps = await prisma.application.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

---

For additional support, see the main README.md
