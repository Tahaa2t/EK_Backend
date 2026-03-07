# Technology Stack

**Analysis Date:** 2026-03-07

## Languages

**Primary:**
- JavaScript (ES Modules) - All application logic, server, routes, controllers, middleware

**Secondary:**
- TypeScript - Referenced via `tsconfig.json` and `@types/*` dev packages but source files are `.js`

## Runtime

**Environment:**
- Node.js v20 (Alpine-based Docker image: `node:20-alpine`)

**Package Manager:**
- npm 10.8.2
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Express 4.21.2 - HTTP server and routing framework (`index.js`)

**Build/Dev:**
- nodemon 3.1.9 - File-watching dev server restart (`npm run dev`)

**Testing:**
- Not configured (test script is a placeholder: `"test": "test"`)

## Key Dependencies

**Critical:**
- `express` ^4.21.2 - REST API server
- `pg` ^8.16.3 - PostgreSQL client (node-postgres), used in `config/db.js` via connection pool
- `@neondatabase/serverless` ^1.0.2 - Neon serverless Postgres driver (imported in package but not yet used in current source)
- `bcrypt` ^5.1.1 - Password hashing for user auth (`controllers/userController.js`)
- `dotenv` ^16.6.1 - Environment variable loading (`index.js`, `config/db.js`)

**Infrastructure:**
- `cors` ^2.8.5 - CORS middleware, permissive (no origin restriction configured)
- `helmet` ^8.0.0 - HTTP security headers
- `morgan` ^1.10.0 - HTTP request logging (dev format)
- `ws` ^8.19.0 - WebSocket library (present in deps, no usage found in current source)

**Dev Only:**
- `@types/node` ^25.0.5 - Node.js type definitions
- `@types/pg` ^8.16.0 - pg type definitions
- `@types/ws` ^8.18.1 - ws type definitions
- `nodemon` ^3.1.9 - Development auto-restart

## Configuration

**Environment:**
- Loaded via `dotenv` at startup in both `index.js` and `config/db.js`
- `.env` file present at project root (contents private)
- Key env vars referenced:
  - `APP_PORT` - Server port (default: 3000)
  - `APP_HOST` - Server host binding
  - `NEON_API_KEY` - Neon database API key (used in `docker-compose.yml`)
  - `NEON_PROJECT_ID` - Neon project identifier (used in `docker-compose.yml`)

**Build:**
- `tsconfig.json` - TypeScript config present (ESNext modules, ES2023 target, strict mode) but source is plain JS
- No transpile/build step; Node runs files directly

## Module System

- `package.json` declares `"type": "module"` (ESM)
- Source files use CommonJS `require()`/`module.exports` — **mismatch with declared module type**

## Platform Requirements

**Development:**
- Node.js 20+
- npm 10+
- Docker + Docker Compose (optional, `docker-compose.yml` provided)
- Docker Compose maps host port `3001` → container port `3000`

**Production:**
- Node.js 20 Alpine container
- Multi-stage Docker build (`docker/Dockerfile`)
- Runs `npm start` → `node index.js`

---

*Stack analysis: 2026-03-07*
