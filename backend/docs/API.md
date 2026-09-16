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

## Engagements

Manager/Admin create engagements (which generate tasks from the service type's templates) and generate the next period for recurring ones.

### `POST /api/engagements`
Create an engagement. Tasks are generated automatically from the service type's task templates, inside one transaction.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Request body**
```json
{
  "clientId": "a6a20572-957b-4df2-9afb-061a8095e32b",
  "serviceTypeId": "2e70a506-9b27-45fd-81c5-b5cf38839c91",
  "periodStart": "2026-09-15"
}
```
| Field | Type | Rules |
|---|---|---|
| clientId | string | valid UUID, must reference an existing client |
| serviceTypeId | string | valid UUID, must reference an existing service type |
| periodStart | string | ISO date — **any** date within the desired period; the server normalizes it to the canonical `periodStart`/`periodEnd` for the service type's recurrence unit (e.g. any day in September → `2026-09-01`–`2026-09-30` for a monthly service; a single day for a one-time service) |

**Success response** `201`
```json
{
  "success": true,
  "engagement": {
    "id": "5b3a0004-...",
    "clientId": "a6a20572-...",
    "serviceTypeId": "2e70a506-...",
    "periodStart": "2026-09-01T00:00:00.000Z",
    "periodEnd": "2026-09-30T00:00:00.000Z",
    "status": "ACTIVE",
    "createdAt": "2026-09-12T18:55:39.476Z",
    "client": { "id": "...", "name": "Acme Corp", "createdAt": "..." },
    "serviceType": { "id": "...", "name": "Monthly GST Compliance", "isRecurring": true, "recurrenceUnit": "MONTHLY" },
    "tasks": [
      {
        "id": "cef7995c-...",
        "engagementId": "5b3a0004-...",
        "templateId": "694b1a6a-...",
        "title": "Collect invoices from client",
        "status": "NOT_STARTED",
        "assignedToId": null,
        "reviewedById": null,
        "dueDate": "2026-09-06T00:00:00.000Z",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

**Errors**
- `400` — validation failure (bad UUID, invalid date)
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`
- `404` — `{ "message": "Service type not found" }` or `{ "message": "Client not found" }`
- `409` — `{ "message": "An engagement for this client, service, and period already exists" }` — this fires even if a different day within the same normalized period is submitted

### `GET /api/engagements`
List engagements, optionally filtered by client, each with its client/service type/tasks.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Query params**
| Param | Type | Required |
|---|---|---|
| clientId | string | no — omit to list all |

**Success response** `200` — `{ "success": true, "engagements": [ ...same shape as create response... ] }`

**Errors**
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`

### `GET /api/engagements/:id`
Get one engagement with its client/service type/tasks.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Success response** `200` — same shape as one item from the list above.

**Errors**
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`
- `404` — `{ "message": "Engagement not found" }`

### `POST /api/engagements/:id/generate-next`
Generate the next period's engagement (and its tasks) for a recurring engagement. No request body.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Success response** `201` — same shape as the create response, for the newly generated next-period engagement.

**Errors**
- `400` — `{ "message": "Service type is not recurring — cannot generate a next period" }`
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`
- `404` — `{ "message": "Engagement not found" }`
- `409` — the next period's engagement already exists (e.g. calling this twice on the same source engagement)

---

## Tasks

Team Members view and update their own tasks; Manager/Admin can view all tasks, assign/reassign, set deadlines, and approve or request changes.

### `GET /api/tasks`
List tasks. **Team Members always see only their own tasks — this is enforced server-side and cannot be overridden by query params.** Admin/Manager see all tasks, optionally filtered.

**Auth required:** Yes — any role

**Query params** (ignored for `TEAM_MEMBER` role except `status`)
| Param | Type |
|---|---|
| status | one of the 6 task statuses |
| assignedToId | string (UUID) — Admin/Manager only |

**Success response** `200`
```json
{
  "success": true,
  "tasks": [
    {
      "id": "...",
      "engagementId": "...",
      "templateId": "...",
      "title": "Collect invoices from client",
      "status": "IN_PROGRESS",
      "assignedToId": "...",
      "reviewedById": null,
      "dueDate": "2026-09-06T00:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "...",
      "engagement": { "client": { "...": "..." }, "serviceType": { "...": "..." } },
      "assignedTo": { "id": "...", "name": "...", "email": "...", "role": "TEAM_MEMBER" },
      "reviewedBy": null
    }
  ]
}
```

**Errors**
- `401` — no/invalid token

### `GET /api/tasks/:id`
Get one task. Team Members get `403` if the task isn't assigned to them.

**Auth required:** Yes — any role

**Success response** `200` — same task shape as above, plus a nested `history` array (`TaskHistory` rows).

**Errors**
- `401` — no/invalid token
- `403` — `{ "message": "You can only view your own tasks" }` (Team Member, not the assignee)
- `404` — `{ "message": "Task not found" }`

### `PATCH /api/tasks/:id/status`
Move a task through the workflow. No role restriction at the route level — permission depends on the specific task and transition (enforced in the service layer).

**Auth required:** Yes — any role, but:
- Worker transitions (`NOT_STARTED→IN_PROGRESS`, `IN_PROGRESS→READY_FOR_REVIEW`, `IN_PROGRESS↔WAITING_FOR_CLIENT`, `CHANGES_REQUESTED→IN_PROGRESS`): the task's assignee, or Manager/Admin
- Review transitions (`READY_FOR_REVIEW→COMPLETED`, `READY_FOR_REVIEW→CHANGES_REQUESTED`): Manager/Admin only, and never the task's own assignee

**Request body**
```json
{ "status": "IN_PROGRESS", "note": "Starting this now" }
```
| Field | Type | Rules |
|---|---|---|
| status | string | one of `NOT_STARTED`, `IN_PROGRESS`, `READY_FOR_REVIEW`, `CHANGES_REQUESTED`, `WAITING_FOR_CLIENT`, `COMPLETED` |
| note | string | optional, stored on the `TaskHistory` row |

**Success response** `200` — `{ "success": true, "task": { ...updated task... } }`. A review transition also sets `reviewedById` to the actor's id.

**Errors**
- `400` — `{ "message": "Cannot transition from X to Y" }` (not a legal transition from the task's current status)
- `401` — no/invalid token
- `403` — `{ "message": "You can only update your own tasks" }`, `{ "message": "Only a manager can approve or request changes" }`, or `{ "message": "You cannot review your own work" }`
- `404` — `{ "message": "Task not found" }`

### `PATCH /api/tasks/:id`
Assign/reassign a task and/or set its due date.

**Auth required:** Yes — role `ADMIN` or `MANAGER`

**Request body** (at least one field required)
```json
{ "assignedToId": "e1a2...", "dueDate": "2026-09-20" }
```

**Success response** `200` — `{ "success": true, "task": { ...updated task... } }`

**Errors**
- `400` — neither `assignedToId` nor `dueDate` provided
- `401` — no/invalid token
- `403` — role is `TEAM_MEMBER`
- `404` — `{ "message": "Task not found" }` or `{ "message": "Assignee not found" }`

---

## Dashboard

### `GET /api/dashboard`
Five task counts, scoped to the caller: Team Members see only their own tasks' counts; Admin/Manager see counts across everyone.

**Auth required:** Yes — any role

**Success response** `200`
```json
{
  "success": true,
  "dashboard": {
    "openTasks": 12,
    "overdueTasks": 3,
    "dueTodayTasks": 1,
    "waitingForClientTasks": 2,
    "waitingForReviewTasks": 4
  }
}
```
| Field | Meaning |
|---|---|
| openTasks | status is not `COMPLETED` |
| overdueTasks | not completed, `dueDate` before today |
| dueTodayTasks | not completed, `dueDate` is today |
| waitingForClientTasks | status is `WAITING_FOR_CLIENT` |
| waitingForReviewTasks | status is `READY_FOR_REVIEW` |

**Errors**
- `401` — no/invalid token
