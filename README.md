# Task & Engagement Management Tool

A small Task & Engagement Management Tool for a professional services team. A services team manages clients and engagements (recurring or one-time), each generating tasks that flow through a review workflow.

## Live application

- **Frontend**: https://task-forge-puce.vercel.app
- **Backend API**: https://taskforge-pm9p.onrender.com/api (health check: `/api/health`)

Demo credentials are in the [Demo credentials](#demo-credentials) section below.

> Note: the API is hosted on Render's free tier, which spins down after inactivity — the first request after a period of idleness can take 30–60 seconds to respond while it wakes up.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, TypeScript, Express 5 |
| Database | PostgreSQL (Neon), Prisma ORM 7 (`@prisma/adapter-pg` driver adapter) |
| Auth | JWT (stateless), bcrypt password hashing |
| Validation | Zod (both backend and frontend forms) |
| Tests | Vitest + Supertest |
| Frontend | React 19, Vite, TanStack Query, React Router, React Hook Form, shadcn/ui + Tailwind |
| Deployment | Backend → Render, Frontend → Vercel, Database → Neon |

## Repository structure

```
task-management/
  backend/      # Express API, Prisma schema/migrations, tests, seed script
  frontend/     # React app (Vite + TanStack Query + shadcn/ui)
```

## Status

Both backend and frontend are complete and deployed:
- **Backend**: Auth, Users, Clients, Service Types + Task Templates, Engagements (creation + recurring generation), Tasks (workflow + assignment), Dashboard — implemented, tested, and documented (see [`backend/docs/API.md`](backend/docs/API.md)).
- **Frontend**: role-aware routing (Admin/Manager-only pages guarded client-side, backend is still the authority), dashboard, task list/detail with workflow actions, engagement + service type management, user management.

See [`TECHNICAL_DESIGN.md`](TECHNICAL_DESIGN.md) for the full design write-up.

## Prerequisites

- Node.js 20+
- A PostgreSQL database — this project was built against [Neon](https://neon.tech) (serverless Postgres), using both a pooled and an unpooled connection string. Any Postgres 14+ instance works; if it doesn't distinguish pooled/unpooled, use the same URL for both env vars below.

## Backend setup

```bash
cd backend
npm install
```

Copy the example env file and fill in real values:
```bash
cp .env.example .env
```
| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on (default `8000`) |
| `DATABASE_URL` | Pooled connection string — used by the running app |
| `DATABASE_URL_UNPOOLED` | Direct (non-pooled) connection string — used by Prisma CLI/migrations, since pooled connections can break `prisma migrate`'s advisory locks |
| `JWT_SECRET` | Secret used to sign/verify auth tokens |

Apply the database schema:
```bash
npx prisma generate
npx prisma migrate deploy
```

Seed demo data (5 clients, 2 managers, 4 team members, 1 admin, 3 service types, 25 tasks):
```bash
npx prisma db seed
```

Start the API:
```bash
npm run dev
```
The API is now running at `http://localhost:8000` (or whatever `PORT` you set). Confirm with:
```bash
curl http://localhost:8000/api/health
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API, including `/api` (e.g. `http://localhost:8000/api`, or the deployed Render URL) |

```bash
npm run dev
```
The frontend runs at `http://localhost:5173` by default and expects the backend to already be running (see [Backend setup](#backend-setup)) and reachable at `VITE_API_URL`.

## Demo credentials

All seeded users share the password `password123`.

| Role | Email |
|---|---|
| Admin | `admin@taskmgmt.test` |
| Manager | `manager1@taskmgmt.test` |
| Manager | `manager2@taskmgmt.test` |
| Team Member | `member1@taskmgmt.test` |
| Team Member | `member2@taskmgmt.test` |
| Team Member | `member3@taskmgmt.test` |
| Team Member | `member4@taskmgmt.test` |

Log in via `POST /api/auth/login` with `{ "email": "...", "password": "password123" }` to get a JWT, then send it as `Authorization: Bearer <token>` on subsequent requests. Full endpoint reference: [`backend/docs/API.md`](backend/docs/API.md).

## Running tests

```bash
cd backend
npm test
```
Runs the Vitest suite (6 tests) covering unauthorized task updates, invalid workflow transitions, manager approval, self-approval blocking, and duplicate engagement prevention. Tests run against the same database configured in `.env`, using uniquely-named records that are cleaned up after each test.

## Scripts (`backend/package.json`)

| Script | Purpose |
|---|---|
| `npm run dev` | Start the API with hot reload (`tsx watch src/server.ts`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/server.js`) |
| `npm run typecheck` | Type-check without emitting |
| `npm run generate` | Regenerate the Prisma client after a schema change |
| `npm test` | Run the automated test suite |

## Deployment

**Backend (Render)** — Web Service, root directory `backend`:
| Setting | Value |
|---|---|
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npx prisma migrate deploy && npm start` |
| Env vars | `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `JWT_SECRET` (Render injects its own `PORT`, left unset) |

Running `prisma migrate deploy` in the start command (rather than only at build time) means the schema is brought up to date on every deploy — safe, since re-applying already-applied migrations is a no-op.

**Frontend (Vercel)** — root directory `frontend`:
| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Env vars | `VITE_API_URL` = `https://taskforge-pm9p.onrender.com/api` |

`frontend/vercel.json` adds a catch-all rewrite (`/(.*) → /index.html`) so that direct navigation or a page refresh on a client-side route (e.g. `/login`, `/dashboard`) is served `index.html` and handled by React Router, instead of returning a raw `404` from Vercel's static file server.
