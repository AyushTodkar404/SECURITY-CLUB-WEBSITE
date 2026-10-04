# Security Club Website

The official website and member platform for the Security Club. The project
combines a React/Vite frontend with an Express API, role-based member access,
event and gallery content, membership applications, CTF participation, a
leaderboard, and an administrator workspace.

## Features

- Public pages for the club, events, flagships, team, gallery, leaderboard, and contact
- Member registration, login, profiles, dashboard, and membership applications
- Role-based access for visitors, members, core team members, and administrators
- CTF challenge registration and leaderboard workflows
- Admin management for applications, members, content, events, and core positions
- Contact form delivery through SMTP
- SQLite for local development and Turso/libSQL for persistent production storage
- HTTP-only cookie sessions, password hashing, CSRF-token support, and audit logging

## Tech stack

- **Frontend:** React 19, TypeScript, React Router, Vite, GSAP, and Three.js
- **Backend:** Node.js, Express 5, SQLite/libSQL, and Nodemailer
- **Deployment:** Vercel with frontend and API routing configured in `vercel.json`

## Repository structure

```text
.
├── backend/                 # Express API, database, authentication, and mail
│   ├── src/
│   ├── data/                # Local SQLite database files
│   └── .env.example
├── security_website/        # React/Vite frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── documents/               # Club letters, posters, and supporting assets
├── data/                    # Project data files
├── vercel.json              # Vercel routing configuration
└── README.md
```

## Requirements

- Node.js **22.13.0 or newer**
- npm
- A configured SMTP account for contact-form email delivery
- Turso credentials for a persistent Vercel deployment

Check your Node.js version:

```powershell
node --version
```

## Local development

### 1. Configure the backend

Open a terminal in `backend/`, install dependencies, and create the local
environment file:

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Edit `.env` and set at least:

```env
ADMIN_EMAIL=admin@example.edu
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_NAME=Club Administrator
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_PATH=./data/security-club.sqlite
```

For the contact form, configure `SMTP_USER`, `SMTP_PASSWORD`, and the other
SMTP variables in `.env`. When using Gmail, `SMTP_PASSWORD` must be a Google
App Password, not the account's normal password.

The backend uses local SQLite when `TURSO_DATABASE_URL` and
`TURSO_AUTH_TOKEN` are empty. Provision the initial administrator once:

```powershell
npm run bootstrap-admin
```

Start the API in development mode:

```powershell
npm run dev
```

The API runs at `http://localhost:3001`.

### 2. Start the frontend

In a second terminal, install dependencies and start Vite:

```powershell
cd security_website
npm install
npm run dev
```

Open the URL printed by Vite, normally
`http://localhost:5173`. During development, Vite proxies `/api` requests to
the backend at `http://localhost:3001`.

## Available scripts

### Frontend (`security_website/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

### Backend (`backend/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with file watching |
| `npm start` | Start the API without file watching |
| `npm run bootstrap-admin` | Create or reset the configured initial administrator |

## Authentication and roles

Newly registered accounts begin as `visitor` accounts. Membership applications
are reviewed by an administrator. An approved application can receive the
`member` or `admin` role, while core team permissions are assigned through
positions.

| Role | Access |
| --- | --- |
| Visitor | Public pages, events, gallery, and contact |
| Member | Visitor access plus dashboard, CTF, leaderboard, profile, and membership |
| Core | Member access plus core team workspaces and assigned position pages |
| Admin | Full application, member, content, event, and permission management |

Sessions use a random server-side token stored as a hash and sent through the
HTTP-only `sc_session` cookie. Never commit `.env` files, SMTP passwords,
administrator passwords, Turso tokens, or real user data.

## Production deployment on Vercel

The repository-root `vercel.json` routes `/api/*` requests to the Express
backend and all other routes to the frontend. In the Vercel project settings:

1. Select the **Services** framework preset.
2. Use Node.js 22.x or newer.
3. Configure the environment variables below for every environment you deploy.
4. Use Turso/libSQL for production persistence; local SQLite is not persistent
   storage for serverless deployments.

Required or commonly used variables:

| Variable | Purpose |
| --- | --- |
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso authentication token |
| `ADMIN_EMAIL` | Initial administrator email |
| `ADMIN_PASSWORD` | Initial administrator password |
| `ADMIN_NAME` | Initial administrator display name |
| `CONTACT_EMAIL` | Destination for contact-form messages |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | Whether SMTP uses a secure connection |
| `SMTP_USER` | SMTP account username |
| `SMTP_PASSWORD` | SMTP account password or app password |
| `SMTP_FROM_NAME` | Sender name for contact emails |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |
| `SESSION_DAYS` | Session lifetime in days |

For local Vercel service routing, link the project and run:

```powershell
vercel dev
```

## Validation before submitting changes

Run the frontend checks from `security_website/`:

```powershell
npm run lint
npm run build
```

For backend changes, start the API with a test `.env` configuration and
exercise authentication, contact, membership, and any affected admin workflow.

## Contributing

1. Create a focused branch for your change.
2. Keep secrets and local database files out of commits.
3. Follow the existing TypeScript and JavaScript patterns.
4. Run linting and a production build before opening a pull request.
5. Describe user-facing changes and any new environment variables in the pull request.

## License

This project is maintained for the Security Club website. Add the project's
approved license here before distributing the source outside the organization.
