# Docker Healthcheck Fix - Testing Guide

## Summary of Changes

This fix resolves the issue where the API container becomes unhealthy during startup, preventing the entire application from starting properly.

### What Was Changed
- **docker-compose.prod.yml**: Added `start_period` parameter to healthchecks
  - API: `start_period: 90s` (allows time for migrations and initialization)
  - Frontend: `start_period: 10s` (allows time for Nginx to start)

### Why This Fix Works

**Before the fix:**
- Health checks began immediately when containers started
- API needed time for: database migrations → Prisma client generation → NestJS initialization
- Early health check failures marked the container as unhealthy
- Frontend couldn't start due to unhealthy API dependency

**After the fix:**
- Health checks still run during `start_period` but don't count towards health status
- API has 90 seconds to complete initialization before health matters
- After `start_period`, normal healthcheck rules apply (30s interval, 3 retries)
- Containers have adequate time to start properly

## Testing Instructions

### Prerequisites
```bash
# Ensure you have:
# 1. Docker and Docker Compose installed
# 2. .env file configured with API_KEY and JWT_SECRET
# 3. No conflicting containers running
```

### Test 1: Clean Start
```bash
# Stop any existing containers
docker-compose -f docker-compose.prod.yml down -v

# Build and start with fresh database
docker-compose -f docker-compose.prod.yml up --build -d

# Watch the startup process
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

**Expected Result:**
```
✔ Container finautomate_db        Healthy      ~20s
✔ Container finautomate_api       Healthy      ~60-90s
✔ Container finautomate_frontend  Running      ~95-105s
```

### Test 2: Check Container Health
```bash
# Wait for startup to complete (about 2 minutes)
sleep 120

# Check all containers are healthy
docker-compose -f docker-compose.prod.yml ps

# Expected output: All containers should show "Up" and "healthy"
```

### Test 3: Verify Application Functionality
```bash
# Test database is accessible
docker exec finautomate_db psql -U user -d finautomatedb -c "SELECT 1;"

# Test API health endpoint
curl http://localhost:3000/health
# Expected: {"status":"ok"}

# Test frontend is serving
curl http://localhost:8080
# Expected: HTML content from React app

# Test API proxy through frontend
curl http://localhost:8080/api/health
# Expected: {"status":"ok"}
```

### Test 4: Check Logs for Issues
```bash
# API logs should show successful startup
docker-compose -f docker-compose.prod.yml logs api | grep -i "error\|fail" || echo "No errors found"

# Database logs should show migrations completed
docker-compose -f docker-compose.prod.yml logs api | grep -i "migration"

# Frontend logs should show Nginx started
docker-compose -f docker-compose.prod.yml logs frontend
```

## Verification Checklist

- [ ] Database container starts and becomes healthy (~20s)
- [ ] API container starts migrations successfully
- [ ] API container becomes healthy within 90s
- [ ] Frontend container starts after API is healthy
- [ ] Application accessible at http://localhost:8080
- [ ] API health endpoint responds at http://localhost:3000/health
- [ ] No error messages in container logs
- [ ] All containers show "healthy" status in `docker-compose ps`

## Troubleshooting

### If API still becomes unhealthy:

1. **Check API logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs api
   ```
   Look for:
   - Database connection errors
   - Migration failures
   - Environment variable issues
   - Port binding conflicts

2. **Verify environment variables:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec api env | grep -E "DATABASE_URL|NODE_ENV|API_KEY|JWT_SECRET"
   ```

3. **Check database connectivity:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec api wget -qO- http://db:5432 || echo "DB not reachable"
   ```

4. **Increase start_period if migrations are slow:**
   Edit `docker-compose.prod.yml` and change:
   ```yaml
   start_period: 120s  # Increase from 90s to 120s
   ```

### If build fails:
```bash
# Clean Docker cache
docker system prune -af
docker volume prune -f

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## Success Criteria

The fix is successful when:
1. All three containers start without errors
2. All containers show "healthy" status
3. Application is accessible at http://localhost:8080
4. No unhealthy container errors in logs
5. Frontend successfully depends on healthy API

## Additional Notes

- **Startup time**: Total startup takes about 2 minutes on first run (includes image pulls and migrations)
- **Subsequent starts**: Much faster (~30-60s) as images are cached
- **Production use**: The 90s start_period is appropriate for production as migrations can take time
- **Development**: For faster iteration, use `docker-compose.yml` without healthchecks

## Related Documentation
- `DOCKER_DEPLOYMENT.md` - Full deployment guide
- `DOCKER_FIX_SUMMARY.md` - History of Docker fixes
- `docker-compose.prod.yml` - Production configuration file
