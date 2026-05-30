# PersonDataHub — Backend API

Spring Boot REST API for the people directory: **MySQL** persistence and **Redis** cache-aside.

| | |
|---|---|
| **Artifact** | `com.persondatahub.peopledirectory:people-directory-api:1.0.0` |
| **Java** | 17 |
| **Spring Boot** | 3.3.1 |
| **Port** | 8080 |

---

## Stack

| Layer | Technology |
|-------|------------|
| Web | Spring Web MVC |
| Persistence | Spring Data JPA, Hibernate, MySQL |
| Cache | Spring Data Redis, `RedisTemplate` |
| Validation | Jakarta Bean Validation |

---

## Project structure

```
backend/
├── pom.xml
├── README.md
└── src/main/java/com/persondatahub/peopledirectory/
    ├── PersonDataHubApplication.java
    ├── config/
    │   ├── RedisConfig.java
    │   └── WebConfig.java
    ├── controller/PersonController.java
    ├── dto/
    │   ├── PersonRequest.java
    │   ├── PersonResponse.java
    │   └── PersonPageResponse.java
    ├── exception/
    │   ├── ApiException.java
    │   └── GlobalExceptionHandler.java
    ├── model/Person.java
    ├── repository/PersonRepository.java
    └── service/PersonService.java
```

---

## Prerequisites

- JDK 17+
- Maven 3.8+
- MySQL 8+ (`localhost:3306`)
- Redis 6+ (`localhost:6379`)

---

## Configuration

Edit `src/main/resources/application.properties`:

| Property | Description |
|----------|-------------|
| `spring.datasource.url` | JDBC URL (default DB: `person_data_hub`) |
| `spring.datasource.username` | MySQL user |
| `spring.datasource.password` | MySQL password |
| `spring.jpa.hibernate.ddl-auto` | `update` — applies schema changes without dropping data |
| `spring.data.redis.host` / `port` | Redis connection |
| `app.cache.ttl-hours` | Cache TTL (default `24`) |
| `app.cors.allowed-origins` | Comma-separated frontend origins |

**Security:** Keep real credentials out of version control.

---

## Run

```bash
cd backend
mvn clean spring-boot:run
```

Verify:

```bash
curl "http://localhost:8080/api/persons?page=0&size=10"
```

Tests:

```bash
mvn test
```

---

## API reference

Base URL: `http://localhost:8080`

### List, filter, sort, paginate

`GET /api/persons`

| Query param | Description |
|-------------|-------------|
| `page` | Page index (0-based), default `0` |
| `size` | Page size, default `20`, max `100` |
| `sort` | `property,asc` or `property,desc` (e.g. `sort=name,asc`) |
| `name` | Case-insensitive substring match |
| `email` | Case-insensitive substring match |
| `minAge` | Minimum age (inclusive) |
| `maxAge` | Maximum age (inclusive) |
| `address` | Case-insensitive substring match |

**Example**

```bash
curl "http://localhost:8080/api/persons?page=0&size=10&sort=name,asc&minAge=18&name=Jane"
```

**Response**

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

### Get by id (cache-aside)

`GET /api/persons/{id}`

Returns `404` if not found. `fromCache: true` when served from Redis.

### Get by email (cache-aside)

`GET /api/persons/by-email?email=jane@example.com`

Email is validated and normalized to lowercase.

### Create

`POST /api/persons` → `201 Created`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 30,
  "address": "123 Main St"
}
```

| Field | Rules |
|-------|--------|
| `name` | Required |
| `email` | Required, valid email, unique |
| `age` | Required, ≥ 0 |
| `address` | Optional |

### Update

`PUT /api/persons/{id}` — same body as create.

### Delete

`DELETE /api/persons/{id}` → `204 No Content`

---

## Error responses

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

| Status | When |
|--------|------|
| 400 | Validation failed (`validationErrors` populated) |
| 404 | Person not found |
| 409 | Duplicate email |
| 500 | Unexpected error |

---

## Caching

| Redis key | Use |
|-----------|-----|
| `person:email:{email}` | Email lookup |
| `person:id:{id}` | Id lookup |

On **create / update / delete**, matching keys are evicted. On cache miss, data is loaded from MySQL and both keys are written with TTL `app.cache.ttl-hours`.

**List endpoint** always queries MySQL (not cached).

---

## Logging

SLF4J (`@Slf4j`) at `INFO` for mutations; `DEBUG` for cache hit/miss and list queries.

```properties
logging.level.com.persondatahub.peopledirectory=INFO
```

---

## Schema

Hibernate manages the `persons` table with `ddl-auto=update`:

- Safe for development: restarts do **not** wipe data (unlike `create`).
- Production should use explicit migrations (Flyway/Liquibase) and `validate`.

Entity fields: `id`, `name`, `email` (unique), `age`, `address`, `createdOn`, `updatedOn`.

---

## Full-stack project

See the root [README.md](../README.md) for frontend setup and end-to-end quick start.
