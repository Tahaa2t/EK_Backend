# Architecture

**Analysis Date:** 2026-03-07

## Pattern Overview

**Overall:** Layered MVC (Model-View-Controller) REST API — Routes → Controllers → Database

**Key Characteristics:**
- No service layer; controllers access the database pool directly via `config/db.js`
- PostgreSQL schema namespaced under `event_karlo_backend` schema
- Stateless HTTP API; no session management — authentication is request-scoped only (no JWT or session tokens returned)
- Transactions managed explicitly in controllers using `BEGIN` / `COMMIT` / `ROLLBACK` SQL calls

## Layers

**Entry Point / App Bootstrap:**
- Purpose: Configure Express app, register global middleware, mount routers, start HTTP server
- Location: `index.js`
- Contains: Express instance, cors/helmet/morgan setup, route mounting, error handler registration
- Depends on: `routes/`, `middlewares/errorHandler.js`
- Used by: Node.js runtime directly

**Routing Layer:**
- Purpose: Map HTTP method + path to controller function
- Location: `routes/`
- Contains: Express Router instances, one file per resource
- Depends on: `controllers/`
- Used by: `index.js` via `app.use('/api/...', router)`

**Controller Layer:**
- Purpose: Handle request parsing, business logic, database queries, and response formatting
- Location: `controllers/`
- Contains: Async handler functions exported as named exports
- Depends on: `config/db.js` (pool), `bcrypt`, `utils/utils.js`
- Used by: `routes/`

**Database Config:**
- Purpose: Create and export a shared `pg.Pool` instance; connect on startup
- Location: `config/db.js`
- Contains: Pool instantiation, connect-on-load with console logging
- Depends on: `pg`, `dotenv`
- Used by: `controllers/`

**Utilities:**
- Purpose: Shared helper functions not specific to any route or controller
- Location: `utils/utils.js`
- Contains: `extractNames(fullName)` — splits a full name string into `first_name` / `last_name`
- Depends on: Nothing
- Used by: `controllers/userController.js`

**Middleware:**
- Purpose: Global Express error handling
- Location: `middlewares/errorHandler.js`
- Contains: Four-argument Express error handler `(err, req, res, next)`
- Depends on: Nothing
- Used by: `index.js` (registered last, after all routes)

## Data Flow

**User Signup (`POST /api/users/signup`):**

1. Request hits `index.js` → routed to `routes/userRoutes.js`
2. `userRoutes.js` delegates to `signupUser` in `controllers/userController.js`
3. Controller extracts `email`, `full_name`, `password` from `req.body`
4. `extractNames()` from `utils/utils.js` splits `full_name`
5. `bcrypt.hash()` hashes password with salt rounds = 10
6. Controller opens a PostgreSQL transaction (`BEGIN`)
7. Inserts into `event_karlo_backend.users` table; receives `user_id`
8. Inserts into `event_karlo_backend.auth` table with `user_id` + `password_hash`
9. Commits transaction (`COMMIT`); rolls back on any error (`ROLLBACK`)
10. Returns `201` with the created user row, or `500` with error message

**User Login (`POST /api/users/login`):**

1. Request hits `index.js` → routed to `routes/userRoutes.js`
2. `userRoutes.js` delegates to `loginUser` in `controllers/userController.js`
3. Controller calls PostgreSQL stored procedure `event_karlo_backend.get_password_hash_by_email` via `CALL`
4. `bcrypt.compare()` validates the submitted password against the stored hash
5. Returns `200` with status/message/firstName on success, or `500` on failure

**State Management:**
- No in-memory state; all state is persisted in PostgreSQL
- No JWT or session token is issued on login — the login response returns only a status message

## Key Abstractions

**Database Pool (`pool`):**
- Purpose: Single shared connection pool to PostgreSQL, reused across all requests
- Examples: `config/db.js`
- Pattern: Module-level singleton; `require('../config/db')` returns the same pool instance

**Route Handlers:**
- Purpose: Thin Express router files that declare path+method bindings
- Examples: `routes/userRoutes.js`
- Pattern: `router.post('/path', controllerFn)` — no inline logic

**Controller Functions:**
- Purpose: Contain all business logic and SQL for a resource
- Examples: `controllers/userController.js` — `getUsers`, `createUser`, `loginUser`, `signupUser`
- Pattern: `async (req, res)` functions with try/catch; respond directly via `res.status().json()`

**Stored Procedures:**
- Purpose: Encapsulate read logic inside PostgreSQL for login credential lookup
- Examples: `event_karlo_backend.get_password_hash_by_email` (called via `CALL` in `loginUser`)
- Pattern: Called using `pool.query('CALL ...', [params])` with OUT parameters

## Entry Points

**HTTP Server:**
- Location: `index.js`
- Triggers: `node index.js` or `npm start`
- Responsibilities: Load env, configure Express, mount all routes, start listening on `APP_PORT` (default 3000)

**User API Routes:**
- Location: `routes/userRoutes.js`
- Triggers: HTTP requests to `/api/users/*`
- Responsibilities: Route `POST /signup` → `signupUser`, `POST /login` → `loginUser`

## Error Handling

**Strategy:** Catch-all try/catch in each controller; global Express error handler as fallback

**Patterns:**
- Each controller function wraps logic in `try { ... } catch (error) { res.status(500).json(...) }`
- Database transactions roll back on any caught error
- `middlewares/errorHandler.js` handles uncaught Express errors (four-argument middleware registered last in `index.js`)
- Errors are logged to `console.error` before responding

## Cross-Cutting Concerns

**Logging:** `morgan('dev')` for HTTP request logging; `console.error` for application errors; `console.log` for startup events
**Validation:** Minimal — only `email` presence is checked in `loginUser`; no input validation library used
**Authentication:** Password hashing via `bcrypt` (salt rounds = 10); no token issuance or session management present

---

*Architecture analysis: 2026-03-07*
