# Offer E2E Tests - No Mocking Setup

This directory contains real end-to-end tests for the offer management functionality that connect to a live API and database without any mocking.

## Prerequisites

1. **Database Running**: PostgreSQL database must be running in Docker
2. **API Running**: Spring Boot API must be running on port 8080
3. **Frontend Running**: Next.js frontend must be running on port 3000

## Quick Start

### 1. Start the Infrastructure

```bash
# Start database in Docker
cd /home/runner/work/utro2/utro2
./scripts/start-db.sh

# Start the API (in another terminal)
cd api/app
mvn spring-boot:run

# Start the frontend (in another terminal) 
cd web
pnpm dev
```

### 2. Setup Test Data

```bash
# Setup offer-specific test data
cd web
pnpm run setup:offer-e2e
```

### 3. Run E2E Tests

```bash
# Run offer E2E tests in headless mode
pnpm run test:e2e:offer

# Or run with Cypress UI
pnpm run test:e2e:offer:open
```

### 4. Cleanup (Optional)

```bash
# Clean up test data after tests
pnpm run cleanup:offer-e2e
```

## Test Structure

The offer E2E test (`offer-management-e2e.cy.ts`) covers:

### Admin User Tests
- ✅ Display offer management interface
- ✅ Create new offers with multilingual content
- ✅ Edit existing offers
- ✅ Search and filter offers
- ✅ Delete offers with confirmation

### Public User Tests  
- ✅ Browse offers without authentication
- ✅ Search public offers
- ✅ Display multilingual content properly

### Access Control Tests
- ✅ Deny offer management access to non-admin users
- ✅ Allow public browsing without authentication

## Test Data

The setup script creates:
- **Admin User**: `offer_admin` / `offerpass123`
- **Regular User**: `offer_user` / `userpass123`
- **Organization**: "Offer Test Organization"
- **Sample Offers**: 2 pre-created offers for testing

## Database Integration

Unlike other Cypress tests that use mocking, these tests:

- Connect to real PostgreSQL database via `pg` library
- Use database tasks in `cypress.config.ts` for setup/teardown
- Execute real SQL operations for test data management
- Support repeatable test runs with automatic cleanup

## Configuration

Database connection settings (can be overridden with environment variables):

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=utro
DB_USER=utro
DB_PASSWORD=utro_password
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if database is running
docker ps | grep postgres

# Check if database is accessible
psql -h localhost -U utro -d utro -c "SELECT 1;"
```

### API Connection Issues
```bash
# Check if API is running
curl http://localhost:8080/actuator/health

# Check API logs for errors
cd api/app && mvn spring-boot:run
```

### Frontend Issues
```bash
# Check if frontend is running
curl http://localhost:3000

# Start frontend in development mode
cd web && pnpm dev
```

### Test Failures
1. Ensure all prerequisites are running
2. Run setup script again: `pnpm run setup:offer-e2e`
3. Check browser console for JavaScript errors
4. Review Cypress screenshots in `cypress/screenshots/`

## Key Features

- **No Mocking**: Tests real API endpoints and database
- **Repeatable**: Database setup/cleanup ensures consistent test runs
- **Multilingual**: Tests both English and Polish content
- **Real Authentication**: Uses actual login flow
- **Complete CRUD**: Tests create, read, update, delete operations
- **Access Control**: Verifies role-based permissions
- **UI Interaction**: Tests actual Material UI components