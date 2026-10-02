# Security Club backend

Express API with a SQLite database for page data and role-based access.

## Run locally

```powershell
# In the backend directory, first copy .env.example to .env and configure it.
npm install
npm run dev
```

In a second terminal, run the frontend:

```powershell
cd ..\security_website
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). Vite
proxies `/api` requests to the backend at `http://localhost:3001`. The backend
can also be started without watch mode using `npm start`.

The backend requires Node.js 22.13.0 or newer because it uses the built-in
`node:sqlite` module. Set `CORS_ORIGINS` to a comma-separated list of allowed
frontend origins when running outside local development.

Copy `.env.example` to `.env` and set the initial administrator email,
password, and name. Leave the two Turso values blank to use local SQLite, or
set both to use Turso locally. The `.env` file is ignored by git. Run
`npm run bootstrap-admin` once to provision or reset the configured first
administrator in SQLite; do not rerun it after changing that account's password.

The public Contact form sends messages to `CONTACT_EMAIL` (defaults to
`securityclub@college.edu`) through Gmail SMTP. Configure `SMTP_USER` with the
club Gmail address and `SMTP_PASSWORD` with its Google App Password; a Google
App Password requires 2-Step Verification on that account. Set these values as
backend environment variables in the deployment platform as well as in local
`.env` files. Never commit the real password. Replies to a delivered message
are addressed to the name and email entered in the form.

The frontend provides `/login` and `/register`. Public registration creates a
visitor account. Applicants submit the form at `/membership`; an administrator
reviews applications in the `/admin` page and approves each as Member or
Administrator. When the applicant already has an account under the same
college email, approval updates its role and preserves its password. Otherwise,
the review page displays a temporary password once. Share it directly with the
applicant; their first login requires them to choose a new password before
accessing protected pages. The temporary password itself is never stored or
written to the audit log.

## Deploy to Vercel

The repository-root `vercel.json` routes `/api/*` to the Express backend and
all other paths to the Vite frontend. In Vercel project settings, set the
Framework Preset to **Services** so Vercel recognizes both configured services.
Use Node.js 22.x or newer for the backend.

Add these backend environment variables in Vercel for each environment you
deploy (Production, Preview, and Development as needed):

- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` for a persistent database; local
  SQLite storage is not persistent storage for deployed serverless apps.
- `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_EMAIL`, `SMTP_HOST`, `SMTP_PORT`,
  `SMTP_SECURE`, and `SMTP_FROM_NAME` for Contact form delivery.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` for the first administrator.
- `CORS_ORIGINS` for any separate frontend origins. Same-origin Vercel preview,
  production, and custom domains are accepted automatically.

To use Vercel's local service routing, run `vercel dev` from the repository
root after linking the project and configuring local environment variables. For
the simpler local setup, use the two-process instructions above.

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
