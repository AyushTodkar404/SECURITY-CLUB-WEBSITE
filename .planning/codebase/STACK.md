# Technology Stack: Security Club Full Stack Platform

## Frontend Client Architecture
- **Framework:** React 19
- **Language:** TypeScript 5.x
- **Build Engine & Bundler:** Vite
- **Routing:** React Router DOM (v7)
- **Animation & 3D:** GSAP (GreenSock Animation Platform) and Three.js
- **Styling:** Tailwind CSS / CSS Modules
- **Data Fetching:** Native `fetch` with SameSite cookie credentials

## Backend API & Server
- **Runtime:** Node.js (v18+)
- **Server Framework:** Express 5 (Native async route handling)
- **Database Engine:** LibSQL / SQLite (`libsql`) for local development, Turso for persistent edge deployment
- **Authentication & Security:** Salted `scrypt` password hashing, HTTP-only session cookies, CSRF protection, magic-byte image inspection
- **Email Delivery:** Nodemailer SMTP client
- **Deployment & Routing:** Vercel serverless function and static asset rewrites via `vercel.json`
