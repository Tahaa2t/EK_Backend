# External Integrations

**Analysis Date:** 2026-03-07

## APIs & External Services

**None currently integrated** beyond database and the packages listed below.

## Data Storage

**Databases:**
- PostgreSQL via Neon (serverless Postgres)
  - Client: `pg` (node-postgres) `Pool` in `config/db.js`
  - Connection: Hardcoded credentials in `config/db.js` (host: `localhost`, port: `5432`, database: `postgres`, user: `postgres`)
  - Schema: `event_karlo_backend` (used as Postgres schema prefix in all queries)
  - Tables used: `event_karlo_backend.users`, `event_karlo_backend.auth`
  - Stored procedures: `event_karlo_backend.get_password_hash_by_email` (called via `CALL` in `loginUser`)
  - Note: `@neondatabase/serverless` ^1.0.2 is installed but not yet imported in source files; current DB connection uses standard `pg` pool

**Local Dev DB:**
- Docker Compose (`docker-compose.yml`) defines `ek_neon_db` service using `neondatabase/neon_local:latest` image
  - Maps host port `5434` → container `5432`
  - Requires `NEON_API_KEY` and `NEON_PROJECT_ID` env vars

**File Storage:**
- Local filesystem only - no cloud storage integration detected

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Custom (no third-party auth provider)
  - Implementation: bcrypt password hashing (`bcrypt` ^5.1.1)
  - Passwords hashed with salt rounds of `10` in `controllers/userController.js`
  - No JWT or session tokens issued on login — login response returns status + first_name only
  - No token-based auth middleware detected

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Datadog, etc.)

**Logs:**
- `morgan` HTTP request logging in `dev` format (stdout)
- `console.error` for application errors in controllers and middleware
- `console.log` for server start and DB connection status

## CI/CD & Deployment

**Hosting:**
- Docker containers (confirmed by `docker/Dockerfile` and `docker/Dockerfile.dev`)
- Deployment target platform not specified beyond Docker

**CI Pipeline:**
- None detected (no `.github/workflows/`, `.gitlab-ci.yml`, or similar)

## Environment Configuration

**Required env vars:**
- `APP_PORT` - Port for the Express server (fallback: `3000`)
- `APP_HOST` - Host binding for Express server
- `NEON_API_KEY` - Required by Docker Compose for local Neon DB container
- `NEON_PROJECT_ID` - Required by Docker Compose for local Neon DB container
- DB credentials currently hardcoded in `config/db.js` (not env-driven)

**Secrets location:**
- `.env` file at project root (gitignored)
- DB credentials hardcoded in `config/db.js` — not loaded from environment

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## WebSocket

- `ws` ^8.19.0 package is installed and listed in dependencies
- No WebSocket server or client usage found in current source files
- Likely planned for future real-time features

---

*Integration audit: 2026-03-07*
