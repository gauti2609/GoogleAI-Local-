# Docker Deployment Guide

This guide explains how to deploy the FinAutomate application using Docker and Docker Compose.

## Prerequisites

1. **Docker and Docker Compose installed:**
   - **On Asustor NAS:** Install "Docker Engine" and "Portainer" from App Central
   - **On Windows/Mac:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - **On Linux:** Install Docker Engine and Docker Compose

2. **System Requirements:**
   - At least 2GB RAM available
   - 5GB free disk space
   - Internet connection for initial setup

## Initial Setup

### 1. Configure Environment Variables

The `.env` file contains your configuration. Make sure to review and update these values:

```bash
# Database Configuration (can leave as default for Docker)
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=finautomatedb

# Security - IMPORTANT: Change this to a secure random string
JWT_SECRET=your-long-random-secret-string-here

# Google Gemini API Key - REQUIRED
API_KEY=your-gemini-api-key-here
```

**Important:** 
- Generate a secure `JWT_SECRET` (use a random string generator)
- Get your `API_KEY` from [Google AI Studio](https://ai.google.dev/aistudio)

### 2. Build and Start the Application

Navigate to the project directory and run:

```bash
# For production deployment (recommended)
docker-compose -f docker-compose.prod.yml up --build -d

# OR for development (with hot-reload capabilities)
docker-compose up --build -d
```

**Difference:**
- `docker-compose.prod.yml` - Optimized for production with health checks and no volume mounts
- `docker-compose.yml` - Development mode with volume mounts for live code editing

This command will:
- Build the frontend (React/Vite application)
- Build the backend (NestJS API)
- Start PostgreSQL database
- Run database migrations
- Start all services in the background

**First-time setup may take 5-10 minutes depending on your internet speed.**

### 3. Access the Application

Once the containers are running, open your web browser and navigate to:

- **Local machine:** `http://localhost:8080`
- **NAS or remote server:** `http://<server-ip>:8080` (e.g., `http://192.168.1.50:8080`)

## Docker Commands

### View Running Containers
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f api
docker-compose logs -f db
```

### Stop the Application
```bash
# If using production config
docker-compose -f docker-compose.prod.yml down

# If using development config
docker-compose down
```

### Stop and Remove All Data (including database)
```bash
docker-compose down -v
```

### Restart Services
```bash
docker-compose restart
```

### Update Application (after code changes)
```bash
docker-compose down
docker-compose up --build -d
```

## Architecture

The application consists of three Docker containers:

1. **frontend** (Port 8080)
   - React application built with Vite
   - Served by Nginx
   - Proxies API requests to backend

2. **api** (Port 3000)
   - NestJS backend API
   - Handles authentication, data storage, and AI suggestions
   - Connected to PostgreSQL database

3. **db** (Port 5432)
   - PostgreSQL 15 database
   - Persistent data storage using Docker volumes

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker-compose logs api
docker-compose logs frontend

# Verify environment variables are set
cat .env
```

### Database connection issues
```bash
# Restart database container
docker-compose restart db

# Check database logs
docker-compose logs db

# Verify database is running
docker-compose ps db
```

### API container becomes unhealthy
If the API container shows as "unhealthy" or exits during startup:
```bash
# Check the API logs for errors
docker-compose -f docker-compose.prod.yml logs api

# Common causes:
# 1. Database migrations taking too long
# 2. Missing or invalid environment variables
# 3. Database connection failures

# The API has a 90-second startup grace period before health checks count
# This allows time for migrations and application initialization
```

### Frontend can't connect to API
- Ensure all containers are running: `docker-compose ps`
- Check API logs: `docker-compose logs api`
- Verify nginx configuration is correct
- Try accessing API directly at `http://localhost:3000/health`

### Build failures
```bash
# Clean up and rebuild
docker-compose down
docker system prune -f
docker-compose up --build
```

### Port conflicts
If ports 8080, 3000, or 5432 are already in use, edit `docker-compose.yml` and change the port mappings:

```yaml
ports:
  - "NEW_PORT:80"  # For frontend (change 8080)
  - "NEW_PORT:3000"  # For api (change 3000)
  - "NEW_PORT:5432"  # For db (change 5432)
```

### Switching between Development and Production

Both `docker-compose.yml` (development) and `docker-compose.prod.yml` (production) can coexist without naming conflicts. The containers are automatically named based on your project directory name.

To switch from development to production:
```bash
# Stop development environment
docker-compose down

# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d
```

To run both environments simultaneously, you can use different project names:
```bash
# Development with custom project name
docker-compose -p myapp-dev up -d

# Production with custom project name
docker-compose -p myapp-prod -f docker-compose.prod.yml up -d
```

## Data Persistence

Application data is stored in a Docker volume named `postgres_data`. This ensures your data persists even if containers are stopped or removed.

### Container Names

Docker Compose automatically generates container names based on the project directory name. For example, if your project directory is `GoogleAI-Local--main`, containers will be named:
- `googleai-local--main-db-1`
- `googleai-local--main-api-1`
- `googleai-local--main-frontend-1`

You can find the exact container names by running:
```bash
docker-compose ps
```

### Database Backup and Restore

To backup your data (replace `<db_container_name>` with the actual container name from `docker-compose ps`):
```bash
docker exec <db_container_name> pg_dump -U user finautomatedb > backup.sql

# Example:
# docker exec googleai-local--main-db-1 pg_dump -U user finautomatedb > backup.sql
```

To restore from backup:
```bash
docker exec -i <db_container_name> psql -U user finautomatedb < backup.sql

# Example:
# docker exec -i googleai-local--main-db-1 psql -U user finautomatedb < backup.sql
```

## Production Recommendations

1. **Use strong passwords:** Change the default database password
2. **Secure JWT_SECRET:** Use a long, random string
3. **Enable HTTPS:** Set up a reverse proxy (like Nginx or Traefik) with SSL certificates
4. **Firewall rules:** Only expose necessary ports
5. **Regular backups:** Set up automated database backups
6. **Monitor logs:** Regularly check application logs for errors
7. **Keep updated:** Regularly pull updates and rebuild containers

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review this documentation
3. Check the GitHub repository for updates
4. Refer to the Conversation.md and PROGRESS.md files for development history
