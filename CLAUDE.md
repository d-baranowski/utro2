# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Utro is a full-stack monorepo application featuring:
- Spring Boot backend with JWT/OAuth authentication
- Next.js frontend with Material UI
- Protocol Buffers for type-safe API communication via Connect RPC
- Complete Docker/Kubernetes deployment setup

## Common Development Commands

### Build and Run
```bash
task proto   # Generate protobuf code (run after modifying .proto files)
task api     # Run Spring Boot backend on port 8080
task web     # Run Next.js frontend on port 3000
task docker  # Build and run full stack with Docker Compose
task k8s     # Deploy to Kubernetes
task lint    # Run linting for both backend and frontend
task format  # Auto-fix frontend formatting
task test    # Run tests for both backend and frontend
```

### Individual Commands
```bash
# Backend (from /api/app) - Requires Maven installation
mvn spring-boot:run      # Run development server
mvn clean package        # Build JAR
mvn test                 # Run unit tests
mvn checkstyle:check     # Run Java code style checking
mvn spotbugs:check       # Run security and bug analysis

# Frontend (from /web)
pnpm dev                 # Development server
pnpm build              # Production build
pnpm start              # Production server
pnpm run lint            # Run ESLint
pnpm run format          # Run Prettier formatting
pnpm run typecheck       # Run TypeScript checking
pnpm test                # Run Jest tests
pnpm run test:watch      # Run tests in watch mode
pnpm run test:coverage   # Run tests with coverage report
```

## Architecture

### Directory Structure
- `/api/` - Spring Boot backend (Java 17, Maven)
- `/proto/` - Protocol Buffer definitions (shared API contracts)
- `/web/` - Next.js frontend (TypeScript, React, Material UI)
- `/k8s/` - Kubernetes deployment manifests

### Key Technologies
- **Backend**: Spring Boot 3.2.0, Spring Security, JWT (jjwt), Google OAuth2
- **Frontend**: Next.js 14.1.0, React 18, Material UI 5.15, Connect RPC, Zod
- **API Layer**: Protocol Buffers with Connect RPC framework
- **Infrastructure**: Docker multi-stage builds, Kubernetes deployments

### Code Generation Flow
1. Proto definitions in `/proto/*.proto`
2. `task proto` generates:
   - Java classes to `/api/app/src/main/java/`
   - TypeScript to `/web/generated/`
3. Both frontend and backend use generated types

### Authentication Architecture
- Login endpoint: POST `/login` with username/password
- Returns JWT token (HMAC SHA256 signed)
- Frontend includes token in Authorization header
- Protected endpoints check JWT validity
- 
- Google OAuth2 integration available

### Development Workflow
1. Modify `.proto` files for API changes
2. Run `task proto` to regenerate code
3. Implement backend changes in Spring controllers
4. Update frontend in Next.js pages/components
5. Test with `task docker` for full integration

## Important Configuration Files
- `/api/app/src/main/resources/application.yml` - Spring Boot config, JWT secrets
- `/proto/buf.gen.yaml` - Protocol buffer code generation config
- `/web/next.config.js` - Next.js config with API URL env variables
- `/Taskfile.yml` - Task automation definitions

## Testing and Code Quality

### Testing Framework
- **Backend**: JUnit 5 with Spring Boot Test for unit and integration tests
- **Frontend**: Jest with React Testing Library for component and unit tests

### Code Quality Tools
- **Backend**: Checkstyle for code style, SpotBugs for security analysis
- **Frontend**: ESLint for linting, Prettier for formatting, TypeScript for type checking

### Test Commands
```bash
# Run all tests
task test

# Backend tests only
mvn test                 # Run all backend tests
mvn test -Dtest=AuthControllerTest  # Run specific test class

# Frontend tests only  
pnpm test                # Run all frontend tests
pnpm run test:watch      # Run tests in watch mode
pnpm run test:coverage   # Generate coverage report
```

### Quality Check Commands
```bash
# Run all quality checks
task lint

# Backend quality checks
mvn checkstyle:check     # Code style validation
mvn spotbugs:check       # Security and bug analysis

# Frontend quality checks
pnpm run lint            # ESLint validation
pnpm run format          # Auto-fix formatting
pnpm run typecheck       # TypeScript validation
```

### Important Notes
- Always run tests before commits: `task test && task lint`
- Fix any linting or formatting issues before code reviews
- Maintain test coverage for new features and bug fixes

## Code Style 
1. Always use singular instead of plural when naming database tables. For example, use `user` instead of `users`.
2. Make use of typescript and avoid using `any` types.
3. Avoid using non-exact version numbers in dependencies in `package.json` files. For example, use `3.2.0` instead of `^3.2.0` I want to see the actual version number not approximations.