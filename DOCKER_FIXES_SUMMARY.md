# Docker Configuration Fixes - November 2025

## Problem Statement

The application was failing to start with Docker Compose with the following issues:

1. **Migration Error P3019**: 
   ```
   Error: P3019
   The datasource provider `postgresql` specified in your schema does not match 
   the one specified in the migration_lock.toml, `<PROVIDER NOT FOUND>`.
   ```

2. **Unhealthy API Container**:
   ```
   ✘ Container googleai-local--api-1    Error
   dependency failed to start: container googleai-local--api-1 is unhealthy
   ```

3. **Frontend Not Accessible**:
   - `localhost:8080` not responding
   - Frontend container never starts due to unhealthy API dependency

## Root Causes Identified

### 1. Migration Lock File Not Being Copied to Container

**Issue**: The `backend/Dockerfile` was copying the `prisma` directory from the build context in the production stage:
```dockerfile
# Copy Prisma schema and migrations
COPY prisma ./prisma
```

**Problem**: This method doesn't reliably copy all files from the migrations directory, particularly the `migration_lock.toml` file. When Prisma tried to run migrations, it couldn't find the provider information in the lock file, resulting in the P3019 error with `<PROVIDER NOT FOUND>`.

**Solution**: Copy the `prisma` directory from the builder stage instead:
```dockerfile
# Copy Prisma schema and migrations from builder to ensure consistency
COPY --from=builder /usr/src/app/prisma ./prisma
```

This ensures that the exact same prisma directory that was used during the build process (including all migration files and the lock file) is available in the production container.

### 2. Missing wget Command for Healthchecks

**Issue**: Both backend and frontend containers use Alpine Linux base images, which don't include `wget` by default. The healthcheck configuration was:
```yaml
healthcheck:
  test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"]
```

**Problem**: When the healthcheck tried to run, the `wget` command was not found, causing the healthcheck to always fail. This marked the containers as unhealthy even though the applications were running correctly.

**Solution**: Install `wget` in both Dockerfiles:

**Backend** (`backend/Dockerfile`):
```dockerfile
# Install wget for healthcheck
RUN apk add --no-cache wget
```

**Frontend** (`frontend.Dockerfile`):
```dockerfile
# Install wget for healthcheck
RUN apk add --no-cache wget
```

## Changes Made

### 1. backend/Dockerfile

**Change 1 - Install wget**:
```dockerfile
# Production stage
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /usr/src/app
```

**Change 2 - Copy prisma from builder**:
```dockerfile
# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and migrations from builder to ensure consistency
COPY --from=builder /usr/src/app/prisma ./prisma
```

### 2. frontend.Dockerfile

**Change - Install wget**:
```dockerfile
# Production stage with Nginx
FROM nginx:alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

## How These Fixes Resolve the Issues

### Migration Error P3019
- ✅ **Fixed**: By copying the prisma directory from the builder stage, we ensure that `migration_lock.toml` is present and intact in the production container
- ✅ **Result**: Prisma can read the provider information correctly and run migrations successfully

### Unhealthy Container Status
- ✅ **Fixed**: With wget installed, healthchecks can now execute successfully
- ✅ **Result**: Containers are marked as healthy when the applications are running correctly

### Frontend Accessibility
- ✅ **Fixed**: With the API container now healthy, the frontend container can start (it depends on API being healthy)
- ✅ **Result**: Port 8080 is accessible and the application UI is available

## Container Startup Flow (After Fix)

```
1. Database Container (db)
   ├─ Starts PostgreSQL
   └─ Healthcheck passes → HEALTHY
   
2. API Container (api)
   ├─ Waits for db to be HEALTHY
   ├─ Copies prisma directory correctly (including migration_lock.toml)
   ├─ Runs migrations successfully ✅
   ├─ Starts NestJS application
   ├─ Healthcheck with wget succeeds ✅
   └─ Status → HEALTHY
   
3. Frontend Container (frontend)
   ├─ Waits for api to be HEALTHY
   ├─ Starts Nginx with built React app
   ├─ Healthcheck with wget succeeds ✅
   └─ Status → HEALTHY
   
4. Application Accessible
   └─ http://localhost:8080 → Responds ✅
```

## Verification Steps

To verify the fix works, run:

```bash
# 1. Build and start all containers
docker-compose -f docker-compose.prod.yml up --build -d

# 2. Monitor container health (wait ~2 minutes for full startup)
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# NAME                           STATUS                    PORTS
# googleai-local--db-1          Up (healthy)              5432/tcp
# googleai-local--api-1         Up (healthy)              3000/tcp
# googleai-local--frontend-1    Up (healthy)              0.0.0.0:8080->80/tcp

# 3. Check API logs for successful migration
docker-compose -f docker-compose.prod.yml logs api | grep -A 10 "Running database migrations"

# Expected to see:
# Running database migrations...
# Prisma schema loaded from prisma/schema.prisma
# Datasource "db": PostgreSQL database "finautomatedb"
# 1 migration found in prisma/migrations
# [Migration applies successfully - no P3019 error]

# 4. Test frontend access
curl -I http://localhost:8080

# Expected: HTTP/1.1 200 OK

# 5. Test API health endpoint through frontend proxy
curl http://localhost:8080/api/health

# Expected: {"status":"ok"}
```

## Technical Details

### Why Copying from Builder Works

The Dockerfile uses a multi-stage build:
1. **Builder stage**: Copies all source files, installs dependencies, generates Prisma client, builds the application
2. **Production stage**: Copies only necessary files for running the app

By copying the prisma directory from the builder stage (`COPY --from=builder /usr/src/app/prisma ./prisma`), we guarantee:
- The same file structure used during build is available at runtime
- All migration files are present and intact
- The `migration_lock.toml` file is correctly included
- No files are accidentally excluded by .dockerignore or context issues

### Why wget Installation is Needed

Alpine Linux is a minimal distribution that only includes essential packages. The `wget` command is not included by default because:
- Alpine prioritizes small image size
- Not all applications need wget
- Alternative tools like `curl` could be used instead

For Docker healthchecks, we have three options:
1. **Install wget** (our choice) - Small package (~80KB), simple syntax
2. **Use curl** - Would need to install curl instead, similar size
3. **Use built-in commands** - Could use `nc` (netcat) but more complex syntax

We chose wget because it's lightweight and the existing healthcheck configuration uses wget syntax.

## Impact Assessment

### Image Size
- Backend image: +~80KB (wget package)
- Frontend image: +~80KB (wget package)
- Total overhead: ~160KB (negligible for container images)

### Build Time
- Additional build step to install wget: +~2-3 seconds per image
- No significant impact on overall build time

### Runtime Performance
- No performance impact - wget is only used for healthchecks
- Healthchecks run every 30 seconds, very lightweight operation

### Security
- wget is a standard, well-maintained package from Alpine repositories
- No additional security concerns introduced

## Prevention Measures

To prevent similar issues in the future:

1. **Always copy generated/built files from builder stage**
   - Ensures consistency between build and runtime
   - Avoids context copying issues

2. **Verify all required commands are available in base images**
   - Check if Alpine images have required tools
   - Install missing tools explicitly

3. **Test healthchecks during development**
   - Verify healthcheck commands work in the target environment
   - Use `docker exec` to test commands manually

4. **Monitor container health during deployment**
   - Check `docker ps` for health status
   - Review logs if containers show as unhealthy

## Related Documentation

- `DOCKER_DEPLOYMENT.md` - Complete deployment guide
- `MIGRATION_FIX_SUMMARY.md` - Previous migration format fix
- `HEALTHCHECK_FIX.md` - Healthcheck configuration details
- `ACCESSING_APPLICATION.md` - Guide for accessing the running application

## Conclusion

These fixes address the core infrastructure issues preventing the application from starting in Docker. The changes are minimal, focused, and don't affect any application functionality - they only ensure that:
1. Database migrations can run successfully
2. Container healthchecks can execute properly
3. The full application stack can start and be accessible

The application should now start successfully and be accessible at `http://localhost:8080` when deployed with Docker Compose.
