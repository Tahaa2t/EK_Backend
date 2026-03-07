# Coding Conventions

**Analysis Date:** 2026-03-07

## Naming Patterns

**Files:**
- Directories use camelCase: `controllers/`, `middlewares/`, `routes/`, `utils/`
- Files use camelCase suffixed by layer type: `userController.js`, `userRoutes.js`, `errorHandler.js`
- Config files use lowercase: `db.js`
- Entry point is `index.js`

**Functions:**
- Controller functions use camelCase, verb-prefixed: `getUsers`, `createUser`, `loginUser`, `signupUser`
- Utility functions use camelCase, verb-prefixed: `extractNames`
- Arrow functions used for controllers and middleware: `const getUsers = async (req, res) => { ... }`
- Named function declarations used for utilities: `function extractNames(fullName) { ... }`

**Variables:**
- camelCase for JS variables: `hashedPassword`, `passwordHash`, `userRoutes`
- snake_case for database field names and destructured DB columns: `user_id`, `first_name`, `last_name`, `created_at`, `updated_at`, `user_type`, `password_hash`
- ALL_CAPS for environment variable names: `APP_PORT`, `APP_HOST`

**Types:**
- No TypeScript types enforced at runtime; `tsconfig.json` is present but source files are plain `.js`
- TypeScript type packages installed (`@types/node`, `@types/pg`, `@types/ws`) for IDE support only

## Code Style

**Formatting:**
- No automated formatter (no `.prettierrc`, `.eslintrc`, or `biome.json` detected)
- Indentation: 2 spaces (observed throughout all source files)
- Trailing commas present in multi-line arrays/objects
- Semicolons: not used (omitted at end of statements — inconsistent; some lines have them, some do not)
- String quotes: double quotes for `require()` paths, single quotes elsewhere (mixed)

**Linting:**
- No linting tool configured
- No pre-commit hooks

## Import Organization

**Style:** CommonJS `require()` — note that `package.json` declares `"type": "module"` (ESM), but all source files use `require()`. This is a mismatch; the project effectively runs as CommonJS despite the package setting.

**Order (as observed in `index.js`):**
1. Third-party packages (`express`, `dotenv`, `cors`, `helmet`, `morgan`)
2. Local routes (`./routes/userRoutes`)
3. Local middlewares (`./middlewares/errorHandler`)

**Path Aliases:**
- None; all local imports use relative paths (`../config/db`, `../utils/utils`, `../controllers/userController`)

## Error Handling

**Patterns:**
- All async controller functions use `try/catch` blocks
- Errors are caught and a `500` status is returned with a generic JSON body: `{ message: "Server Error" }`
- Authentication errors use a slightly different message: `{ message: "Authentication Error" }`
- `signupUser` additionally includes `error: error.message` in the 500 response body — inconsistent with other controllers
- `console.error(error.message)` is called before every error response
- Database transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) are handled manually inside `try/catch`: `ROLLBACK` is issued in the `catch` block
- A global Express error handler middleware exists at `middlewares/errorHandler.js`, but controllers do not call `next(error)` — they handle errors inline and do not propagate to the global handler
- Input validation is minimal: only `loginUser` checks for a missing `email` field via `if (!email) { throw Error(...) }`
- `createUser` and `signupUser` perform no input validation before hitting the database

## Logging

**Framework:** `console` (native Node.js)

**Patterns:**
- `console.log()` used for server startup and debug output (e.g., `console.log(\`Hashing the password ${password}\`)` in `signupUser` — logs plaintext password)
- `console.error()` used to log caught error messages before sending responses
- HTTP request logging via `morgan('dev')` middleware registered in `index.js`
- Database connection success/failure logged via `.then()`/`.catch()` in `config/db.js`
- Emoji used in startup log messages: `✅`, `❌`

## Comments

**When to Comment:**
- Section headers above logical groups: `// Middleware`, `// Routes`, `// Start Server`
- Brief inline comments before SQL operations: `// add user in users table`, `// Start a transaction`
- Commented-out code left in source: `// router.get("/", getUsers);` in `routes/userRoutes.js`, `// const user_type = type;` in `controllers/userController.js`

**JSDoc/TSDoc:**
- Not used anywhere in the codebase

## Function Design

**Size:** Controllers are large (20–50 lines), combining validation, business logic, and DB access in a single function

**Parameters:** Controller functions always receive Express `(req, res)` pair; no `next` parameter passed to controllers

**Return Values:** Controllers end with `res.status(N).json(...)` — no explicit `return` statement before most responses, creating risk of multiple response headers being set

## Module Design

**Exports:**
- Named exports via `module.exports = { fn1, fn2 }` for controllers and utils
- Default single-value export via `module.exports = value` for middleware and DB pool

**Barrel Files:**
- Not used; each module is imported directly by its file path

---

*Convention analysis: 2026-03-07*
