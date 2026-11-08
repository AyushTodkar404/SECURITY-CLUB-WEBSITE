# Testing & Verification Protocol: Security Club Platform

## Comprehensive 5-Test Full-Stack Suite
```bash
node test_full_suite.mjs
```

### Coverage Scope (58 Automated Assertions)
1. **Full-Stack Syntax & TypeScript Compilation:** Asserts zero syntax errors in `server.js`, `db.js`, and executes `tsc --noEmit` on the React 19 frontend.
2. **Database Integrity & Manifests:** Verifies required row minimums for team profiles, events, flagships, challenges, and gallery photos.
3. **Asset File Integrity:** Validates disk presence of all referenced local profile images, banners, and gallery media.
4. **OWASP Security & CTF Cryptography:** Verifies scrypt password derivation, CSP/nosniff headers, and SHA-256 multi-tier flag validation.
5. **Administrator Role-Gating:** Proves that Visitors and Members receive `401 Unauthorized` and `403 Forbidden` on privileged endpoints, and that Administrators succeed with `200/201`.
