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
```

### Individual Commands
```bash
# Backend (from /api/app)
mvn spring-boot:run      # Run development server
mvn clean package        # Build JAR

# Frontend (from /web)
pnpm dev                 # Development server
pnpm build              # Production build
pnpm start              # Production server
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

## Testing
Currently no test suites implemented. Spring Boot includes test starter dependencies. Frontend has no testing framework configured yet.