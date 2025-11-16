# API Port Exposure Fix for Production Docker Compose

## Problem Statement

When deploying the application using `docker-compose.prod.yml`, the API endpoint was not accessible from the host machine. Commands like `curl http://localhost:3000/health` would fail with:

```
curl: (7) Failed to connect to localhost port 3000 after XXXX ms: Could not connect to server
```

This made it impossible to:
- Test API endpoints directly from the host machine
- Debug API issues
- Verify the API health status independently of the frontend

## Root Cause

In `docker-compose.prod.yml`, the `api` service configuration was missing the `ports` mapping that exposes the container's port 3000 to the host machine's port 3000.

### Before (Incorrect):
```yaml
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    # Missing ports configuration!
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://...
      NODE_ENV: production
    networks:
      - finautomate-network
```

The API was only accessible within the Docker network (e.g., from the frontend nginx container via `http://api:3000/`), but not from the host machine.

## Solution

Added the `ports` configuration to expose port 3000 on the host machine:

### After (Correct):
```yaml
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "3000:3000"  # ← Added this line
    env_file:
      - .env
    environment:
      DATABASE_URL: postgresql://...
      NODE_ENV: production
    networks:
      - finautomate-network
```

This change makes the production Docker Compose configuration consistent with the development version (`docker-compose.yml`), which already had this port mapping.

## How to Apply the Fix

1. **Pull the latest changes:**
   ```bash
   git pull origin main
   ```

2. **Stop existing containers:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

3. **Start with the updated configuration:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

   Note: Rebuild is not necessary since only the compose configuration changed, not the Docker images.

4. **Verify the fix works:**
   ```bash
   curl http://localhost:3000/health
   ```
   
   Expected output: `{"status":"ok"}`

## What This Fixes

✅ **Direct API access:** `curl http://localhost:3000/health` now works  
✅ **Alternative localhost:** `curl http://127.0.0.1:3000/health` now works  
✅ **API debugging:** You can now test API endpoints directly from your host machine  
✅ **Consistency:** Production config now matches development config behavior  
✅ **Troubleshooting:** Easier to diagnose API issues independently  

## What Still Works

The frontend access through nginx remains unchanged:
- ✅ `curl http://localhost:8080/api/health` continues to work
- ✅ Web browser access at `http://localhost:8080` continues to work
- ✅ Internal Docker network communication remains the same

## Security Considerations

### Is it safe to expose the API port in production?

**For local development/testing:** Yes, absolutely safe. The API is running on your local machine and is only accessible from your computer.

**For actual production deployments on a server:**
- If the server is behind a firewall and you trust users on your network, it's safe
- If the server is publicly accessible, consider:
  - Using a reverse proxy (nginx already handles this at port 8080)
  - Not exposing port 3000 externally via firewall rules
  - The application already has authentication (JWT) for protection

### Recommended Production Setup

For a production server exposed to the internet:

1. **Keep the port exposed** for local debugging and monitoring
2. **Configure firewall rules** to block external access to port 3000:
   ```bash
   # Example using ufw (Ubuntu)
   sudo ufw allow 8080/tcp   # Allow frontend
   sudo ufw deny 3000/tcp    # Block direct API access from external
   ```
3. **Use the nginx proxy** (port 8080) as the public entry point

This gives you the best of both worlds:
- Local debugging capability when SSH'd into the server
- Protected API that's only accessible through the reverse proxy

## Technical Details

### Why was this working before?

The frontend (nginx) could access the API because they're both in the same Docker network (`finautomate-network`). Docker's internal DNS resolves the service name `api` to the container's IP address within the network, allowing nginx to proxy requests to `http://api:3000/`.

However, the host machine is not part of this Docker network, so it couldn't reach the API without an explicit port mapping.

### Port Mapping Syntax

The syntax `"3000:3000"` means:
- **First 3000:** Port on the host machine
- **Second 3000:** Port inside the container
- **Format:** `"<host_port>:<container_port>"`

You could use different ports, e.g., `"3001:3000"` would expose the container's port 3000 on the host's port 3001.

## Verification Commands

After applying the fix, run these commands to verify everything works:

```bash
# 1. Check container status
docker-compose -f docker-compose.prod.yml ps

# 2. Test API health directly
curl http://localhost:3000/health

# 3. Test API through nginx
curl http://localhost:8080/api/health

# 4. Test a protected endpoint (should require authentication)
curl http://localhost:3000/entities
# Expected: 401 Unauthorized (because no auth token provided)

# 5. Check API logs
docker-compose -f docker-compose.prod.yml logs api
```

### Windows PowerShell Commands

If you're using Windows PowerShell, use `curl.exe` or `Invoke-WebRequest`:

```powershell
# Option 1: Using curl.exe
curl.exe http://localhost:3000/health

# Option 2: Using PowerShell cmdlet
Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -ExpandProperty Content
```

## Related Issues

This fix resolves the connectivity issues mentioned in:
- PR #10 - Loading data issue fix
- The original error: "Failed to connect to localhost port 3000"

## Files Changed

- `docker-compose.prod.yml` - Added `ports: - "3000:3000"` to the `api` service

## Status

**✅ RESOLVED** - The API is now accessible from the host machine at `localhost:3000` when using `docker-compose.prod.yml`.
