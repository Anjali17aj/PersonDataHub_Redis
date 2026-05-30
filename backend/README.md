# PersonDataHub — Backend API

The server-side layer of PersonDataHub: a **Spring Boot 3.3** REST API that persists person records in **MySQL** and accelerates single-record lookups with a **Redis cache-aside** layer.

| | |
|---|---|
| **Artifact** | `com.persondatahub.peopledirectory:people-directory-api:1.0.0` |
| **Java** | 17 |
| **Spring Boot** | 3.3.1 |
| **Default port** | 8080 |

---

## Table of contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Running the server](#running-the-server)
- [API reference](#api-reference)
- [Caching strategy](#caching-strategy)
- [Error handling](#error-handling)
- [Database schema](#database-schema)
- [Logging](#logging)
- [Related documentation](#related-documentation)

---

## Overview

The backend exposes a JSON REST API under `/api/persons` for full CRUD operations on person records. It enforces validation rules, handles duplicate emails with `409 Conflict`, and implements **cache-aside** reads for lookups by **id** and **email**.

**MySQL** is the source of truth — all writes go to the database and Redis is updated or invalidated accordingly. The list endpoint always queries MySQL directly and is never cached.

---

## Screenshots

The React frontend consumes this API. Below are views of the UI powered by these endpoints:

### Directory — `GET /api/persons`

[![Directory view](https://drive.google.com/uc?export=view&id=1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5)](https://drive.google.com/file/d/1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5/view?usp=sharing)

[View full size →](https://drive.google.com/file/d/1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5/view?usp=sharing)

### Email lookup — `GET /api/persons/by-email` (Redis cache hit)

The **Redis** badge appears when the API returns `"fromCache": true` — the record was served from Redis without a MySQL query.

[![Email lookup with Redis badge](https://drive.google.com/uc?export=view&id=1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw)](https://drive.google.com/file/d/1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw/view?usp=sharing)

[View full size →](https://drive.google.com/file/d/1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw/view?usp=sharing)

---

## Technology stack

| Layer | Technology |
|-------|------------|
| **Web** | Spring Web MVC |
| **Persistence** | Spring Data JPA, Hibernate |
| **Database** | MySQL 8+ |
| **Cache** | Spring Data Redis, `RedisTemplate` |
| **Validation** | Jakarta Bean Validation |
| **Serialization** | Jackson (JSON) |
| **Build** | Maven |

---

## Architecture

```
HTTP Request
     │
     ▼
PersonController        ← REST endpoints, input validation
     │
     ▼
PersonService           ← Business logic, cache-aside orchestration
     │
     ├──► PersonRepository  → MySQL (JPA)
     │
     └──► RedisTemplate     → Redis (JSON-serialized Person objects)
```

**Cache-aside read flow:**

```
1. GET /api/persons/by-email?email=x
2. Check Redis: person:email:x
3. HIT  → return PersonResponse(fromCache=true)
4. MISS → query MySQL → write to Redis (id + email keys) → return(fromCache=false)
```

**Write flow (create / update / delete):**

```
1. Mutate MySQL
2. Evict stale Redis keys
3. On create/update: write fresh copy to Redis
```

---

## Project structure

```
backend/
├── pom.xml
├── README.md
└── src/main/
    ├── java/com/persondatahub/peopledirectory/
    │   ├── PersonDataHubApplication.java    # Entry point
    │   ├── config/
    │   │   ├── RedisConfig.java             # RedisTemplate + JSON serializer
    │   │   └── WebConfig.java               # CORS configuration
    │   ├── controller/
    │   │   └── PersonController.java        # REST endpoints
    │   ├── dto/
    │   │   ├── PersonRequest.java           # Create/update body
    │   │   ├── PersonResponse.java          # Single record response
    │   │   └── PersonPageResponse.java      # Paginated list response
    │   ├── exception/
    │   │   ├── ApiException.java            # Typed HTTP exceptions
    │   │   └── GlobalExceptionHandler.java  # Consistent error JSON
    │   ├── model/
    │   │   └── Person.java                  # JPA entity
    │   ├── repository/
    │   │   └── PersonRepository.java        # JPA + custom search query
    │   └── service/
    │       └── PersonService.java           # CRUD + cache-aside logic
    └── resources/
        └── application.properties           # DB, Redis, CORS, cache TTL
```

---

## Prerequisites

| Requirement | Default |
|-------------|---------|
| JDK 17+ | — |
| Maven 3.8+ | — |
| MySQL 8+ | `localhost:3306` |
| Redis 6+ | `localhost:6379` |

---

## Configuration

Edit `src/main/resources/application.properties`:

| Property | Description | Default |
|----------|-------------|---------|
| `server.port` | HTTP port | `8080` |
| `spring.datasource.url` | JDBC URL | `person_data_hub` database, auto-create enabled |
| `spring.datasource.username` | MySQL user | `root` |
| `spring.datasource.password` | MySQL password | *(set locally)* |
| `spring.jpa.hibernate.ddl-auto` | Schema strategy | `update` |
| `spring.data.redis.host` | Redis host | `localhost` |
| `spring.data.redis.port` | Redis port | `6379` |
| `app.cache.ttl-hours` | Redis entry TTL | `24` |
| `app.cors.allowed-origins` | Allowed frontend origins | `localhost:5173`, `127.0.0.1:5173` |

> **Security:** Never commit real database passwords. Keep credentials in local `application.properties` only.

---

## Running the server

```bash
cd backend
mvn clean spring-boot:run
```

**Verify the API is up:**

```bash
curl "http://localhost:8080/api/persons?page=0&size=10"
```

**Run tests:**

```bash
mvn test
```

---

## API reference

Base URL: `http://localhost:8080`

All responses use `Content-Type: application/json` unless noted.

---

### List, filter, sort, and paginate

```
GET /api/persons
```

Always queries **MySQL** — not cached.

| Query param | Type | Default | Description |
|-------------|------|---------|-------------|
| `page` | int | `0` | Zero-based page index |
| `size` | int | `20` | Page size (min 1, max 100) |
| `sort` | string | `name,asc` | Sort field and direction |
| `name` | string | — | Case-insensitive substring match |
| `email` | string | — | Case-insensitive substring match |
| `minAge` | int | — | Minimum age (inclusive) |
| `maxAge` | int | — | Maximum age (inclusive) |
| `address` | string | — | Case-insensitive substring match |

**Example:**

```bash
curl "http://localhost:8080/api/persons?page=0&size=10&sort=name,asc&minAge=18"
```

**Response (`200 OK`):**

```json
{
  "content": [
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "age": 30,
      "address": "123 Main St",
      "createdOn": "2026-05-30T12:00:00Z",
      "updatedOn": "2026-05-30T12:00:00Z",
      "fromCache": false
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 42,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

### Get by id (cache-aside)

```
GET /api/persons/{id}
```

| Response | Condition |
|----------|-----------|
| `200 OK` | Person found — `fromCache: true` if served from Redis |
| `404 Not Found` | No person with that id |

---

### Get by email (cache-aside)

```
GET /api/persons/by-email?email=jane@example.com
```

Email is validated, trimmed, and normalized to lowercase.

| Response | Condition |
|----------|-----------|
| `200 OK` | Person found — `fromCache: true` if served from Redis |
| `400 Bad Request` | Missing or invalid email |
| `404 Not Found` | No person with that email |

---

### Create

```
POST /api/persons
Content-Type: application/json
```

**Request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30,
  "address": "123 Main St"
}
```

| Field | Validation |
|-------|------------|
| `name` | Required, non-blank |
| `email` | Required, valid format, unique |
| `age` | Required, integer ≥ 0 |
| `address` | Optional |

| Response | Condition |
|----------|-----------|
| `201 Created` | Person saved to MySQL and cached in Redis |
| `400 Bad Request` | Validation failed |
| `409 Conflict` | Email already exists |

---

### Update

```
PUT /api/persons/{id}
```

Same request body and validation as create. Evicts old cache keys, writes updated record to MySQL and Redis.

| Response | Condition |
|----------|-----------|
| `200 OK` | Updated successfully |
| `404 Not Found` | Person not found |
| `409 Conflict` | Email taken by another person |

---

### Delete

```
DELETE /api/persons/{id}
```

| Response | Condition |
|----------|-----------|
| `204 No Content` | Deleted from MySQL; cache keys evicted |
| `404 Not Found` | Person not found |

---

## Caching strategy

PersonDataHub uses the **cache-aside** pattern:

| Redis key pattern | Purpose |
|-------------------|---------|
| `person:id:{id}` | Lookup by primary key |
| `person:email:{email}` | Lookup by email (lowercase) |

| Event | Cache behavior |
|-------|----------------|
| **Read by id/email** | Check Redis → on miss, load MySQL → write both keys |
| **Create** | Save to MySQL → write both keys |
| **Update** | Evict old keys → save MySQL → write new keys |
| **Delete** | Evict keys → delete from MySQL |
| **List/search** | Always MySQL — never cached |

Default TTL: **24 hours** (`app.cache.ttl-hours`). Entries expire automatically; the next lookup repopulates the cache from MySQL.

---

## Error handling

All errors return a consistent JSON body:

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

| HTTP status | When |
|-------------|------|
| `400` | Validation failed — `validationErrors` map populated |
| `404` | Person not found |
| `409` | Duplicate email on create or update |
| `500` | Unexpected server error |

---

## Database schema

Hibernate manages the `persons` table with `ddl-auto=update`:

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INT | Primary key, auto-increment |
| `name` | VARCHAR | NOT NULL |
| `email` | VARCHAR | NOT NULL, UNIQUE |
| `age` | INT | NOT NULL |
| `address` | VARCHAR | Nullable |
| `created_on` | TIMESTAMP | Auto-set on create |
| `updated_on` | TIMESTAMP | Auto-updated on change |

Restarts do **not** wipe existing data. For production, use Flyway or Liquibase with `ddl-auto=validate`.

---

## Logging

| Level | What is logged |
|-------|----------------|
| `INFO` | Create, update, delete operations |
| `DEBUG` | Cache hits/misses, list queries |

Configure in `application.properties`:

```properties
logging.level.com.persondatahub.peopledirectory=INFO
```

---

## Related documentation

| Document | Description |
|----------|-------------|
| [../README.md](../README.md) | Full-stack overview, architecture, quick start |
| [../frontend/README.md](../frontend/README.md) | React UI, components, dev setup |
