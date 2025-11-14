#!/bin/sh
set -e

echo "Starting FinAutomate Backend..."

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy || echo "Migration failed or no migrations to run"

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate || echo "Prisma generate failed"

# Start the application
echo "Starting application..."
exec npm run start:prod
