# Security Policy

## Reporting a Vulnerability

⚠️ **If you discover a security vulnerability, do NOT open an issue.**
Please email the maintainer directly.

## Known Security Issues (as of 2026-09-19)

### 1. Exposed MongoDB Atlas Credentials in Git History (CRITICAL)

**Status:** Credentials rotated. Git history needs cleanup.

Commit `8a45402` contained `backend/.env` with a live MongoDB Atlas connection string:
- Database user: `hyushinelliot_db_user`
- Password: `uhx1gArtsA4Ne17P` (ROTATED)
- Cluster: `cluster0.3fobfrm.mongodb.net`

The `.env` file was removed from tracking in commit `9e84d41`, but the credentials
remain in the git history.

**Action required:** The MongoDB Atlas password has been rotated. The git history
needs to be cleaned using `git filter-repo`:

```bash
# Run from repository root
pip install git-filter-repo
git filter-repo --path backend/.env --invert-paths --force
git push --force-with-lease origin main
```

**CVSS:** 9.1 (Critical) — CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N
**CWE-798:** Use of Hard-coded Credentials

### 2. CSP Disabled (CRITICAL)

Helmet is configured with `contentSecurityPolicy: false` in `app.ts`.
See CSP fix in the security hardening PR.

### 3. CSRF Protection Missing (CRITICAL)

The API uses httpOnly cookies with `SameSite=None` in production but lacks
CSRF token protection. See CSRF fix implementation.

## Security Best Practices

1. **Never commit `.env` files** — `.gitignore` excludes them
2. **Rotate secrets regularly** — JWT secret, API keys, database passwords
3. **Use strong passwords** — bcrypt with 12 rounds for user passwords
4. **Validate all input** — Zod schemas on all endpoints
5. **Scope all queries** — Always filter by `userId`
