# EK Backend (Event Karlo)

## What This Is

A Node.js/Express REST API backend for the "Event Karlo" platform. Currently implements user signup and login endpoints with bcrypt password hashing. The project is in early development — the database layer is being migrated to Prisma ORM with NeonDB, and multiple bugs and security issues identified in the codebase audit need to be resolved before production readiness.

## Core Value

Users can securely sign up and log in, receiving a JWT to authenticate subsequent requests — everything else depends on this working correctly.

## Requirements

### Validated

- ✓ Express server with cors, helmet, morgan middleware — existing
- ✓ POST /api/users/signup endpoint — existing (buggy, being fixed)
- ✓ POST /api/users/login endpoint — existing (buggy, being fixed)
- ✓ Password hashing with bcrypt (salt rounds = 10) — existing
- ✓ Global error handler middleware — existing (being improved)

### Active

- [ ] Prisma ORM installed and configured with NeonDB (DATABASE_URL from .env)
- [ ] Prisma schema defines `users` and `auth` tables; initial migration run against NeonDB
- [ ] All DB access via Prisma client (replace pg pool + raw SQL in controllers)
- [ ] Module system fixed: remove `"type": "module"` from package.json (stay CommonJS)
- [ ] package.json `main` field corrected to `index.js`
- [ ] TypeScript artifacts removed (tsconfig.json, @types/* devDependencies)
- [ ] Implicit global `userId` variable fixed (add `const`) in createUser and signupUser
- [ ] loginUser: wrong password returns 401 (not silence/timeout)
- [ ] loginUser: missing `password` field returns 400 (not 500)
- [ ] loginUser: issues JWT access token on success
- [ ] signupUser: plaintext password removed from console.log
- [ ] signupUser: error.message removed from response body
- [ ] CORS restricted to `process.env.ALLOWED_ORIGINS` (no wildcard)
- [ ] Input validation added to signup and login (Zod)
- [ ] Rate limiting on POST /api/users/login (express-rate-limit)
- [ ] Auth middleware (JWT verification) in place for future protected routes
- [ ] errorHandler middleware handles err.status / err.statusCode correctly
- [ ] getUsers function and route deleted entirely

### Out of Scope

- Refresh tokens / token rotation — deferred to next milestone after core auth works
- Email verification after signup — not in current scope
- OAuth / magic link login — not in current scope
- Tests — not in current scope (zero test infra exists; add in a future phase)
- Docker/docker-compose fixes — not blocking local dev with NeonDB
- HTTPS enforcement — handled at infra/proxy layer, not application layer

## Context

- Database was previously local Postgres with hardcoded credentials in config/db.js; now migrating to NeonDB with DATABASE_URL in .env
- The `event_karlo_backend` schema and its `users`/`auth` tables previously existed on the old machine; they need to be recreated via Prisma migrations on NeonDB from scratch
- The stored procedure `event_karlo_backend.get_password_hash_by_email` (used in loginUser) will be replaced by a Prisma query — no stored procedures needed
- Module system: package.json declares ESM (`"type": "module"`) but all source files use CommonJS (`require`/`module.exports`) — fix by removing `"type": "module"` (simpler than converting everything to ESM)
- jsonwebtoken needs to be added as a dependency for JWT issuance
- zod and express-rate-limit need to be added as dependencies

## Constraints

- **DB**: NeonDB only — DATABASE_URL already in .env, no local Postgres
- **ORM**: Prisma — for both schema definition and migrations
- **Language**: Plain JavaScript (CommonJS) — TypeScript migration explicitly deferred
- **Auth**: JWT-based stateless auth — no sessions, no refresh tokens in this milestone

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Prisma over raw SQL | Eliminates manual transaction management, provides type-safe queries, handles migrations | — Pending |
| Stay CommonJS | Removing `"type": "module"` is one-line fix vs converting 7 files to ESM | — Pending |
| Delete getUsers | Exposing all users with no auth/pagination is a security risk; not needed now | — Pending |
| JWT (no refresh tokens) | Simplest working auth for v1; refresh tokens deferred | — Pending |
| Zod for validation | Works well with JS + Prisma, good error messages | — Pending |

---
*Last updated: 2026-03-08 after initialization*
