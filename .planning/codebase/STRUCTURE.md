# Codebase Structure

**Analysis Date:** 2026-03-07

## Directory Layout

```
EK_Backend/
├── index.js              # App entry point — Express setup, middleware, server start
├── package.json          # Dependencies and npm scripts
├── package-lock.json     # Lockfile
├── tsconfig.json         # TypeScript compiler config (types only; runtime is plain JS)
├── docker-compose.yml    # Docker Compose service definitions
├── .env                  # Environment variables (not committed)
├── .gitignore            # Git ignore rules
├── README.md             # Project readme
│
├── config/               # Infrastructure configuration
│   └── db.js             # PostgreSQL connection pool (pg.Pool singleton)
│
├── controllers/          # Business logic and SQL query handlers
│   └── userController.js # getUsers, createUser, loginUser, signupUser
│
├── routes/               # Express Router definitions (path → controller mapping)
│   └── userRoutes.js     # /signup, /login routes under /api/users
│
├── middlewares/          # Express middleware
│   └── errorHandler.js   # Global error handler (4-arg middleware)
│
├── utils/                # Shared utility functions
│   └── utils.js          # extractNames() helper
│
├── docker/               # Docker build files
│   ├── Dockerfile        # Production multi-stage Docker build
│   └── Dockerfile.dev    # Development Docker build
│
└── node_modules/         # Installed dependencies (not committed)
```

## Directory Purposes

**`config/`:**
- Purpose: Infrastructure and connection setup
- Contains: Database pool instantiation
- Key files: `config/db.js` — exports a `pg.Pool` singleton used by all controllers

**`controllers/`:**
- Purpose: All business logic, SQL queries, and HTTP response construction
- Contains: One file per resource domain; each file exports named async handler functions
- Key files: `controllers/userController.js`

**`routes/`:**
- Purpose: Map HTTP routes to controller functions; no logic lives here
- Contains: Express Router instances, one file per resource
- Key files: `routes/userRoutes.js` — mounted at `/api/users` in `index.js`

**`middlewares/`:**
- Purpose: Reusable Express middleware applied globally or per-route
- Contains: Error handler; intended location for future auth, validation, or logging middleware
- Key files: `middlewares/errorHandler.js`

**`utils/`:**
- Purpose: Pure utility functions with no Express or database dependencies
- Contains: Generic helpers shared across controllers
- Key files: `utils/utils.js` — exports `extractNames(fullName)`

**`docker/`:**
- Purpose: Container build definitions for dev and production environments
- Contains: Multi-stage production Dockerfile and development Dockerfile
- Key files: `docker/Dockerfile`, `docker/Dockerfile.dev`

## Key File Locations

**Entry Points:**
- `index.js`: Express app bootstrap, HTTP server start

**Configuration:**
- `config/db.js`: PostgreSQL pool — import this in any controller that needs DB access
- `.env`: Environment variables (`APP_PORT`, `APP_HOST`, DB credentials)
- `package.json`: Scripts (`npm start`, `npm run dev`) and dependency declarations

**Core Logic:**
- `controllers/userController.js`: All user-related handlers
- `routes/userRoutes.js`: User API route definitions

**Infrastructure:**
- `docker/Dockerfile`: Production container build
- `docker/Dockerfile.dev`: Development container build
- `docker-compose.yml`: Service orchestration

**Testing:**
- No test files or test framework present

## Naming Conventions

**Files:**
- camelCase for all source files: `userController.js`, `userRoutes.js`, `errorHandler.js`
- Descriptive suffixes indicating layer role: `*Controller.js`, `*Routes.js`
- Config files use lower camelCase: `db.js`, `utils.js`

**Directories:**
- Lowercase plural nouns matching layer names: `controllers/`, `routes/`, `middlewares/`, `utils/`, `config/`

**Functions:**
- camelCase verb+noun: `getUsers`, `createUser`, `loginUser`, `signupUser`, `extractNames`

**Database:**
- Snake_case for all column and table names: `user_id`, `first_name`, `password_hash`, `created_at`
- All tables and procedures under the `event_karlo_backend` PostgreSQL schema

## Where to Add New Code

**New Resource (e.g., events, bookings):**
- Controller: `controllers/eventsController.js`
- Router: `routes/eventsRoutes.js`
- Mount in `index.js`: `app.use('/api/events', eventsRoutes)`

**New Middleware (e.g., auth token verification):**
- Implementation: `middlewares/authMiddleware.js`
- Apply per-route in the relevant router file, or globally in `index.js`

**New Utility Function:**
- Add to `utils/utils.js` if general-purpose, or create `utils/[domain]Utils.js` for domain-specific helpers

**New Config/Connection:**
- Add to `config/` — e.g., `config/redis.js` for a cache client

**Database Queries:**
- Add SQL directly inside the relevant controller function
- Use `pool.query()` with parameterized `$1, $2, ...` placeholders to prevent SQL injection
- Wrap multi-step operations in explicit `BEGIN` / `COMMIT` / `ROLLBACK` transactions

## Special Directories

**`node_modules/`:**
- Purpose: Installed npm packages
- Generated: Yes (by `npm install`)
- Committed: No (excluded via `.gitignore`)

**`.planning/`:**
- Purpose: GSD planning documents for architecture analysis and implementation plans
- Generated: Yes (by GSD tooling)
- Committed: Per project preference (not in `.gitignore`)

**`.git/`:**
- Purpose: Git version control metadata
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-03-07*
