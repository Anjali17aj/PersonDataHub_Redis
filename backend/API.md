# PersonDataHub — API Documentation

REST API for managing people records. Data is persisted in **MySQL**; lookups by **id** and **email** use **Redis cache-aside**.

| | |
|---|---|
| **Base URL** | `http://localhost:8080` |
| **Content-Type** | `application/json` |
| **Auth** | None |
| **Version** | 1.0.0 |

---

## Quick reference

| Method | Endpoint | Description | Cached |
|--------|----------|-------------|--------|
| `GET` | `/api/persons` | List, filter, sort, paginate | No |
| `GET` | `/api/persons/{id}` | Get person by id | Yes |
| `GET` | `/api/persons/by-email?email=` | Get person by email | Yes |
| `POST` | `/api/persons` | Create person | — |
| `PUT` | `/api/persons/{id}` | Update person | — |
| `DELETE` | `/api/persons/{id}` | Delete person | — |

---

## Data models

### PersonRequest (create / update body)

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | Non-blank |
| `email` | string | Yes | Valid email, unique |
| `age` | integer | Yes | ≥ 0 |
| `address` | string | No | Optional |

Email is stored lowercase. Leading/trailing whitespace is trimmed.

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30,
  "address": "123 Main St"
}
```

### PersonResponse (single person)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Auto-generated primary key |
| `name` | string | Person name |
| `email` | string | Email (lowercase) |
| `age` | integer | Age |
| `address` | string | Address (nullable) |
| `createdOn` | string (ISO-8601 UTC) | Creation timestamp |
| `updatedOn` | string (ISO-8601 UTC) | Last update timestamp |
| `fromCache` | boolean | `true` if served from Redis |

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30,
  "address": "123 Main St",
  "createdOn": "2026-05-30T11:15:46.660516Z",
  "updatedOn": "2026-05-30T11:15:46.660516Z",
  "fromCache": false
}
```

### PersonPageResponse (paginated list)

| Field | Type | Description |
|-------|------|-------------|
| `content` | array | List of `PersonResponse` objects |
| `page` | integer | Current page index (0-based) |
| `size` | integer | Page size |
| `totalElements` | long | Total matching records |
| `totalPages` | integer | Total pages |
| `first` | boolean | Is first page |
| `last` | boolean | Is last page |

---

## Endpoints

### 1. List persons

Search, filter, sort, and paginate. Always queries **MySQL** (not cached).

```
GET /api/persons
```

#### Query parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | `0` | Page index (0-based) |
| `size` | integer | `20` | Items per page (max `100`) |
| `sort` | string | `name,asc` | Sort field and direction, e.g. `age,desc` |
| `name` | string | — | Case-insensitive substring match |
| `email` | string | — | Case-insensitive substring match |
| `minAge` | integer | — | Minimum age (inclusive) |
| `maxAge` | integer | — | Maximum age (inclusive) |
| `address` | string | — | Case-insensitive substring match |

#### Example requests

```http
GET /api/persons?page=0&size=10
GET /api/persons?sort=name,asc
GET /api/persons?minAge=25&maxAge=40
GET /api/persons?name=Jane&sort=age,desc
GET /api/persons?email=yopmail.com&page=0&size=20
```

#### Example response — `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@yopmail.com",
      "age": 30,
      "address": "123 Main St",
      "createdOn": "2026-05-30T11:15:46.660516Z",
      "updatedOn": "2026-05-30T11:15:46.660516Z",
      "fromCache": false
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "first": true,
  "last": true
}
```

---

### 2. Get person by id

Uses **Redis cache-aside**. On cache miss, loads from MySQL and warms the cache.

```
GET /api/persons/{id}
```

#### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Person id |

#### Example request

```http
GET /api/persons/1
```

#### Example response — `200 OK`

```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@yopmail.com",
  "age": 30,
  "address": "123 Main St",
  "createdOn": "2026-05-30T11:15:46.660516Z",
  "updatedOn": "2026-05-30T11:15:46.660516Z",
  "fromCache": true
}
```

#### Cache behavior

| Call | `fromCache` | Source |
|------|-------------|--------|
| First request for an id | `false` | MySQL → cached in Redis |
| Subsequent requests | `true` | Redis |

#### Example response — `404 Not Found`

```json
{
  "timestamp": "2026-05-30T12:00:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Person not found with id: 99",
  "path": "/api/persons/99",
  "validationErrors": null
}
```

---

### 3. Get person by email

Uses **Redis cache-aside**. Email is normalized to lowercase.

```
GET /api/persons/by-email?email={email}
```

#### Query parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Valid email address |

#### Example request

```http
GET /api/persons/by-email?email=jane@yopmail.com
```

#### Example response — `200 OK`

Same shape as [Get person by id](#2-get-person-by-id).

#### Example response — `400 Bad Request`

Invalid or missing email:

```json
{
  "timestamp": "2026-05-30T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/persons/by-email",
  "validationErrors": {
    "email": "Email must be valid"
  }
}
```

---

### 4. Create person

```
POST /api/persons
```

#### Request headers

```http
Content-Type: application/json
```

#### Request body

`PersonRequest` — see [Data models](#personrequest-create--update-body).

#### Example request

```http
POST /api/persons
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30,
  "address": "123 Main St"
}
```

#### Example response — `201 Created`

Returns the created person with `fromCache: false`. Cache keys for id and email are written after save.

#### Example response — `400 Bad Request`

```json
{
  "timestamp": "2026-05-30T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/persons",
  "validationErrors": {
    "name": "Name is required",
    "email": "Email must be valid"
  }
}
```

#### Example response — `409 Conflict`

Duplicate email:

```json
{
  "timestamp": "2026-05-30T12:00:00Z",
  "status": 409,
  "error": "Conflict",
  "message": "A person with email 'jane@example.com' already exists",
  "path": "/api/persons",
  "validationErrors": null
}
```

---

### 5. Update person

Replaces all fields. Evicts old cache keys and writes new ones.

```
PUT /api/persons/{id}
```

#### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Person id |

#### Request body

Same as [Create person](#4-create-person) — `PersonRequest`.

#### Example request

```http
PUT /api/persons/1
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "age": 31,
  "address": "456 Oak Ave"
}
```

#### Example response — `200 OK`

Updated `PersonResponse` with `fromCache: false`.

#### Errors

| Status | When |
|--------|------|
| `400` | Validation failed |
| `404` | Person not found |
| `409` | Email already used by another person |

---

### 6. Delete person

```
DELETE /api/persons/{id}
```

#### Path parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Person id |

#### Example request

```http
DELETE /api/persons/1
```

#### Example response — `204 No Content`

Empty body.

#### Example response — `404 Not Found`

Person does not exist.

---

## Error responses

All errors return a consistent JSON body:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string (ISO-8601 UTC) | When the error occurred |
| `status` | integer | HTTP status code |
| `error` | string | HTTP reason phrase |
| `message` | string | Human-readable message |
| `path` | string | Request path |
| `validationErrors` | object \| null | Field-level errors (400 only) |

### HTTP status codes

| Status | Meaning |
|--------|---------|
| `200` | Success (GET, PUT) |
| `201` | Created (POST) |
| `204` | Deleted (DELETE) |
| `400` | Validation error or bad request |
| `404` | Person not found |
| `409` | Duplicate email |
| `500` | Unexpected server error |

---

## Caching (Redis)

### Cache-aside flow

```
GET /api/persons/{id}  or  GET /api/persons/by-email

    ┌─────────┐
    │ Request │
    └────┬────┘
         │
         ▼
    ┌─────────┐     HIT      ┌───────────────┐
    │  Redis  │─────────────►│ Return cached │
    └────┬────┘              │ fromCache:true│
         │ MISS              └───────────────┘
         ▼
    ┌─────────┐              ┌───────────────┐
    │  MySQL  │─────────────►│ Write Redis   │
    └─────────┘              │ Return result │
                             │fromCache:false│
                             └───────────────┘
```

### Redis keys

| Key pattern | Purpose |
|-------------|---------|
| `person:id:{id}` | Lookup by id |
| `person:email:{email}` | Lookup by email |

### Cache invalidation

On **create**, **update**, or **delete**, matching cache keys are evicted. TTL defaults to **24 hours** (`app.cache.ttl-hours` in `application.properties`).

### What is not cached

- `GET /api/persons` (list/search) always hits MySQL.

---

## CORS

Allowed origins (for the frontend):

- `http://localhost:5500`
- `http://127.0.0.1:5500`

Configured via `app.cors.allowed-origins` in `application.properties`.

---

## Postman collection (manual setup)

Use the **Postman desktop app** or **Desktop Agent** for `localhost` requests.

| # | Method | URL | Body |
|---|--------|-----|------|
| 1 | `GET` | `{{baseUrl}}/api/persons?page=0&size=20` | — |
| 2 | `GET` | `{{baseUrl}}/api/persons/1` | — |
| 3 | `GET` | `{{baseUrl}}/api/persons/by-email?email=jane@yopmail.com` | — |
| 4 | `POST` | `{{baseUrl}}/api/persons` | `PersonRequest` JSON |
| 5 | `PUT` | `{{baseUrl}}/api/persons/1` | `PersonRequest` JSON |
| 6 | `DELETE` | `{{baseUrl}}/api/persons/1` | — |

Set collection variable: `baseUrl` = `http://localhost:8080`

---

## Example test flow

1. **POST** — create a person → expect `201`
2. **GET** `/api/persons` — confirm in list → expect `200`
3. **GET** `/api/persons/1` — first call → `fromCache: false`
4. **GET** `/api/persons/1` — second call → `fromCache: true`
5. **GET** `/api/persons/by-email?email=...` — same cache test
6. **PUT** `/api/persons/1` — update → expect `200`
7. **GET** with filters — e.g. `?minAge=25&name=Jane`
8. **DELETE** `/api/persons/1` → expect `204`
9. **GET** `/api/persons/1` → expect `404`
