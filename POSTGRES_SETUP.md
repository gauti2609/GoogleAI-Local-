# PostgreSQL Database Setup Guide

This document provides detailed steps for setting up and troubleshooting the PostgreSQL database for the FinAutomate application.

## Table of Contents
- [Overview](#overview)
- [Default Configuration](#default-configuration)
- [Quick Start with Docker](#quick-start-with-docker)
- [Manual PostgreSQL Setup](#manual-postgresql-setup)
- [Troubleshooting](#troubleshooting)
- [Database Migrations](#database-migrations)

## Overview

The FinAutomate application uses PostgreSQL 15 as its database. In production deployments, the database runs in a Docker container and is automatically configured through environment variables.

## Default Configuration

The application uses the following default database credentials (defined in `.env`):

```env
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=finautomatedb
```

**⚠️ IMPORTANT**: Change these credentials for production deployments!

## Quick Start with Docker

### Using Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gauti2609/GoogleAI-Local-.git
   cd GoogleAI-Local-
   ```

2. **Ensure `.env` file exists:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the following:
   - `POSTGRES_USER` - Database user
   - `POSTGRES_PASSWORD` - Database password
   - `POSTGRES_DB` - Database name (default: finautomatedb)
   - `JWT_SECRET` - A secure random string
   - `API_KEY` - Your Google Gemini API key

3. **Start the application (Production):**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

4. **Check the status:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

5. **View logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

### Using Docker Compose (Development)

For development with hot-reload:
```bash
docker-compose up --build -d
```

## Manual PostgreSQL Setup

If you prefer to run PostgreSQL outside of Docker:

### On Windows

1. **Download and Install PostgreSQL:**
   - Download from: https://www.postgresql.org/download/windows/
   - Run the installer and follow the setup wizard
   - Remember the password you set for the `postgres` user

2. **Create Database:**
   
   Open PowerShell and run:
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create user
   CREATE USER user WITH PASSWORD 'password';
   
   # Create database
   CREATE DATABASE finautomatedb;
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE finautomatedb TO user;
   
   # Connect to the database
   \c finautomatedb
   
   # Grant schema privileges
   GRANT ALL ON SCHEMA public TO user;
   
   # Exit
   \q
   ```

3. **Update DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/finautomatedb
   ```

### On Linux/macOS

1. **Install PostgreSQL:**
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```
   
   **macOS (using Homebrew):**
   ```bash
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create Database:**
   ```bash
   # Switch to postgres user
   sudo -u postgres psql
   
   # Create user
   CREATE USER user WITH PASSWORD 'password';
   
   # Create database
   CREATE DATABASE finautomatedb;
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE finautomatedb TO user;
   
   # Connect to the database
   \c finautomatedb
   
   # Grant schema privileges
   GRANT ALL ON SCHEMA public TO user;
   
   # Exit
   \q
   ```

3. **Update DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/finautomatedb
   ```

## Troubleshooting

### Issue 1: "exec ./docker-entrypoint.sh: no such file or directory"

**Cause:** This error occurs when the `docker-entrypoint.sh` file has Windows-style line endings (CRLF) instead of Unix-style (LF).

**Solution:**

1. **If building on Windows**, ensure Git is configured to checkout with LF line endings:
   ```bash
   git config --global core.autocrlf input
   ```

2. **Re-clone the repository:**
   ```bash
   git clone https://github.com/gauti2609/GoogleAI-Local-.git
   ```

3. **Or fix the existing file:**
   ```bash
   # On Linux/macOS
   sed -i 's/\r$//' backend/docker-entrypoint.sh
   
   # On Windows (using Git Bash)
   sed -i 's/\r$//' backend/docker-entrypoint.sh
   
   # On Windows (using PowerShell)
   (Get-Content backend\docker-entrypoint.sh -Raw) -replace "`r`n", "`n" | Set-Content backend\docker-entrypoint.sh -NoNewline
   ```

### Issue 2: "FATAL: database 'user' does not exist"

**Cause:** The healthcheck was trying to connect to a database named "user" instead of the actual database name.

**Solution:** This has been fixed in the latest version. The healthcheck now correctly specifies the database name:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-user} -d ${POSTGRES_DB:-finautomatedb}"]
```

### Issue 3: Container keeps restarting

**Check logs:**
```bash
docker-compose -f docker-compose.prod.yml logs api
docker-compose -f docker-compose.prod.yml logs db
```

**Common causes:**
1. Database connection issues - Verify `DATABASE_URL` in `.env`
2. Missing environment variables - Ensure `.env` file is present
3. Port conflicts - Check if ports 3000, 5432, or 8080 are already in use

### Issue 4: "Connection refused" when connecting to database

**Solution:**
1. Ensure PostgreSQL is running:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

2. Check database logs:
   ```bash
   docker-compose -f docker-compose.prod.yml logs db
   ```

3. Verify the database is accepting connections:
   ```bash
   docker-compose -f docker-compose.prod.yml exec db psql -U user -d finautomatedb -c "SELECT 1;"
   ```

## Database Migrations

The application uses Prisma for database migrations.

### Viewing Current Schema

```bash
# View the Prisma schema
cat backend/prisma/schema.prisma
```

### Running Migrations in Docker

Migrations are automatically run when the API container starts via the `docker-entrypoint.sh` script.

### Running Migrations Manually

If you need to run migrations manually:

1. **Access the API container:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec api sh
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Creating New Migrations (Development)

1. **Modify the schema:**
   Edit `backend/prisma/schema.prisma`

2. **Create migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name your_migration_name
   ```

## Database Backup and Restore

### Backup

```bash
# Backup database from Docker container
docker-compose -f docker-compose.prod.yml exec db pg_dump -U user finautomatedb > backup.sql
```

### Restore

```bash
# Restore database to Docker container
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U user -d finautomatedb
```

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | Database user | `user` | Yes |
| `POSTGRES_PASSWORD` | Database password | `password` | Yes |
| `POSTGRES_DB` | Database name | `finautomatedb` | Yes |
| `DATABASE_URL` | Full database connection URL | Auto-generated | Yes |
| `JWT_SECRET` | Secret for JWT tokens | - | Yes |
| `API_KEY` | Google Gemini API key | - | Yes |

## Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

If you encounter issues not covered in this guide, please:
1. Check the [GitHub Issues](https://github.com/gauti2609/GoogleAI-Local-/issues)
2. Review application logs: `docker-compose -f docker-compose.prod.yml logs`
3. Open a new issue with detailed error messages and logs
