#!/bin/bash

# Docker Configuration Verification Script
# This script verifies that the Docker configuration fixes are working correctly

echo "=== Docker Configuration Verification ==="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Verify migration_lock.toml exists and has correct format
echo "Check 1: Verifying migration_lock.toml file..."
if [ -f "backend/prisma/migrations/migration_lock.toml" ]; then
    echo -e "${GREEN}✓${NC} migration_lock.toml exists"
    
    # Check if it contains 'provider = "postgresql"'
    if grep -q 'provider = "postgresql"' backend/prisma/migrations/migration_lock.toml; then
        echo -e "${GREEN}✓${NC} migration_lock.toml has correct TOML format with provider field"
    else
        echo -e "${RED}✗${NC} migration_lock.toml does not have correct provider field"
        exit 1
    fi
    
    # Check that it doesn't have JSON format
    if grep -q '"dialect"' backend/prisma/migrations/migration_lock.toml; then
        echo -e "${RED}✗${NC} migration_lock.toml still has JSON format (should be TOML)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} migration_lock.toml does not exist"
    exit 1
fi

echo ""

# Check 2: Verify backend Dockerfile has wget installation
echo "Check 2: Verifying backend Dockerfile has wget..."
if grep -q "apk add --no-cache wget" backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend Dockerfile installs wget for healthcheck"
else
    echo -e "${RED}✗${NC} Backend Dockerfile missing wget installation"
    exit 1
fi

# Check that prisma is copied from builder
if grep -q "COPY --from=builder /usr/src/app/prisma ./prisma" backend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Backend Dockerfile copies prisma from builder stage"
else
    echo -e "${RED}✗${NC} Backend Dockerfile not copying prisma from builder stage"
    exit 1
fi

echo ""

# Check 3: Verify frontend Dockerfile has wget installation
echo "Check 3: Verifying frontend Dockerfile has wget..."
if grep -q "apk add --no-cache wget" frontend.Dockerfile; then
    echo -e "${GREEN}✓${NC} Frontend Dockerfile installs wget for healthcheck"
else
    echo -e "${RED}✗${NC} Frontend Dockerfile missing wget installation"
    exit 1
fi

echo ""

# Check 4: Verify docker-compose.prod.yml healthcheck configuration
echo "Check 4: Verifying docker-compose healthcheck configuration..."
if grep -q "start_period:" docker-compose.prod.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.prod.yml has start_period configured"
else
    echo -e "${YELLOW}⚠${NC} docker-compose.prod.yml missing start_period (recommended but optional)"
fi

if grep -q "wget --no-verbose --tries=1 --spider" docker-compose.prod.yml; then
    echo -e "${GREEN}✓${NC} docker-compose.prod.yml uses wget for healthcheck"
else
    echo -e "${RED}✗${NC} docker-compose.prod.yml healthcheck not using wget"
    exit 1
fi

echo ""

# Check 5: Verify .env file exists
echo "Check 5: Verifying environment configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check for required variables
    if grep -q "JWT_SECRET=" .env && grep -q "API_KEY=" .env; then
        echo -e "${GREEN}✓${NC} .env has required variables (JWT_SECRET, API_KEY)"
    else
        echo -e "${YELLOW}⚠${NC} .env may be missing required variables"
    fi
else
    echo -e "${YELLOW}⚠${NC} .env file not found (copy from .env.example)"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo -e "${GREEN}✓ All critical checks passed!${NC}"
echo ""
echo "Next steps to deploy:"
echo "1. Ensure .env file is configured with your API_KEY and JWT_SECRET"
echo "2. Run: docker-compose -f docker-compose.prod.yml up --build -d"
echo "3. Wait ~2 minutes for containers to become healthy"
echo "4. Access the application at http://localhost:8080"
echo ""
echo "To monitor deployment:"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
