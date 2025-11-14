# Container Naming Conflict Fix

## Problem
Previously, both `docker-compose.yml` and `docker-compose.prod.yml` used hardcoded container names:
- `finautomate_db`
- `finautomate_api`
- `finautomate_frontend`

This caused conflicts when trying to switch between development and production environments, resulting in errors like:
```
Error response from daemon: Conflict. The container name "/finautomate_db" is already in use by container "d18ff4b7626d...". You have to remove (or rename) that container to be able to reuse that name.
```

## Solution
Removed all `container_name` directives from both compose files. Docker Compose now automatically generates container names based on the project directory name.

### Container Naming Convention
With a project directory named `GoogleAI-Local--main`, containers are automatically named:
- `googleai-local--main-db-1`
- `googleai-local--main-api-1`
- `googleai-local--main-frontend-1`

### Benefits
1. **No Conflicts**: Development and production environments can coexist without naming conflicts
2. **Easy Switching**: Switch between environments without manual cleanup:
   ```bash
   docker-compose down
   docker-compose -f docker-compose.prod.yml up --build -d
   ```
3. **Simultaneous Environments**: Run both at the same time using different project names:
   ```bash
   docker-compose -p myapp-dev up -d
   docker-compose -p myapp-prod -f docker-compose.prod.yml up -d
   ```

## Testing
To verify the fix works:

1. **View configuration without starting containers:**
   ```bash
   docker compose config
   docker compose -f docker-compose.prod.yml config
   ```

2. **Check container names after starting:**
   ```bash
   docker-compose up -d
   docker-compose ps
   ```

3. **Switch to production without conflicts:**
   ```bash
   docker-compose down
   docker-compose -f docker-compose.prod.yml up -d
   docker-compose -f docker-compose.prod.yml ps
   ```

## Migration for Existing Users
If you have existing containers with the old hardcoded names, follow these steps:

1. **Stop and remove old containers:**
   ```bash
   docker stop finautomate_db finautomate_api finautomate_frontend 2>/dev/null || true
   docker rm finautomate_db finautomate_api finautomate_frontend 2>/dev/null || true
   ```

2. **Start with new naming:**
   ```bash
   docker-compose up -d
   ```

Note: The database volume (`postgres_data`) is preserved, so no data will be lost.
