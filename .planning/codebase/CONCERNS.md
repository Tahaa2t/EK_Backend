# Codebase Concerns

**Analysis Date:** 2026-03-07

## Tech Debt

**Hardcoded Database Credentials in Source:**
- Issue: `config/db.js` contains a plaintext PostgreSQL password hardcoded directly in the source file. The pool is configured with `user: 'postgres'`, `password: '.lu:OXnIn3\`)i5Gr%clMU1$Z'`, `host: 'localhost'` — all literal strings, not env vars.
- Files: `config/db.js`
- Impact: Credentials are committed to git history. Anyone with repo access has full database access. Cannot rotate credentials without changing source code.
- Fix approach: Replace hardcoded values with `process.env.DB_USER`, `process.env.DB_PASSWORD`, `process.env.DB_HOST`, `process.env.DB_PORT`, `process.env.DB_NAME`.

**`config/db.js` Is Unused Dead Code:**
- Issue: `config/db.js` uses the `pg` Pool directly but the application now uses `@neondatabase/serverless` (Neon DB). The controller `controllers/userController.js` still imports from `../config/db`, yet the Neon migration commit message says "Implemented Neon DB". Either the migration is incomplete or `config/db.js` is stale legacy code.
- Files: `config/db.js`, `controllers/userController.js`
- Impact: Ambiguity about which database client is actually in use. The hardcoded local Postgres pool may silently fail in production (Neon is cloud-hosted) causing runtime errors.
- Fix approach: Determine the correct DB client (Neon serverless or pg), create a single `config/db.js` using env vars, remove the other.

**Module System Mismatch — CommonJS vs ESM:**
- Issue: `package.json` declares `"type": "module"` (ESM), but every `.js` file uses CommonJS syntax (`require()`, `module.exports`). This is contradictory and will cause Node.js to throw `ERR_REQUIRE_ESM` or `SyntaxError: require is not defined` at runtime.
- Files: `package.json`, `index.js`, `config/db.js`, `controllers/userController.js`, `routes/userRoutes.js`, `middlewares/errorHandler.js`, `utils/utils.js`
- Impact: The application likely cannot start as written. Either `"type": "module"` must be removed from `package.json`, or all files must be converted to ESM (`import`/`export`).
- Fix approach: Remove `"type": "module"` from `package.json` to stay CommonJS (simplest), OR convert all files to ESM imports/exports.

**`package.json` `main` Field Points to Non-Existent File:**
- Issue: `package.json` sets `"main": "app.js"` but the actual entry point file is `index.js`. No `app.js` exists in the project.
- Files: `package.json`
- Impact: Any tooling or programmatic require of the package resolves to a missing file.
- Fix approach: Change `"main"` to `"index.js"`.

**`tsconfig.json` Present but No TypeScript Used:**
- Issue: A `tsconfig.json` exists with strict TypeScript compiler options, but all source files are plain `.js` with no type annotations. The `@types/*` devDependencies (`@types/node`, `@types/pg`, `@types/ws`) are installed but unused.
- Files: `tsconfig.json`, `package.json`
- Impact: Developer confusion — unclear whether TS migration is planned or abandoned. Dead devDependencies add install weight.
- Fix approach: Either migrate to TypeScript (rename files to `.ts`, add a build step) or remove `tsconfig.json` and the `@types/*` devDependencies.

**Commented-Out `getUsers` Route:**
- Issue: The `GET /api/users` route is commented out in `routes/userRoutes.js` and the `getUsers` controller is not exported. The `getUsers` function in `controllers/userController.js` still performs `SELECT * FROM event_karlo_backend.users` with no authentication or pagination.
- Files: `routes/userRoutes.js`, `controllers/userController.js`
- Impact: If uncommented, this endpoint would expose all user records to unauthenticated requests. The commented-out state suggests the route was disabled without a proper plan.
- Fix approach: Either delete `getUsers` entirely or implement it with authentication middleware and pagination before re-enabling.

## Known Bugs

**Implicit Global Variable `userId`:**
- Symptoms: In both `createUser` (line 57) and `signupUser` (line 154), `userId = result.rows[0].user_id` assigns to an undeclared variable (`var`/`let`/`const` missing). This creates an implicit global variable in non-strict mode and throws `ReferenceError` in strict mode.
- Files: `controllers/userController.js` (lines 57, 154)
- Trigger: Any successful `POST /api/users/signup` or equivalent call to `createUser`.
- Workaround: None in current code. Fix by adding `const userId =`.

**`loginUser` Does Not Handle Wrong Password:**
- Symptoms: When `bcrypt.compare` returns `false` (incorrect password), the `if` block is skipped but no `else` or `return` sends a response. The request hangs until timeout.
- Files: `controllers/userController.js` (lines 99–107)
- Trigger: Any login attempt with a wrong password.
- Workaround: None. Fix by adding an `else` block that returns `401 Unauthorized`.

**`loginUser` Does Not Validate `password` Field:**
- Symptoms: `email` is checked for presence but `password` is never validated. If `password` is `undefined`, `bcrypt.compare(undefined, hash)` throws an error caught generically as "Authentication Error" with a 500 status instead of a 400 bad request.
- Files: `controllers/userController.js` (lines 84–86)
- Trigger: `POST /api/users/login` with missing `password` body field.
- Workaround: None. Fix by adding a `password` presence check.

**`loginUser` Leaks Internal Error Status (500) for Auth Failures:**
- Symptoms: Authentication failures (wrong password, missing fields) all result in `500 Authentication Error`. Clients cannot distinguish a server crash from a bad credential.
- Files: `controllers/userController.js` (lines 108–111)
- Trigger: Any failed login.
- Workaround: None. Fix by returning `401` for auth failures, `400` for validation errors, and reserving `500` for actual server errors.

**`signupUser` Logs Plaintext Password to Console:**
- Symptoms: Line 130 executes `console.log(\`Hashing the password ${password}\`)` which outputs the user's raw plaintext password to stdout/logs.
- Files: `controllers/userController.js` (line 130)
- Trigger: Every signup request.
- Workaround: None. Remove this log statement immediately.

**`signupUser` Returns Internal Error Details to Client:**
- Symptoms: The `catch` block in `signupUser` returns `error.message` in the JSON response body (`res.status(500).json({ message: "Server Error", error: error.message })`). This can expose internal database errors, table names, and constraint names to the client.
- Files: `controllers/userController.js` (lines 174–177)
- Trigger: Any signup that triggers a server error (e.g., duplicate email).
- Workaround: None. Remove `error: error.message` from the response.

## Security Considerations

**No Authentication Middleware on Any Route:**
- Risk: All routes are publicly accessible. There is no JWT validation, session check, or any other auth guard.
- Files: `routes/userRoutes.js`, `middlewares/` (no auth middleware exists)
- Current mitigation: None.
- Recommendations: Implement JWT-based middleware; apply it to all routes except `/signup` and `/login`.

**CORS Configured with Wildcard (`cors()` default):**
- Risk: `app.use(cors())` with no options allows all origins. Any website can make credentialed requests to this API.
- Files: `index.js` (line 17)
- Current mitigation: None.
- Recommendations: Configure `cors({ origin: process.env.ALLOWED_ORIGINS })` with explicit allowed origins for production.

**No Input Validation or Sanitization:**
- Risk: No validation library (e.g., Joi, Zod, express-validator) is used. User-supplied data is passed directly to SQL queries. While parameterized queries prevent SQL injection, invalid data types or lengths can cause unhandled database errors that leak schema information.
- Files: `controllers/userController.js`
- Current mitigation: Parameterized queries prevent SQL injection.
- Recommendations: Add schema validation on all request bodies before processing; return `400` with field-specific errors on invalid input.

**No Rate Limiting:**
- Risk: The login endpoint has no rate limiting, enabling brute-force password attacks.
- Files: `index.js`, `routes/userRoutes.js`
- Current mitigation: None.
- Recommendations: Add `express-rate-limit` middleware, especially on `POST /api/users/login`.

**`.env` File Committed or Present in Repo Root:**
- Risk: The `.env` file exists at `/var/www/vhosts/EK_Backend/.env`. While `.gitignore` lists `.env`, its presence on disk alongside `config/db.js` with hardcoded credentials compounds the credential exposure risk.
- Files: `.env`
- Current mitigation: `.gitignore` includes `.env`.
- Recommendations: Audit git history to ensure `.env` was never committed; verify via `git log --all -- .env`.

**No HTTPS Enforcement:**
- Risk: The server binds to HTTP only. Credentials sent to `/login` and `/signup` transit in plaintext unless a reverse proxy enforces TLS.
- Files: `index.js`
- Current mitigation: None at the application level.
- Recommendations: Document TLS termination requirement at the proxy/infrastructure layer; add `helmet` HSTS header configuration.

## Performance Bottlenecks

**`pg` Pool Initialized at Module Load with Hardcoded Local Config:**
- Problem: `config/db.js` creates and immediately tests a connection at require-time. If the local Postgres is unavailable, the app logs an error but continues running in a broken state.
- Files: `config/db.js`
- Cause: No connection health check before accepting requests; pool error does not crash the process.
- Improvement path: Use Neon serverless client consistently; add a startup health check that prevents the server from listening until the DB is reachable.

**No Connection Pooling Configuration for Neon:**
- Problem: `@neondatabase/serverless` and `ws` are installed but there is no Neon client setup file. If Neon is used without pooling config, each request may open a new connection.
- Files: No Neon client config file found
- Cause: Incomplete migration from `pg` to Neon.
- Improvement path: Create a dedicated Neon client module with proper connection pooling settings.

## Fragile Areas

**Transaction Management in `createUser` and `signupUser`:**
- Files: `controllers/userController.js` (lines 37–74, 135–166)
- Why fragile: Manual `BEGIN`/`COMMIT`/`ROLLBACK` using raw query strings. If the pool itself throws between `BEGIN` and `ROLLBACK` (e.g., pool exhaustion), the transaction may be left open. No savepoints or nested transaction support.
- Safe modification: Always wrap in try/finally to guarantee `ROLLBACK` is attempted even if the catch block itself throws.
- Test coverage: No tests exist for any controller logic.

**`errorHandler` Middleware Is Too Generic:**
- Files: `middlewares/errorHandler.js`
- Why fragile: The global error handler only returns a static 500 message. It does not handle `err.status` or `err.statusCode`, so any middleware that calls `next(err)` with a 4xx error will still return 500. It also logs the full stack to console in production.
- Safe modification: Add `err.status || err.statusCode` check; suppress stack trace logging outside development.
- Test coverage: None.

**`docker-compose.yml` Mixes Concerns and Lacks Network for DB:**
- Files: `docker-compose.yml`
- Why fragile: The `ek_neon_db` service (Neon local) is not attached to the `ek_network`, so the app container cannot reach the DB container by service name. The app container also has no DB-related env vars set, so `config/db.js` would default to `localhost:5432` which does not resolve inside the container.
- Safe modification: Add `ek_neon_db` to `ek_network`; pass DB connection env vars to the app service.
- Test coverage: Not applicable (infrastructure config).

## Missing Critical Features

**No Authentication Token Issuance:**
- Problem: `loginUser` returns a success message and `first_name` but no session token or JWT. After login, the client has no credential to authenticate subsequent requests.
- Blocks: Any protected endpoint; effective user sessions.

**No Input Validation Layer:**
- Problem: No validation middleware or schema enforcement exists for any endpoint.
- Blocks: Safe production deployment; reliable API contracts.

**No Refresh Token / Session Management:**
- Problem: No token lifecycle management (issuance, expiry, refresh, revocation).
- Blocks: Secure stateless auth for all future protected routes.

## Test Coverage Gaps

**Zero Test Coverage Across Entire Codebase:**
- What's not tested: All controller logic, route handling, middleware, utility functions, database interaction, error scenarios.
- Files: `controllers/userController.js`, `routes/userRoutes.js`, `middlewares/errorHandler.js`, `utils/utils.js`
- Risk: Silent regressions in all critical paths — auth, signup, DB transactions — go undetected.
- Priority: High

**`test` Script Is a Placeholder:**
- What's not tested: The `package.json` `"test"` script is set to the literal string `"test"`, not a test runner command. Running `npm test` exits immediately.
- Files: `package.json` (line 8)
- Risk: CI pipelines report false success on test runs.
- Priority: High

---

*Concerns audit: 2026-03-07*
