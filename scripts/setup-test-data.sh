#!/bin/bash

# Test Data Setup Script for Cypress Tests
# This script populates the database with test users and organizations

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

echo -e "${YELLOW}Setting up test data for Cypress tests...${NC}"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Check if database is accessible
echo "Testing database connection..."
if ! PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}Error: Cannot connect to database. Please ensure:${NC}"
    echo "  - PostgreSQL is running"
    echo "  - Database '$DB_NAME' exists"
    echo "  - User '$DB_USER' has access"
    echo "  - Connection details are correct:"
    echo "    Host: $DB_HOST:$DB_PORT"
    echo "    Database: $DB_NAME"
    echo "    User: $DB_USER"
    exit 1
fi

echo -e "${GREEN}Database connection successful!${NC}"

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
SQL_FILE="$SCRIPT_DIR/setup-test-data.sql"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}Error: SQL file not found at $SQL_FILE${NC}"
    exit 1
fi

# First ensure the password column exists (in case migrations haven't run)
echo "Ensuring password column exists in user table..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "ALTER TABLE \"user\" ADD COLUMN IF NOT EXISTS password VARCHAR(255);" > /dev/null 2>&1

# Execute the SQL script
echo "Executing test data setup script..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"; then
    echo -e "${GREEN}✅ Test data setup completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Test Accounts Created:${NC}"
    echo "  Username: testuser    | Password: testpass  | Organizations: Test Organisation (admin), Second Test Org (member)"
    echo "  Username: testuser2   | Password: testpass2 | Organizations: Test Organisation (member)"  
    echo "  Username: admin       | Password: adminpass | Organizations: Admin Org (admin)"
    echo ""
    echo -e "${YELLOW}Note:${NC} These are test accounts for Cypress E2E tests. Passwords are"
    echo "properly hashed using BCrypt with 12 salt rounds for security."
    echo ""
    echo "You can now run Cypress tests with: ${GREEN}pnpm run cypress:open${NC}"
else
    echo -e "${RED}❌ Failed to setup test data${NC}"
    exit 1
fi