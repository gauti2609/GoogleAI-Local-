# OpenSSL Dependency Fix for Prisma on Alpine Linux

## Problem Statement

The application was failing to start with Prisma-related errors:

```
prisma:warn Prisma failed to detect the libssl/openssl version to use, and may not work as expected. Defaulting to "openssl-1.1.x".
Please manually install OpenSSL and try installing Prisma again.

Error: Could not parse schema engine response: SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON

✘ Container googleai-local--api-1       Error
dependency failed to start: container googleai-local--api-1 is unhealthy
```

## Root Cause

The issue was caused by using the `node:20-alpine` base image, which:

1. **Lacks OpenSSL libraries**: Alpine Linux uses musl libc and doesn't include OpenSSL by default
2. **Prisma binary requirements**: Prisma's native query engine binaries require OpenSSL/libssl to function
3. **Binary incompatibility**: When OpenSSL is missing or has version mismatches, Prisma's query engine fails to load, resulting in unparseable error responses

### Why This Manifests as a JSON Parse Error

When Prisma's query engine binary fails to load due to missing OpenSSL:
- The binary crashes or returns an error message starting with "Error load..."
- Prisma expects JSON responses from the query engine
- Instead, it receives a plain text error message
- This results in: `SyntaxError: Unexpected token 'E', "Error load"... is not valid JSON`

## Solution Implemented

### Changed Base Image from Alpine to Debian Slim

**Before:**
```dockerfile
FROM node:20-alpine AS builder
...
FROM node:20-alpine
RUN apk add --no-cache wget
```

**After:**
```dockerfile
FROM node:20-slim AS builder
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
...
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl wget && rm -rf /var/lib/apt/lists/*
```

### Why This Works

1. **Debian-based images**: The `node:20-slim` image is based on Debian Bookworm, which includes:
   - OpenSSL 3.0.17 (compatible with Prisma)
   - Standard glibc (not musl)
   - Better binary compatibility for native Node.js modules

2. **OpenSSL availability**: Installing the `openssl` package ensures:
   - libssl3 libraries are present
   - Prisma's query engine can properly link and load
   - No version detection warnings

3. **Image size trade-off**: While Debian slim is larger than Alpine (~80MB vs ~50MB base), it provides:
   - Better compatibility with native binaries
   - Fewer runtime issues
   - Standard package management with apt

## Technical Details

### Prisma Requirements

Prisma's query engine is a native binary that requires:
- OpenSSL/libssl (version 1.1.x or 3.x)
- Compatible C standard library (glibc preferred)
- Proper dynamic linking support

### Alpine Linux Limitations

Alpine's musl libc can cause issues with:
- Pre-compiled native binaries (like Prisma's query engine)
- OpenSSL dynamic linking
- Version detection mechanisms

### Debian Slim Benefits

The Debian slim image provides:
- ✅ OpenSSL 3.0.x out of the box
- ✅ Standard glibc for better compatibility
- ✅ Full apt package manager
- ✅ Smaller than full Debian (still production-suitable)
- ✅ Recommended by Prisma documentation

## Files Changed

1. **backend/Dockerfile**
   - Changed base images from `node:20-alpine` to `node:20-slim`
   - Added OpenSSL installation in builder stage
   - Added OpenSSL + wget installation in production stage
   - Cleaned up apt cache to minimize image size

## Deployment Instructions

### Clean Rebuild Required

```bash
# Stop and remove existing containers and volumes
docker-compose down -v

# Rebuild with no cache to ensure changes are applied
docker-compose up --build -d

# Wait for containers to become healthy (approximately 2 minutes)
docker-compose ps

# Check API logs for successful startup
docker-compose logs api
```

### Expected Successful Output

```
api-1  | Starting FinAutomate Backend...
api-1  | Running database migrations...
api-1  | Prisma schema loaded from prisma/schema.prisma
api-1  | Datasource "db": PostgreSQL database "finautomatedb", schema "public" at "db:5432"
api-1  | 
api-1  | [Migration output - no OpenSSL warnings]
api-1  | 
api-1  | Generating Prisma Client...
api-1  | ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 100ms
api-1  | 
api-1  | Starting application...
api-1  | [Nest] XXX  - MM/DD/YYYY, HH:MM:SS AM     LOG [NestFactory] Starting Nest application...
api-1  | [Nest] XXX  - MM/DD/YYYY, HH:MM:SS AM     LOG [NestApplication] Nest application successfully started +XXXms
```

### Verification Steps

1. **Check container health:**
   ```bash
   docker-compose ps
   ```
   Expected: All containers show "Up" and "healthy" status

2. **Verify no OpenSSL warnings:**
   ```bash
   docker-compose logs api | grep -i "openssl\|libssl"
   ```
   Expected: No output (no warnings)

3. **Test API health endpoint:**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected: `{"status":"ok"}`

4. **Test through frontend:**
   ```bash
   curl http://localhost:8080/api/health
   ```
   Expected: `{"status":"ok"}`

## Image Size Comparison

| Base Image | Compressed Size | Uncompressed Size |
|------------|----------------|-------------------|
| node:20-alpine | ~50MB | ~120MB |
| node:20-slim | ~80MB | ~190MB |

**Trade-off**: ~30MB increase in base image size for significantly better compatibility and fewer runtime issues.

## Prevention

To avoid similar issues in the future:

1. **Use Debian-based images for Prisma projects** (slim variant for production)
2. **Always install OpenSSL explicitly** when using slim images
3. **Test Prisma migrations in the Docker environment** before deployment
4. **Check Prisma documentation** for recommended base images

## References

- [Prisma Docker Best Practices](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel#using-docker)
- [Prisma Native Binaries](https://www.prisma.io/docs/concepts/components/prisma-engines)
- [Node.js Docker Images](https://hub.docker.com/_/node)
- [Alpine vs Debian for Node.js](https://github.com/nodejs/docker-node/blob/main/README.md#image-variants)

## Related Issues

This fix resolves:
- ✅ OpenSSL version detection warnings
- ✅ Prisma query engine load failures
- ✅ JSON parse errors during migration
- ✅ API container health check failures
- ✅ Frontend dependency startup issues

## Status

**✅ RESOLVED** - The API container now starts successfully with Prisma running without errors.
