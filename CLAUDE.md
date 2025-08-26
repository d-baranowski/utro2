# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prerequisites and Development Setup

### Required: asdf for Dependency Management

This project **requires** [asdf](https://asdf-vm.com/) to manage development dependencies and ensure consistent tooling across all environments. All required tools and their exact versions are specified in the `.tool-versions` file and must be installed via asdf.

#### Installing asdf

**macOS (using Homebrew):**
```bash
brew install asdf
echo -e "\n. $(brew --prefix asdf)/libexec/asdf.sh" >> ${ZDOTDIR:-~}/.zshrc
echo -e "\n. $(brew --prefix asdf)/etc/bash_completion.d/asdf.bash" >> ${ZDOTDIR:-~}/.zshrc
source ~/.zshrc
```

**Linux (using Git):**
```bash
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.0
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.bashrc
echo '. "$HOME/.asdf/completions/asdf.bash"' >> ~/.bashrc
source ~/.bashrc
```

**Other Dependencies**
```bash
brew install libpq
echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc

```

#### Setting Up Project Dependencies

1. **Install required asdf plugins:**
```bash
# Add plugins for all tools
asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
asdf plugin add java https://github.com/halcyon/asdf-java.git
asdf plugin add maven https://github.com/halcyon/asdf-maven.git
asdf plugin add pnpm https://github.com/jonathanmorley/asdf-pnpm.git
asdf plugin add buf https://github.com/truepay/asdf-buf.git
asdf plugin add task https://github.com/particledecay/asdf-task.git
```

2. **Install all tools specified in .tool-versions:**
```bash
# Navigate to project root
cd /path/to/utro2

# Install all dependencies
asdf install
```

3. **Verify installation:**
```bash
# Check asdf status for all tools
asdf current

# Test each tool individually
node --version        # Should show v24.1.0
pnpm --version         # Should show 10.14.0
buf --version          # Should show 1.28.1
task --version         # Should show v3.34.1

# Java and Maven might need extra setup (see troubleshooting section)
java --version         # Should show openjdk 17.0.2
mvn --version          # Should show Apache Maven 3.9.9

# Verify all commands are in PATH
which node pnpm buf task
# Note: java and mvn might need additional PATH/JAVA_HOME setup
```

**Expected output verification:**
- `asdf current` should show all tools as "true" for Installed
- All version commands should return the exact versions from `.tool-versions`
- `which` commands should point to asdf shim or install directories

#### Tool Versions Configuration

The `.tool-versions` file specifies:
```
nodejs 24.1.0          # JavaScript runtime for Next.js frontend
java openjdk-17.0.2    # Java 17 for Spring Boot backend
maven 3.9.9            # Maven for Java dependency management and builds
pnpm 10.14.0           # Fast, disk space efficient package manager
buf 1.28.1             # Protocol Buffer compiler and toolkit
task 3.34.1            # Task runner for automation scripts
```

#### Troubleshooting asdf Setup

**If commands are not found after installation:**
```bash
# Reload shell configuration
source ~/.zshrc  # or source ~/.bashrc

# Check asdf is properly loaded
asdf --version

# List installed tools
asdf list

# Check current tool versions
asdf current
```

**If a specific tool fails to install:**
```bash
# Update plugin
asdf plugin update <plugin-name>

# Try installing specific version
asdf install <plugin-name> <version>

# Set global fallback if needed
asdf global <plugin-name> <version>
```

**Java-specific setup (requires additional steps):**
```bash
# Java installation may require sudo permissions on macOS
# If installation fails, try:
asdf install java openjdk-17.0.2

# After successful installation, set JAVA_HOME
echo 'export JAVA_HOME=$(asdf where java)' >> ~/.zshrc
source ~/.zshrc

# Verify Java is working
java --version
```

**Maven-specific setup:**
```bash
# Maven plugin sometimes has issues with certain versions
# If Maven 3.9.9 fails to install, try:
asdf plugin update maven
asdf install maven 3.9.9

# If still failing, manually verify available versions:
asdf list all maven | grep 3.9
```

#### Important Note

**asdf is required for this project.** All developers must use asdf to ensure consistent tool versions across different environments. This prevents "works on my machine" issues and ensures reproducible builds.

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

## Bundle Size Management

### Overview
The project includes comprehensive bundle size monitoring to prevent performance degradation and track size changes over time.

### Bundle Analysis Tools

#### 1. Next.js Bundle Analyzer
Visual analysis of webpack bundles with interactive treemap visualization.

```bash
# Analyze all bundles with visual output
pnpm analyze

# Analyze server bundles only
pnpm analyze:server

# Analyze client bundles only
pnpm analyze:browser
```

#### 2. Custom Bundle Analysis Script
Detailed size tracking with baseline comparison and threshold checking.

```bash
# Run basic analysis
pnpm analyze:custom

# Save current build as baseline for future comparisons
pnpm analyze:baseline

# Generate detailed JSON report
pnpm analyze:detailed

# Build and analyze in one command
pnpm build:analyze
```

#### 3. Size Limit Tool
Enforces size budgets defined in `.size-limit.json`.

```bash
# Check current sizes against limits
pnpm size

# Show why packages are included
pnpm size:why
```

### Size Budgets

Current limits (defined in `.size-limit.json`):
- **Main Bundle**: 100KB (gzipped)
- **Framework Bundle**: 50KB (gzipped)
- **Pages Bundle**: 150KB (gzipped)
- **Total App Size**: 500KB (gzipped)
- **Homepage First Load**: 90KB (gzipped)

### CI/CD Integration

The GitHub Actions workflow (`.github/workflows/bundle-size.yml`) automatically:
- Analyzes bundle size on every PR affecting the web directory
- Comments PR with size report
- Checks against size limits
- Uploads detailed reports as artifacts
- Compares with baseline to detect significant increases

### Monitoring Best Practices

1. **Regular Baseline Updates**: After significant refactoring, update the baseline:
   ```bash
   pnpm build && pnpm analyze:baseline
   ```

2. **Pre-commit Checks**: Before committing major changes:
   ```bash
   pnpm build:analyze
   ```

3. **Investigate Size Increases**: When bundle size increases:
   ```bash
   # See what's included and why
   pnpm size:why
   
   # Visual analysis
   pnpm analyze
   ```

4. **Optimization Strategies**:
   - Use dynamic imports for large components
   - Implement code splitting for routes
   - Tree-shake unused dependencies
   - Optimize images and assets
   - Use lighter alternatives for heavy libraries

### Thresholds and Alerts

The custom analysis script (`scripts/bundle-analysis.js`) monitors:
- **Total size limit**: 2MB
- **Main bundle limit**: 200KB
- **Per-chunk limit**: 250KB
- **Warning threshold**: 10% increase from baseline
- **Critical threshold**: 25% increase from baseline

## Internationalization (i18n)

### Overview
The application uses next-i18next for internationalization, supporting English and Polish languages with automatic locale routing.

### Configuration

#### Supported Languages
- **English (en)**: Default language
- **Polish (pl)**: Secondary language

#### Files Structure
```
/public/locales/
├── en/
│   └── common.json    # English translations
└── pl/
    └── common.json    # Polish translations
```

#### Configuration Files
- `next-i18next.config.js` - i18next configuration
- `next.config.js` - Next.js i18n integration

### Usage

#### In Components
```typescript
import { useTranslation } from 'next-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  
  return (
    <h1>{t('pages.home.title')}</h1>
  );
}
```

#### In Pages (Server-Side)
```typescript
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
```

### Language Switcher

The `LanguageSwitcher` component is integrated into the navigation:
- **Desktop**: Button with flag icon and language name
- **Mobile**: Icon-only version in drawer menu
- Automatically updates URL with locale parameter
- Preserves current page context when switching languages

### Adding New Languages

1. **Create translation files**:
   ```bash
   mkdir public/locales/[locale-code]
   cp public/locales/en/common.json public/locales/[locale-code]/
   ```

2. **Update configuration**:
   ```javascript
   // next-i18next.config.js
   i18n: {
     locales: ['en', 'pl', 'new-locale'],
     // ...
   }
   ```

3. **Add to LanguageSwitcher**:
   ```typescript
   const languages = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'pl', name: 'Polski', flag: '🇵🇱' },
     { code: 'new-locale', name: 'New Language', flag: '🏁' },
   ];
   ```

### Translation Keys Structure

Current translation structure in `common.json`:
- `appName` - Application name
- `navigation.*` - Navigation menu items
- `auth.*` - Authentication-related text
- `common.*` - Common UI elements (buttons, actions)
- `errors.*` - Error messages
- `pages.*` - Page-specific content
- `organisation.*` - Organisation-related text

### URL Routing

URLs automatically include locale:
- English: `/` or `/en`
- Polish: `/pl`

Next.js handles locale detection and routing automatically.

### Automatic Language Detection

The application automatically detects the user's preferred language using multiple methods:

#### Detection Priority (in order):
1. **URL Path**: Explicit locale in URL (`/pl/dashboard`)
2. **Cookie**: Saved locale preference (`NEXT_LOCALE` cookie)
3. **Accept-Language Header**: Browser's preferred languages
4. **Default**: Falls back to English if no preference detected

#### Browser Language Support
The middleware maps common browser languages to supported locales:
- `en`, `en-US`, `en-GB`, `en-CA`, `en-AU` → `en`
- `pl`, `pl-PL` → `pl`

#### Automatic Redirects
- Users with Polish browser settings are automatically redirected to `/pl`
- First-time visitors get their language preference saved in a cookie
- Language preference persists for 1 year

#### Detection Headers
The middleware adds debug headers to responses:
- `x-detected-locale`: The locale that was detected
- `x-accept-language`: The original Accept-Language header value

#### Middleware Configuration
The locale detection middleware (`middleware.ts`) handles:
- Accept-Language header parsing with quality values
- Cookie-based preference storage
- Automatic redirects for non-default locales
- Exclusion of API routes and static files

#### Testing Language Detection
To test language detection:
1. **Chrome**: Settings → Languages → Add Polish, move to top
2. **Firefox**: Settings → General → Language → Choose → Add Polish
3. **Safari**: System Preferences → Language & Region → Add Polish

The application will automatically redirect to `/pl` on the next visit.

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

## Code Style and Architecture Guidelines

### Database
1. Always use singular instead of plural when naming database tables. For example, use `user` instead of `users`.
2. Use `@Transactional` annotation for methods that modify database state
3. Ensure proper cascade and fetch strategies in JPA relationships

### Frontend (TypeScript/React)
1. Make use of typescript and avoid using `any` types.
2. **MANDATORY**: Run `pnpm run typecheck` regularly when working on the UI - do not proceed with testing until all TypeScript errors are resolved
3. **MANDATORY**: Always use generated TypeScript types from protobuf code - never create duplicate interfaces or make up types that already exist in generated `.pb.ts` files
4. Always use proper TypeScript types generated from protobuf - use `create()` from `@bufbuild/protobuf` to create protobuf messages
5. **MANDATORY**: Every React component MUST have proper TypeScript interfaces defined for their props - never use untyped props
6. **MANDATORY**: Use React hooks consistently throughout the application - prefer hooks-based APIs over manual implementations where available (e.g., use Connect Query hooks instead of manual API clients)
7. **CRITICAL**: No task is ever considered complete if any tests are failing or if there are TypeScript errors
8. Avoid using non-exact version numbers in dependencies in `package.json` files. For example, use `3.2.0` instead of `^3.2.0` I want to see the actual version number not approximations.
9. **MANDATORY**: Create reusable components wherever possible to avoid code duplication - always check if a similar component already exists before creating a new one
10. **MANDATORY**: Use the existing Layout component for page structure and the reusable Navbar component for navigation - never create custom navigation bars

### Backend (Java/Spring Boot)
1. **Separation of Concerns**: Keep controllers thin - they should only handle HTTP concerns
2. **Service Layer**: Business logic goes in `@Service` classes with `@Transactional` for DB operations
3. **Mappers Must Be Static**: All mapper classes should contain only static methods, never use `@Component` or `@Autowired` for mappers
4. **Use Existing Utilities**: Always check for and use existing mapper utilities (e.g., TimeMapper for timestamps) instead of duplicating code
5. **Request/Response Mapping**: Create dedicated mapper classes for converting between Proto requests/responses and domain entities
6. **No Business Logic in Controllers**: Controllers should only:
   - Extract authentication context
   - Call service methods
   - Return responses
7. **Proper Authorization**: Check user permissions in service layer, not controllers
8. **Consistent Error Handling**: Use proper exception types and HTTP status codes

### Proto/API Design
1. **MANDATORY**: Use Protocol Buffers for all API contracts - NEVER create REST endpoints
2. **Frontend**: Always use Connect RPC client with generated protobuf services - no fetch() calls to custom endpoints
3. **Backend**: All API endpoints must be protobuf-based with Connect annotations
4. Generate code with `task proto` after modifying .proto files
5. Keep proto definitions aligned with database schema
6. Use optional fields for update requests
7. If you need new API functionality, define it in `.proto` files first, never create ad-hoc REST endpoints