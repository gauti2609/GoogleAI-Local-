# How to Access the Application

## Overview
This guide explains how to properly run and access the GoogleAI-Local application after deployment.

## Prerequisites
- Docker and Docker Compose installed
- `.env` file configured with required environment variables (copy from `.env.example`)

## Starting the Application

### For Production Deployment
```bash
# Navigate to the project directory
cd /path/to/GoogleAI-Local-

# Start all services in detached mode
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for all containers to become healthy (about 2 minutes)
docker-compose -f docker-compose.prod.yml ps
```

### For Development
```bash
docker-compose up --build -d
```

## Accessing the Application

### Frontend (Web UI)
**URL**: http://localhost:8080

The frontend is served by Nginx and provides the web interface for the application.

### Backend API (Direct Access)
**Note**: The API container is NOT directly exposed to your host machine in production configuration.

To access the API directly:
1. **Through the frontend proxy**: http://localhost:8080/api/
2. **Inside the Docker network only**: The API runs on port 3000 inside the container

### Common Issues

#### Issue 1: "localhost:8080 refused to connect"

**Cause**: The API container is unhealthy, preventing the frontend from starting.

**Solution**:
1. Check container status:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. Check logs for errors:
   ```bash
   # Check API logs
   docker-compose -f docker-compose.prod.yml logs api

   # Check all logs
   docker-compose -f docker-compose.prod.yml logs -f
   ```

3. Common fixes:
   - **Migration errors**: Ensure database is running and migrations are correct
   - **Missing environment variables**: Check `.env` file has all required values
   - **Port conflicts**: Ensure port 8080 is not in use by another application

4. Restart the services:
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

#### Issue 2: API container becomes unhealthy

**Check logs**:
```bash
docker-compose -f docker-compose.prod.yml logs api | tail -50
```

**Common causes**:
- Database connection issues
- Missing API_KEY or JWT_SECRET in .env
- Migration failures
- Insufficient startup time (rare)

#### Issue 3: Page loads but shows errors

**Check backend health**:
```bash
curl http://localhost:8080/api/health
```

Expected response: `{"status":"ok"}`

If this fails, check API logs as shown above.

## Verification Steps

After starting the application, verify everything is working:

```bash
# 1. Check all containers are running and healthy
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                  STATUS
# googleai-local--db-1       Up (healthy)
# googleai-local--api-1      Up (healthy)
# googleai-local--frontend-1 Up (healthy)

# 2. Check frontend is accessible
curl -I http://localhost:8080
# Should return: HTTP/1.1 200 OK

# 3. Check API through frontend proxy
curl http://localhost:8080/api/health
# Should return: {"status":"ok"}
```

## Stopping the Application

```bash
# Stop all containers
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose -f docker-compose.prod.yml down -v
```

## Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f api
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f db
```

## Architecture

```
┌─────────────────────────────────────────┐
│  Your Browser                           │
│  http://localhost:8080                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Frontend Container (Nginx on port 80)  │
│  - Serves React app                     │
│  - Proxies /api/* to backend            │
│  - Exposed as localhost:8080            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  API Container (NestJS on port 3000)    │
│  - REST API endpoints                   │
│  - NOT directly exposed to host         │
│  - Only accessible via frontend proxy   │
│    or inside Docker network             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Database Container (PostgreSQL)        │
│  - Port 5432 (internal only)            │
│  - Data persisted in Docker volume      │
└─────────────────────────────────────────┘
```

## Environment Variables

Required variables in `.env` file:

```bash
# Database Configuration
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=finautomatedb

# Backend Configuration
JWT_SECRET=your-secure-random-string-here
API_KEY=your-google-gemini-api-key-here
DATABASE_URL=postgresql://user:password@db:5432/finautomatedb
```

## Troubleshooting Tips

1. **Always check logs first**: Most issues are visible in container logs
2. **Wait for healthchecks**: Containers need time to initialize (up to 2 minutes)
3. **Verify .env file**: Ensure all required environment variables are set
4. **Check port conflicts**: Make sure port 8080 is not used by another application
5. **Clean start**: If issues persist, do a clean restart:
   ```bash
   docker-compose -f docker-compose.prod.yml down -v
   docker system prune -f
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

## Support

For more detailed information, see:
- `DOCKER_DEPLOYMENT.md` - Complete deployment guide
- `DOCKER_FIX_SUMMARY.md` - History of fixes and known issues
- `HEALTHCHECK_FIX.md` - Container health check configuration
