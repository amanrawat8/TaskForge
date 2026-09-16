# Task & Engagement Management Tool

A small backend-focused Task & Engagement Management Tool for a professional services team, built as a technical assignment. A services team manages clients and engagements (recurring or one-time), each generating tasks that flow through a review workflow.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Node.js, TypeScript, Express 5 |
| Database | PostgreSQL (Neon), Prisma ORM 7 (`@prisma/adapter-pg` driver adapter) |
| Auth | JWT (stateless), bcrypt password hashing |
| Validation | Zod |
| Tests | Vitest + Supertest |
| Frontend | React (planned — see [Status](#status)) |

## Repository structure

```
task-management/
  backend/      # Express API, Prisma schema/migrations, tests, seed script
  frontend/     # React app (not yet implemented)
```

## Status

- **Backend: complete.** Auth, Users, Clients, Service Types + Task Templates, Engagements (creation + recurring generation), Tasks (workflow + assignment), Dashboard — all implemented, tested, and documented (see [`backend/docs/API.md`](backend/docs/API.md)).
- **Frontend: not yet implemented.**
- **Deployment: not yet live** — instructions below are for local setup.

See [`TECHNICAL_DESIGN.md`](TECHNICAL_DESIGN.md) for the full design write-up.

## Prerequisites

- Node.js 20+
- A PostgreSQL database — this project was built against [Neon](https://neon.tech) (serverless Postgres), using both a pooled and an unpooled connection string. Any Postgres 14+ instance works; if it doesn't distinguish pooled/unpooled, use the same URL for both env vars below.

## Setup

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
