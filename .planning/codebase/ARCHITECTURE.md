# Architecture Specification: Security Club Full Stack Platform

## Architectural Topology
1. **Frontend Presentation (React 19 / Vite):** Single-page application serving public club showcases, member portals, interactive CTF challenge sandboxes with cryptographic flag checking, and administrative management workspaces.
2. **Backend API (Express 5):** REST API providing session authentication, role-based authorization (Visitor, Member, Core Team, Administrator), content CRUD, CTF challenge submission, and audit logs.
3. **Database Layer (LibSQL / SQLite):** Embedded relational persistence with automated schema migrations, foreign keys, and parameterized query execution.

## Role-Based Access Control (RBAC)
- **Visitor:** Read-only access to public club content (about, events, team, flagships, awareness, testimonials).
- **Member:** Authenticated access to profile, CTF participation, leaderboard scores, and membership applications.
- **Core Team:** Elevated operational view of club initiatives and event logistics.
- **Administrator:** Full administrative privileges (manage events, flagships, team profiles, challenges, gallery, awareness campaigns, and file uploads).
