# Security Club backend

Express API with a SQLite database for page data and role-based access.

## Run

```powershell
npm install
npm start
```

The API listens on `http://localhost:3001`.

The backend requires Node.js 22.13.0 or newer because it uses the built-in
`node:sqlite` module. Set `CORS_ORIGINS` to a comma-separated list of allowed
frontend origins when running outside local development.

Copy `.env.example` to `.env` and set the initial administrator email,
password, and name. The `.env` file is ignored by git. Run
`npm run bootstrap-admin` once to provision or reset the configured first
administrator in SQLite; do not rerun it after changing that account's password.

The frontend provides `/login` and `/register`. Public registration creates a
visitor account. Applicants submit the form at `/membership`; an administrator
reviews applications in the `/admin` page and approves each as Member or
Administrator. When the applicant already has an account under the same
college email, approval updates its role and preserves its password. Otherwise,
the review page displays a temporary password once. Share it directly with the
applicant; their first login requires them to choose a new password before
accessing protected pages. The temporary password itself is never stored or
written to the audit log.

## Roles

Unauthenticated visitors have public access. Registered accounts start as
`visitor`; membership approval assigns `member` or `admin`. Authentication uses
random server-side sessions stored in SQLite and an HTTP-only `sc_session`
cookie, so sessions can be revoked and role changes apply immediately. Protected
API actions always require a real session; development role-header overrides
are disabled.

In `/admin` under Core position assignments, **Delete account** permanently
removes the account and linked personal profile, applications, memberships,
payments, contacts, comments, sessions, and team profile. Shared site content is
kept. Administrators cannot delete their own account or the last active admin.

`DATABASE_PATH`, `PORT`, `CORS_ORIGINS`, and `SESSION_DAYS` are also configurable.

The API includes cookie authentication (`/api/auth/*`), public content and
contact endpoints, membership application/review/payment workflows, member
challenges and registrations, and event-head/admin event CRUD.

- `visitor`: Home, Events, Gallery, Contact
- `member`: visitor pages plus Dashboard, CTF, Leaderboard, Membership
- `core`: member pages plus Team and Flagships
- `admin`: all pages
