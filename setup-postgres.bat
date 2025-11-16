@echo off
REM PostgreSQL Database Setup Script for FinAutomate
REM This script helps create the database and user for FinAutomate application

echo ================================================
echo FinAutomate - PostgreSQL Database Setup
echo ================================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

REM Get database configuration from user
set /p DBUSER="Enter database username (default: user): " || set DBUSER=user
set /p DBPASS="Enter database password (default: password): " || set DBPASS=password
set /p DBNAME="Enter database name (default: finautomatedb): " || set DBNAME=finautomatedb

echo.
echo Creating database with the following configuration:
echo   Username: %DBUSER%
echo   Password: %DBPASS%
echo   Database: %DBNAME%
echo.
set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo Creating user and database...
echo.

REM Create SQL commands file
set SQLFILE=%TEMP%\finautomate_setup.sql
(
echo -- Create user if not exists
echo DO $$ 
echo BEGIN
echo   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '%DBUSER%'^) THEN
echo     CREATE USER %DBUSER% WITH PASSWORD '%DBPASS%';
echo   END IF;
echo END $$;
echo.
echo -- Create database if not exists
echo SELECT 'CREATE DATABASE %DBNAME%'
echo WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '%DBNAME%'^)\gexec
echo.
echo -- Grant privileges
echo GRANT ALL PRIVILEGES ON DATABASE %DBNAME% TO %DBUSER%;
) > "%SQLFILE%"

REM Execute SQL commands
psql -U postgres -f "%SQLFILE%"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to create database. Please check your PostgreSQL installation.
    echo Make sure the 'postgres' user has a password set.
    echo.
    del "%SQLFILE%"
    pause
    exit /b 1
)

REM Grant schema privileges
echo \c %DBNAME% > "%SQLFILE%"
echo GRANT ALL ON SCHEMA public TO %DBUSER%; >> "%SQLFILE%"
psql -U postgres -f "%SQLFILE%"

REM Clean up
del "%SQLFILE%"

echo.
echo ================================================
echo Database setup completed successfully!
echo ================================================
echo.
echo Next steps:
echo 1. Update your .env file with the following:
echo.
echo    POSTGRES_USER=%DBUSER%
echo    POSTGRES_PASSWORD=%DBPASS%
echo    POSTGRES_DB=%DBNAME%
echo    DATABASE_URL=postgresql://%DBUSER%:%DBPASS%@localhost:5432/%DBNAME%
echo.
echo 2. If using Docker, run:
echo    docker-compose -f docker-compose.prod.yml up --build -d
echo.
echo 3. If running locally, install dependencies and run migrations:
echo    cd backend
echo    npm install
echo    npx prisma migrate deploy
echo    npm run start:prod
echo.
pause
