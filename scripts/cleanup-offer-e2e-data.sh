#!/bin/bash

# Cleanup script for offer E2E test data
# This script removes all offer test data to ensure clean test runs

set -e

# Database connection settings (can be overridden with environment variables)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-utro}"
DB_USER="${DB_USER:-utro}"
DB_PASSWORD="${DB_PASSWORD:-utro_password}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Cleaning up offer E2E test data...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Check if database is accessible
echo "Testing database connection..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database.${NC}"
    exit 1
fi

echo -e "${GREEN}Database connection successful!${NC}"

# Execute the cleanup SQL
echo "Cleaning up offer test data..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'

-- Clean up offer test data
DELETE FROM offer WHERE organisation_id IN (
    SELECT id FROM organisation WHERE name LIKE '%Offer Test%'
);
DELETE FROM organisation_member WHERE user_id IN (
    SELECT id FROM "user" WHERE username LIKE 'offer_%'
);
DELETE FROM "user" WHERE username LIKE 'offer_%';
DELETE FROM organisation WHERE name LIKE '%Offer Test%';

EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Offer E2E test data cleanup completed successfully!${NC}"
else
    echo -e "${RED}❌ Failed to cleanup offer E2E test data${NC}"
    exit 1
fi