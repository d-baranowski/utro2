# Utro API Testing with Newman

This directory contains Postman collections and Newman CLI scripts for automated API testing of the Utro application.

## Overview

The API tests are organized into separate collections for each service:

- **auth-api**: Authentication endpoints (login, token generation)
- **user-api**: User management endpoints (test users only, dev/test profiles)
- **organisation-api**: Organisation management with authentication
- **therapist-api**: Therapist and specialization endpoints
- **public-api**: Public endpoints that don't require authentication

## Prerequisites

Ensure you have the required tools installed via asdf:

```bash
# Install Newman plugin for asdf
asdf plugin add newman https://github.com/AimForNaN/asdf-newman.git

# Install all tools from .tool-versions
asdf install

# Verify Newman is available
newman --version
```

## Quick Start

### 1. Setup Test Environment

```bash
# Start the API server (choose one)
task api                    # Run locally
task docker-dev            # Run with Docker (infrastructure only)
task docker                 # Full stack with Docker
```

### 2. Run All API Tests

```bash
# Run all tests against local environment
task test:api-newman

# Or run against specific environments
task test:api-newman-local    # Local development
task test:api-newman-docker   # Docker environment
task test:api-newman-ci       # CI/CD environment
```

### 3. Run Individual Collections

```bash
# Run a specific collection against an environment
task test:api-newman-individual COLLECTION=auth-api ENV=local
task test:api-newman-individual COLLECTION=user-api ENV=docker
task test:api-newman-individual COLLECTION=organisation-api ENV=local
```

## Available Collections

### Authentication API (`auth-api.postman_collection.json`)

Tests login functionality across three endpoints:
- Form data login (`POST /login`)
- JSON login (`POST /login`)
- Connect RPC login (`POST /com.inspirationparticle.utro.gen.auth.v1.AuthService/Login`)

**Features:**
- Automatically creates test users before login attempts
- Tests both valid and invalid credentials
- JWT token validation and storage
- Cleanup of created test users

### User API (`user-api.postman_collection.json`)

Tests user management endpoints (dev/test profiles only):
- Create test user (`POST /api/test/users`)
- Check user existence (`GET /api/test/users/{username}/exists`)
- Delete test user (`DELETE /api/test/users/{username}`)

**Features:**
- Unique username generation with timestamps
- Validation of duplicate user creation
- Error handling for missing required fields
- Complete lifecycle testing (create → verify → delete)

### Organisation API (`organisation-api.postman_collection.json`)

Tests organisation management with authentication:
- Get user's organisations (`POST /com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/GetMyOrganisations`)
- Create organisation (`POST /com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/CreateOrganisation`)
- Search organisations (`POST /com.inspirationparticle.utro.gen.organisation.v1.OrganisationService/SearchOrganisations`)

**Features:**
- Automatic test user creation and authentication
- Bearer token authentication
- Tests for unauthorized access
- Organisation lifecycle testing
- Data validation and error scenarios

### Therapist API (`therapist-api.postman_collection.json`)

Tests therapist and specialization services:
- Get therapist by ID, slug, or user ID
- List and search therapists with filters
- Get therapist profile images
- List, search, and get specializations
- Get specialization categories

**Features:**
- Pagination testing
- Search functionality validation
- Filter parameter testing
- Response structure validation

### Public API (`public-api.postman_collection.json`)

Tests public endpoints:
- Public endpoint access
- Protected endpoint should deny access without authentication

## Environments

### Local Development (`local.postman_environment.json`)
- Base URL: `http://localhost:8080`
- For testing against locally running API server

### Docker Environment (`docker.postman_environment.json`)
- Base URL: `http://localhost:8080`
- For testing against Docker Compose setup

### CI Environment (`ci.postman_environment.json`)
- Base URL: `http://localhost:8080`
- Includes JUnit XML report generation for CI/CD integration

## Test Data Management

### Automated Test Data Setup

The collections include automatic test data creation:

1. **User Creation**: Tests automatically create unique test users using timestamps
2. **Authentication**: Login tests retrieve JWT tokens for authenticated requests  
3. **Organisation Creation**: Org tests create test organisations linked to test users
4. **Cleanup**: Tests clean up created data where possible

### Manual Test Data Script

For more complex test scenarios, use the test data setup script:

```bash
# Navigate to postman directory
cd postman

# Setup test data (with automatic cleanup on exit)
node setup-test-data.js setup --verbose

# Setup without cleanup (for manual control)
node setup-test-data.js setup --no-cleanup

# Manual cleanup
node setup-test-data.js cleanup

# Custom base URL
node setup-test-data.js setup --base-url=http://localhost:8081
```

The script creates:
- Multiple test users with authentication tokens
- Test organisations
- Environment file with all test data (`environments/test-data.json`)

## Reports and Results

### Newman Output

Newman generates detailed reports in the `results/` directory:

```bash
# Setup results directory
task test:api-newman-setup

# Run tests (generates JSON reports)
task test:api-newman-local

# Clean up results
task test:api-newman-clean
```

### Report Files

- **JSON Reports**: `results/{collection}-{environment}.json`
- **JUnit XML**: `results/{collection}-ci.xml` (CI environment only)
- **HTML Reports**: Generated with `task test:api-newman-report`

### CI/CD Integration

The CI environment generates JUnit XML reports suitable for CI/CD systems:

```bash
# Run with JUnit XML output
task test:api-newman-ci
```

## Test Features

### Isolation and Repeatability

- **Unique Data**: Tests use timestamps to create unique usernames and organisation names
- **Automatic Cleanup**: Most tests clean up their test data
- **Independent Execution**: Collections can be run independently or together
- **Environment Separation**: Different environments for local, Docker, and CI

### Security Testing

- **Authentication**: Tests validate JWT token generation and usage
- **Authorization**: Tests verify protected endpoints reject unauthorized requests
- **Input Validation**: Tests check for proper error handling with invalid inputs
- **Security Headers**: Tests ensure no internal error details are exposed

### Performance Monitoring

- **Response Time**: All tests include response time assertions (< 2-3 seconds)
- **Resource Usage**: Newman reports include timing and performance metrics

## Common Issues and Troubleshooting

### Newman Installation

If Newman is not available:

```bash
# Install Newman plugin for asdf
asdf plugin add newman https://github.com/AimForNaN/asdf-newman.git

# Install the version specified in .tool-versions
asdf install newman 6.1.3

# Set global version
asdf global newman 6.1.3
```

### API Server Not Running

Ensure the API server is running before tests:

```bash
# Check if server is responding
curl http://localhost:8080/public

# Start server if needed
task api                # Local
task docker-dev         # Docker
```

### Test Failures

Common test failure scenarios:

1. **Database Issues**: Ensure database is running and migrations are applied
2. **Port Conflicts**: Verify API server is running on expected port (8080)
3. **Authentication**: Check that test user creation endpoints are available
4. **Environment**: Verify correct environment file is being used

### Debugging Tests

Run Newman with verbose output:

```bash
newman run collections/auth-api.postman_collection.json \
  -e environments/local.postman_environment.json \
  --verbose \
  --insecure
```

## Task Commands Summary

```bash
# Main commands
task test:api-newman                    # Run all tests (local env)
task test:api-newman-local             # Local environment
task test:api-newman-docker            # Docker environment  
task test:api-newman-ci                # CI with JUnit XML

# Individual collection
task test:api-newman-individual COLLECTION=auth-api ENV=local

# Utility commands
task test:api-newman-setup             # Create results directory
task test:api-newman-clean             # Clean results
task test:api-newman-report            # Generate HTML reports
```

## Contributing

When adding new API endpoints:

1. Add requests to the appropriate collection
2. Include comprehensive test assertions
3. Add environment variables as needed
4. Update this README with new features
5. Test against all environments (local, docker, ci)

## Best Practices

- **Unique Test Data**: Always use timestamps or UUIDs for test data
- **Comprehensive Assertions**: Test response structure, status codes, and business logic
- **Error Scenarios**: Include tests for invalid inputs and edge cases
- **Performance**: Keep response time assertions reasonable (2-3 seconds)
- **Security**: Never expose sensitive data in test results
- **Isolation**: Ensure tests can run independently and repeatedly