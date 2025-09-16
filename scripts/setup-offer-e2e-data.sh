#!/bin/bash

# Offer E2E Test Data Setup Script
# This script sets up specific test data for offer E2E tests that can be run repeatedly

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

echo -e "${YELLOW}Setting up offer E2E test data...${NC}"

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

# Execute the setup SQL
echo "Setting up offer test data..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'

-- Clean up existing offer test data (repeatable setup)
DELETE FROM offer WHERE organisation_id IN (
    SELECT id FROM organisation WHERE name LIKE '%Offer Test%'
);
DELETE FROM organisation_member WHERE user_id IN (
    SELECT id FROM "user" WHERE username LIKE 'offer_%'
);
DELETE FROM "user" WHERE username LIKE 'offer_%';
DELETE FROM organisation WHERE name LIKE '%Offer Test%';

-- Create test organization
INSERT INTO organisation (id, name, description, created_at, updated_at) VALUES
('offer-test-org-id'::uuid, 'Offer Test Organization', 'Organization for offer E2E testing', NOW(), NOW());

-- Create test users with BCrypt hashed passwords
-- offerpass123 -> $2b$12$rQHrxLqJOe8kFJ6yhZWKJe5vGQqQK5QEcFQSWPvZVY8KQx9Ej1J4G
-- userpass123 -> $2b$12$HGHzUMQeXLU2GvCvSR2iHOXzBkJqHD2k5VZF8TH3LWqKlDGj5KLcS
INSERT INTO "user" (id, username, email, full_name, provider, password, created_at, updated_at) VALUES
('offer-admin-user-id'::uuid, 'offer_admin', 'offer_admin@test.com', 'Offer Admin User', 'local', '$2b$12$rQHrxLqJOe8kFJ6yhZWKJe5vGQqQK5QEcFQSWPvZVY8KQx9Ej1J4G', NOW(), NOW()),
('offer-regular-user-id'::uuid, 'offer_user', 'offer_user@test.com', 'Regular Offer User', 'local', '$2b$12$HGHzUMQeXLU2GvCvSR2iHOXzBkJqHD2k5VZF8TH3LWqKlDGj5KLcS', NOW(), NOW());

-- Create organisation memberships
INSERT INTO organisation_member (user_id, organisation_id, member_type, joined_at) VALUES
('offer-admin-user-id'::uuid, 'offer-test-org-id'::uuid, 'ADMINISTRATOR', NOW()),
('offer-regular-user-id'::uuid, 'offer-test-org-id'::uuid, 'MEMBER', NOW());

-- Create some sample offers for testing
INSERT INTO offer (id, name_eng, name_pl, description_eng, description_pl, organisation_id, created_at, updated_at) VALUES
('sample-offer-1'::uuid, 'Sample Individual Therapy', 'Przykładowa Terapia Indywidualna', 'Professional individual therapy for personal growth', 'Profesjonalna terapia indywidualna dla rozwoju osobistego', 'offer-test-org-id'::uuid, NOW(), NOW()),
('sample-offer-2'::uuid, 'Sample Group Sessions', 'Przykładowe Sesje Grupowe', 'Group therapy sessions for social skills', 'Sesje terapii grupowej dla umiejętności społecznych', 'offer-test-org-id'::uuid, NOW(), NOW());

EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Offer E2E test data setup completed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Test Accounts Created:${NC}"
    echo "  Username: offer_admin  | Password: offerpass123 | Role: Administrator"
    echo "  Username: offer_user   | Password: userpass123  | Role: Member"
    echo ""
    echo -e "${YELLOW}Organization:${NC} Offer Test Organization"
    echo -e "${YELLOW}Sample Offers:${NC} 2 offers created for testing"
    echo ""
    echo "You can now run offer E2E tests with: ${GREEN}pnpm cypress:run --spec='cypress/e2e/offer-management-e2e.cy.ts'${NC}"
else
    echo -e "${RED}❌ Failed to setup offer E2E test data${NC}"
    exit 1
fi