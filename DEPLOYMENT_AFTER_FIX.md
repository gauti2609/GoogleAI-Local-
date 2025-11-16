# Quick Deployment Guide - After OpenSSL Fix

## What Was Fixed

The API container was failing due to missing OpenSSL libraries required by Prisma. We've resolved this by switching from Alpine Linux to Debian slim base image.

## Deployment Instructions

### For Development (docker-compose.yml)

```bash
# 1. Stop existing containers
docker-compose down -v

# 2. Rebuild and start
docker-compose up --build -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f api
```

### For Production (docker-compose.prod.yml) - RECOMMENDED

```bash
# 1. Stop existing containers
docker-compose -f docker-compose.prod.yml down -v

# 2. Rebuild with no cache
docker-compose -f docker-compose.prod.yml up --build -d

# 3. Monitor startup (takes ~2 minutes)
docker-compose -f docker-compose.prod.yml ps

# 4. Check API logs
docker-compose -f docker-compose.prod.yml logs api
```

## Expected Successful Output

You should see:

```
✔ Container googleai-local--db-1        Healthy
✔ Container googleai-local--api-1       Healthy  
✔ Container googleai-local--frontend-1  Started
```

And in the API logs:

```
api-1  | Starting FinAutomate Backend...
api-1  | Running database migrations...
api-1  | Prisma schema loaded from prisma/schema.prisma
api-1  | 
api-1  | Generating Prisma Client...
api-1  | ✔ Generated Prisma Client (v5.22.0)
api-1  | 
api-1  | Starting application...
api-1  | [Nest] XXX  - LOG [NestFactory] Starting Nest application...
api-1  | [Nest] XXX  - LOG [NestApplication] Nest application successfully started
```

**No OpenSSL warnings should appear!**

## Verification

### 1. Check Container Health
```bash
docker-compose ps
```
All containers should show "Up" and "healthy" status (in production mode).

### 2. Test API Directly
```bash
curl http://localhost:3000/health
```
Should return: `{"status":"ok"}`

### 3. Test Through Frontend
```bash
curl http://localhost:8080/api/health
```
Should return: `{"status":"ok"}`

### 4. Access Application
Open browser: http://localhost:8080

## Troubleshooting

### If API container is still unhealthy:

1. **Check logs for errors:**
   ```bash
   docker-compose logs api
   ```

2. **Verify database is ready:**
   ```bash
   docker-compose logs db | tail -20
   ```
   Should see: "database system is ready to accept connections"

3. **Check environment variables:**
   ```bash
   docker-compose exec api env | grep DATABASE_URL
   ```

4. **Rebuild from scratch:**
   ```bash
   docker-compose down -v
   docker system prune -a -f
   docker-compose up --build -d
   ```

### If you see OpenSSL warnings:

This should not happen with the fix. If you still see warnings:
1. Ensure you've pulled the latest code
2. Rebuild without cache: `docker-compose up --build --no-cache -d`
3. Check that backend/Dockerfile uses `node:20-slim`, not `node:20-alpine`

## What Changed

- ✅ Base image: `node:20-alpine` → `node:20-slim`
- ✅ Added OpenSSL 3.0 installation
- ✅ Added wget for health checks
- ✅ Maintained small image size with cache cleanup

## Documentation

For detailed technical information, see:
- `OPENSSL_FIX.md` - Complete technical documentation
- `MIGRATION_FIX_SUMMARY.md` - Previous migration fixes
- `API_HEALTHCHECK_FIX.md` - Health check configuration

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs api`
2. Verify the Dockerfile changes were applied
3. Try a clean rebuild with `docker-compose down -v && docker-compose up --build -d`
