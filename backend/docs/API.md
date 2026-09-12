# API Reference

Base URL (local dev): `http://localhost:8000`

## Conventions

- All request/response bodies are JSON.
- Protected routes require an `Authorization: Bearer <token>` header, obtained from `POST /api/auth/login`.
- Every response has a `success` boolean. Error responses are shaped as:
  ```json
  { "success": false, "message": "..." }
  ```
- Common error status codes across all routes:
  | Status | Meaning |
  |---|---|
  | 400 | Request body failed validation |
  | 401 | Missing/invalid/expired token, or bad login credentials |
  | 403 | Authenticated, but role not permitted for this action |
  | 409 | Conflict (e.g. duplicate unique field) |
  | 500 | Unhandled server error |

---

## Auth

### `POST /api/auth/login`
Authenticate and receive a JWT.

**Auth required:** No

**Request body**
```json
{
  "email": "aman@gmail.com",
  "password": "password123"
}
```
| Field | Type | Rules |
|---|---|---|
| email | string | valid email format |
| password | string | non-empty |

**Success response** `200`
```json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Aman",
    "email": "aman@gmail.com",
    "role": "ADMIN"
  }
}
```

**Errors**
- `400` — malformed email or empty password
- `401` — `{ "message": "Invalid credentials" }` (no matching user, or wrong password — same message for both, deliberately, to avoid leaking which emails are registered)

---

## Users

Admin manages users; Admin and Manager can list them (Managers need this to assign tasks).

### `POST /api/users`
Create a user.

**Auth required:** Yes — role `ADMIN` only

**Request body**
```json
{
  "name": "Manager One",
  "email": "manager1@test.com",
  "password": "password123",
  "role": "MANAGER"
}
```
| Field | Type | Rules |
|---|---|---|
| name | string | min 1 char |
| email | string | valid email format |
| password | string | min 8 chars |
| role | string | one of `ADMIN`, `MANAGER`, `TEAM_MEMBER` |

**Success response** `201`
```json
{
  "success": true,
  "user": {
    "id": "e1a2...",
    "name": "Manager One",
    "email": "manager1@test.com",
    "role": "MANAGER",
    "createdAt": "2026-09-12T10:00:00.000Z"
  }
}
```
Note: `passwordHash` is never included in any response — the service only ever selects `{ id, name, email, role, createdAt }`.

**Errors**
- `400` — validation failure (e.g. password too short)
- `401` — no/invalid token
- `403` — token valid but role isn't `ADMIN`
- `409` — `{ "message": "Email already in use" }`

### `GET /api/users`
List users, optionally filtered by role.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Query params**
| Param | Type | Required | Notes |
|---|---|---|---|
| role | string | no | one of `ADMIN`, `MANAGER`, `TEAM_MEMBER` — omit to list all |

Example: `GET /api/users?role=TEAM_MEMBER`

**Success response** `200`
```json
{
  "success": true,
  "users": [
    {
      "id": "e1a2...",
      "name": "Manager One",
      "email": "manager1@test.com",
      "role": "MANAGER",
      "createdAt": "2026-09-12T10:00:00.000Z"
    }
  ]
}
```

**Errors**
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER` (not permitted to list users)

---

## Clients

Admin manages clients; Admin and Manager can list them (Managers need this to create engagements).

### `POST /api/clients`
Create a client.

**Auth required:** Yes — role `ADMIN` only

**Request body**
```json
{ "name": "Acme Corp" }
```
| Field | Type | Rules |
|---|---|---|
| name | string | min 1 char |

**Success response** `201`
```json
{
  "success": true,
  "client": {
    "id": "c1b2...",
    "name": "Acme Corp",
    "createdAt": "2026-09-12T10:05:00.000Z"
  }
}
```

**Errors**
- `400` — empty name
- `401` — no/invalid token
- `403` — token valid but role isn't `ADMIN`

### `GET /api/clients`
List all clients.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Success response** `200`
```json
{
  "success": true,
  "clients": [
    { "id": "c1b2...", "name": "Acme Corp", "createdAt": "2026-09-12T10:05:00.000Z" }
  ]
}
```

**Errors**
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`

---

## Service Types & Task Templates

Admin defines service types and their task templates together in one request. Admin and Manager can browse them (Managers need this when creating an engagement, to see what tasks will be generated).

### `POST /api/service-types`
Create a service type along with its task templates.

**Auth required:** Yes — role `ADMIN` only

**Request body**
```json
{
  "name": "Monthly GST Compliance",
  "isRecurring": true,
  "recurrenceUnit": "MONTHLY",
  "taskTemplates": [
    { "title": "Collect invoices from client", "order": 1, "defaultDueOffsetDays": 5 },
    { "title": "Reconcile GST input/output", "order": 2, "defaultDueOffsetDays": 8 },
    { "title": "File GSTR return", "order": 3, "defaultDueOffsetDays": 10 }
  ]
}
```
| Field | Type | Rules |
|---|---|---|
| name | string | min 1 char, unique |
| isRecurring | boolean | required |
| recurrenceUnit | string | one of `MONTHLY`, `QUARTERLY`, `YEARLY` — **required if `isRecurring` is `true`, must be omitted if `false`** |
| taskTemplates | array | at least 1 item |
| taskTemplates[].title | string | min 1 char |
| taskTemplates[].order | integer | ≥ 1 |
| taskTemplates[].defaultDueOffsetDays | integer | ≥ 0, optional |

**Success response** `201`
```json
{
  "success": true,
  "serviceType": {
    "id": "f3c1...",
    "name": "Monthly GST Compliance",
    "isRecurring": true,
    "recurrenceUnit": "MONTHLY",
    "taskTemplates": [
      { "id": "t1...", "serviceTypeId": "f3c1...", "title": "Collect invoices from client", "order": 1, "defaultDueOffsetDays": 5 },
      { "id": "t2...", "serviceTypeId": "f3c1...", "title": "Reconcile GST input/output", "order": 2, "defaultDueOffsetDays": 8 },
      { "id": "t3...", "serviceTypeId": "f3c1...", "title": "File GSTR return", "order": 3, "defaultDueOffsetDays": 10 }
    ]
  }
}
```
The whole write (service type + all templates) happens as a single atomic Prisma nested-create.

**Errors**
- `400` — validation failure, including the cross-field rule (e.g. `isRecurring: false` with `recurrenceUnit` still set, or vice versa)
- `401` — no/invalid token
- `403` — token valid but role isn't `ADMIN`
- `409` — `{ "message": "Service type name already in use" }`

### `GET /api/service-types`
List all service types with their task templates.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Success response** `200`
```json
{
  "success": true,
  "serviceTypes": [
    {
      "id": "f3c1...",
      "name": "Monthly GST Compliance",
      "isRecurring": true,
      "recurrenceUnit": "MONTHLY",
      "taskTemplates": [ { "id": "t1...", "title": "Collect invoices from client", "order": 1, "defaultDueOffsetDays": 5 } ]
    }
  ]
}
```

**Errors**
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`

### `GET /api/service-types/:id`
Get one service type with its task templates.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Success response** `200` — same shape as one item from the list above.

**Errors**
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`
- `404` — `{ "message": "Service type not found" }`

---

## Not yet implemented

These are planned but don't exist yet — listed here so this doc stays a complete map of the API as it grows:
- Engagements (`/api/engagements`) — creation, task generation from templates, recurring generation
- Tasks (`/api/tasks`) — status workflow transitions, assignment, review/approval
- Dashboard (`/api/dashboard`)
