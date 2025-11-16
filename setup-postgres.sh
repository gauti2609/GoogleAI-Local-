#!/bin/bash
# PostgreSQL Database Setup Script for FinAutomate
# This script helps create the database and user for FinAutomate application

set -e

echo "================================================"
echo "FinAutomate - PostgreSQL Database Setup"
echo "================================================"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed or not in PATH"
    echo "Please install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql@15"
    echo ""
    exit 1
fi

echo "PostgreSQL found!"
echo ""

# Get database configuration from user
read -p "Enter database username (default: user): " DBUSER
DBUSER=${DBUSER:-user}

read -sp "Enter database password (default: password): " DBPASS
echo ""
DBPASS=${DBPASS:-password}

read -p "Enter database name (default: finautomatedb): " DBNAME
DBNAME=${DBNAME:-finautomatedb}

echo ""
echo "Creating database with the following configuration:"
echo "  Username: $DBUSER"
echo "  Password: ********"
echo "  Database: $DBNAME"
echo ""
read -p "Continue? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo "Creating user and database..."
echo ""

# Check if running as postgres user
if [ "$EUID" -eq 0 ] || [ "$(whoami)" == "postgres" ]; then
    PSQL_CMD="psql"
else
    # Try to use sudo for postgres user
    if command -v sudo &> /dev/null; then
        PSQL_CMD="sudo -u postgres psql"
    else
        echo "WARNING: Not running as postgres user. Trying to connect directly..."
        PSQL_CMD="psql -U postgres"
    fi
fi

# Create SQL commands
SQL_COMMANDS=$(cat <<EOF
-- Create user if not exists
DO \$\$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = '$DBUSER') THEN
    CREATE USER $DBUSER WITH PASSWORD '$DBPASS';
  END IF;
END \$\$;

-- Create database if not exists
SELECT 'CREATE DATABASE $DBNAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DBNAME')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DBNAME TO $DBUSER;

-- Connect to the database and grant schema privileges
\c $DBNAME
GRANT ALL ON SCHEMA public TO $DBUSER;
EOF
)

# Execute SQL commands
echo "$SQL_COMMANDS" | $PSQL_CMD

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to create database. Please check your PostgreSQL installation."
    echo "You may need to run this script with sudo or as the postgres user."
    echo ""
    exit 1
fi

echo ""
echo "================================================"
echo "Database setup completed successfully!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the following:"
echo ""
echo "   POSTGRES_USER=$DBUSER"
echo "   POSTGRES_PASSWORD=$DBPASS"
echo "   POSTGRES_DB=$DBNAME"
echo "   DATABASE_URL=postgresql://$DBUSER:$DBPASS@localhost:5432/$DBNAME"
echo ""
echo "2. If using Docker, run:"
echo "   docker-compose -f docker-compose.prod.yml up --build -d"
echo ""
echo "3. If running locally, install dependencies and run migrations:"
echo "   cd backend"
echo "   npm install"
echo "   npx prisma migrate deploy"
echo "   npm run start:prod"
echo ""
