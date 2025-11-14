# Backend Dockerfile for NestJS API
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client (if schema exists)
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies and Prisma CLI
RUN npm ci --only=production && npm install -g prisma

# Copy built application from builder
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema and migrations from builder to ensure consistency
COPY --from=builder /usr/src/app/prisma ./prisma

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose the port
EXPOSE 3000

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
