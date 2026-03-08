# Requirements: EK Backend (Event Karlo)

**Defined:** 2026-03-08
**Core Value:** Vendors can list services and customers can discover them — behind a secure, session-based auth layer powered by Neon Auth

## v1 Requirements

### ESM Migration & Project Health

- [ ] **ESM-01**: All source files converted from CommonJS (`require`/`module.exports`) to ESM (`import`/`export`)
- [ ] **ESM-02**: `package.json` `main` field corrected from `app.js` to `index.js`
- [ ] **ESM-03**: `tsconfig.json` deleted; `@types/node`, `@types/pg`, `@types/ws` removed from devDependencies
- [ ] **ESM-04**: `config/db.js` (pg pool with hardcoded credentials) deleted
- [ ] **ESM-05**: `pg` and `ws` removed from production dependencies

### Bug Fixes

- [ ] **BUG-01**: Implicit global `userId` variable fixed in `createUser` and `signupUser` (add `const`)
- [ ] **BUG-02**: `loginUser` returns `401` when password is wrong (not silence/timeout)
- [ ] **BUG-03**: `loginUser` validates `password` field presence and returns `400` if missing
- [ ] **BUG-04**: Auth failures return `401`, validation errors return `400` (not `500` for all)
- [ ] **BUG-05**: `signupUser` no longer logs plaintext password to console
- [ ] **BUG-06**: `signupUser` no longer includes `error.message` in response body
- [ ] **BUG-07**: `getUsers` function and commented-out route deleted entirely

### Neon Auth (Better Auth)

- [ ] **AUTH-01**: `better-auth` installed; configured with Prisma adapter pointing to NeonDB
- [ ] **AUTH-02**: `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` added to `.env`
- [ ] **AUTH-03**: Better Auth schema generated and migrated (user, session, account, verification tables)
- [ ] **AUTH-04**: Better Auth routes mounted at `/api/auth/*splat` on the Express app (before `express.json()`)
- [ ] **AUTH-05**: `onUserCreate` hook creates a corresponding `event_karlo_backend.user` profile record on registration
- [ ] **AUTH-06**: Auth middleware (`middlewares/auth.js`) verifies session via `auth.api.getSession()` and attaches user to `req.user`

### Database Schema

- [ ] **DB-01**: Prisma installed and configured with `DATABASE_URL`
- [ ] **DB-02**: `prisma/schema.prisma` defines `event_karlo_backend` schema prefix on all app models
- [ ] **DB-03**: `user` model: id (Int, autoincrement), user_id (String, uuid, @id), email (String, unique), first_name, last_name, phone (optional), user_type (enum: customer/vendor/admin), created_at, updated_at
- [ ] **DB-04**: `service` model: id (Int, autoincrement), service_id (String, uuid), name, description, vendor_id (FK → user.user_id), meta (Json), created_at, updated_at
- [ ] **DB-05**: `subscription` model: id (Int, autoincrement), subscription_id (String, uuid), user_id (FK → user.user_id), plan (enum: free/pro/premium), status (enum: active/inactive/cancelled/expired), started_at, expires_at, renewed_at (optional), payment_ref (optional), created_at, updated_at
- [ ] **DB-06**: Initial Prisma migration runs successfully against NeonDB creating all three tables

### Security & Validation

- [ ] **SEC-01**: CORS restricted to `process.env.ALLOWED_ORIGINS` (no wildcard)
- [ ] **SEC-02**: Zod validation applied to all application API request bodies
- [ ] **SEC-03**: Rate limiting applied to auth-sensitive endpoints via `express-rate-limit`
- [ ] **SEC-04**: `errorHandler` middleware handles `err.status`/`err.statusCode` (not always 500); suppresses stack trace outside dev
- [ ] **SEC-05**: `config/prisma.js` is the single Prisma client instance (no direct instantiation in controllers)

## v2 Requirements

### Auth Extensions

- **AUTH-V2-01**: Email verification after signup (Better Auth plugin)
- **AUTH-V2-02**: OAuth providers (Google) via Better Auth
- **AUTH-V2-03**: Password reset flow (Better Auth plugin)

### Application Features

- **FEAT-01**: GET /api/users/me — return authenticated user's profile
- **FEAT-02**: PATCH /api/users/me — update profile fields
- **FEAT-03**: GET /api/services — list all services with filtering
- **FEAT-04**: POST /api/services — vendor creates a service
- **FEAT-05**: Subscription management endpoints (create, upgrade, cancel)

### Quality

- **QUAL-01**: Unit tests for middleware and utility functions
- **QUAL-02**: Integration tests for all API endpoints
- **QUAL-03**: Test runner configured in `package.json`

## Out of Scope

| Feature | Reason |
|---------|--------|
| Manual JWT implementation | Replaced entirely by Neon Auth (Better Auth) |
| `auth` table in event_karlo_backend | Better Auth manages credentials in its own schema |
| TypeScript migration | Explicitly deferred; remove TS artifacts, stay JS |
| Docker/docker-compose fixes | Not blocking with NeonDB remote |
| HTTPS enforcement | Handled at proxy/infra layer |
| Event/booking/payment tables | Future milestones |
| Stored procedures | Replaced by Prisma queries |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ESM-01 | Phase 1 | Pending |
| ESM-02 | Phase 1 | Pending |
| ESM-03 | Phase 1 | Pending |
| ESM-04 | Phase 1 | Pending |
| ESM-05 | Phase 1 | Pending |
| BUG-01 | Phase 1 | Pending |
| BUG-02 | Phase 1 | Pending |
| BUG-03 | Phase 1 | Pending |
| BUG-04 | Phase 1 | Pending |
| BUG-05 | Phase 1 | Pending |
| BUG-06 | Phase 1 | Pending |
| BUG-07 | Phase 1 | Pending |
| DB-01 | Phase 2 | Pending |
| DB-02 | Phase 2 | Pending |
| DB-03 | Phase 2 | Pending |
| DB-04 | Phase 2 | Pending |
| DB-05 | Phase 2 | Pending |
| DB-06 | Phase 2 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| SEC-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after scope revision*
