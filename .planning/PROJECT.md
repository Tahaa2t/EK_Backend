# EK Backend (Event Karlo)

## What This Is

A Node.js/Express REST API backend for the "Event Karlo" event management platform. The system manages users (customers, vendors, admins), event services offered by vendors, and platform subscriptions. Authentication is handled by Neon Auth (Better Auth), which stores credentials and sessions in its own schema. Application data lives in the `event_karlo_backend` schema managed via Prisma.

## Core Value

Vendors can list services and customers can discover them — all behind a secure, session-based auth layer powered by Neon Auth.

## Requirements

### Validated

- ✓ Express server with cors, helmet, morgan middleware — existing
- ✓ Global error handler middleware — existing (being improved)

### Active

**ESM & Project Health**
- [ ] All source files converted from CommonJS to ESM (required by Better Auth)
- [ ] `package.json` `main` field corrected to `index.js`
- [ ] `tsconfig.json` and `@types/*` devDependencies removed
- [ ] `config/db.js` (pg pool, hardcoded credentials) deleted
- [ ] `pg` and `ws` removed from dependencies
- [ ] All bugs from codebase audit fixed (implicit globals, status codes, password logging, error leakage)
- [ ] `getUsers` function and route deleted

**Neon Auth (Better Auth)**
- [ ] Better Auth installed and configured with Prisma adapter
- [ ] Auth routes mounted at `/api/auth/*` via `toNodeHandler(auth)`
- [ ] Better Auth generates and migrates its own schema (user, session, account, verification tables)
- [ ] `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` added to `.env`
- [ ] Auth middleware (`middlewares/auth.js`) verifies session via `auth.api.getSession()`
- [ ] User profile record in `event_karlo_backend.user` auto-created via Better Auth `onUserCreate` hook

**Database Schema (Prisma → NeonDB)**
- [ ] Prisma configured with `DATABASE_URL`; schema in `prisma/schema.prisma`
- [ ] `event_karlo_backend.user` table: id (serial), user_id (uuid, PK), email, first_name, last_name, phone, user_type (customer/vendor/admin), created_at, updated_at
- [ ] `event_karlo_backend.service` table: id (serial), service_id (uuid, PK), name, description, vendor_id (FK → user.user_id), meta (JSON), created_at, updated_at
- [ ] `event_karlo_backend.subscription` table: id (serial), subscription_id (uuid, PK), user_id (FK → user.user_id), plan (free/pro/premium), status (active/inactive/cancelled/expired), started_at, expires_at, renewed_at, payment_ref, created_at, updated_at
- [ ] Initial migration runs successfully against NeonDB

**Security & Validation**
- [ ] CORS restricted to `process.env.ALLOWED_ORIGINS`
- [ ] Zod validation on all API request bodies
- [ ] Rate limiting on auth-sensitive endpoints (express-rate-limit)
- [ ] `errorHandler` middleware handles `err.status`/`err.statusCode` correctly

### Out of Scope

- Manual JWT implementation — replaced entirely by Neon Auth (Better Auth)
- `auth` table in `event_karlo_backend` — Better Auth manages credentials in its own schema
- Email verification, OAuth, magic link — Better Auth supports these later; not in v1
- Refresh token management — handled transparently by Better Auth sessions
- Tests — deferred to future milestone
- Docker/docker-compose fixes — not blocking with NeonDB remote
- HTTPS enforcement — handled at proxy/infra layer
- Event table, booking table, payments — future milestones

## Context

- Previously: local Postgres with hardcoded credentials in `config/db.js`, manual bcrypt + raw SQL controllers
- Now: NeonDB remote, Neon Auth (Better Auth) for credentials/sessions, Prisma for app schema
- Better Auth **requires ESM** (`"type": "module"`) — source files must be converted from `require()`/`module.exports` to `import`/`export`
- The old `signupUser` and `loginUser` controllers are replaced by Better Auth's `/api/auth/sign-up` and `/api/auth/sign-in` endpoints
- `event_karlo_backend.user` is an application profile table linked to Better Auth's internal user id
- Schema name: `event_karlo_backend` (set in Prisma schema via `@@schema`)

## Constraints

- **Auth**: Neon Auth (Better Auth) — no manual JWT, no manual password hashing
- **DB**: NeonDB only — `DATABASE_URL` in `.env`
- **ORM**: Prisma — schema definition, migrations, and app queries
- **Language**: JavaScript ESM — required by Better Auth; no TypeScript
- **Module system**: ESM throughout — `"type": "module"` stays in `package.json`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Neon Auth (Better Auth) | Offloads credential storage, sessions, token management to managed service | — Pending |
| Convert to ESM (not remove) | Better Auth explicitly requires ESM; CommonJS not supported | — Pending |
| Prisma for app schema | Type-safe queries, migration management, NeonDB compatible | — Pending |
| `event_karlo_backend` schema via Prisma | User-defined schema prefix, keeps app data separate from auth schema | — Pending |
| subscription = platform tiers | Free/Pro/Premium access model for platform features | — Pending |

---
*Last updated: 2026-03-08 after scope revision — Neon Auth replaces manual JWT, schema expanded to service/subscription*
