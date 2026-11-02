# Security Policy

## Reporting a Vulnerability

⚠️ **If you discover a security vulnerability, do NOT open an issue.**
Please email the maintainer directly.

## Security status

### 1. Exposed MongoDB Atlas credentials in Git history (CRITICAL)

**Status:** The exposed password was rotated, but the historical commit still
contains the old `backend/.env` contents. A coordinated history rewrite is still
required before treating the repository history as clean.

Do not run a history rewrite or force-push without agreement from repository
maintainers and collaborators. The operation must be coordinated because it
changes every affected commit and invalidates existing clones. When authorized,
use a reviewed `git filter-repo` procedure, rotate any still-valid secrets, and
notify all downstream clones before updating the remote.

**CWE-798:** Use of Hard-coded Credentials

### 2. Content Security Policy

**Status:** Implemented. `backend/src/app.ts` configures Helmet with an explicit
CSP and restrictive security headers. Review the directives whenever a new
frontend or third-party integration is introduced.

### 3. CSRF protection

**Status:** Implemented. State-changing API requests are protected by the
double-submit cookie middleware in `backend/src/middleware/csrfProtection.ts`.
The frontend obtains `/api/csrf-token` and sends the token in `x-csrf-token`.
Keep this protection enabled for cookie-authenticated requests.

## Security Best Practices

1. **Never commit `.env` files** — `.gitignore` excludes them
2. **Rotate secrets regularly** — JWT secret, API keys, database passwords
3. **Use strong passwords** — bcrypt with 12 rounds for user passwords
4. **Validate all input** — Zod schemas on all endpoints
5. **Scope all queries** — Always filter by `userId`
6. **Do not store secrets in browser storage** — API keys and bearer tokens must
   not be copied into IndexedDB, localStorage, cache storage, or service-worker
   queues
7. **Verify security changes with tests** — run the backend integration and
   middleware suites before deployment

## Verification commands

```bash
npm run lint --workspace=backend
npm test --workspace=backend
```

The Vercel project settings and the GitHub remote history cannot be verified
from this repository alone; confirm branch, root directory, environment
variables, and deployment logs in their respective services.
