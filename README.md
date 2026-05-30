# PersonDataHub

Full-stack people directory — **Spring Boot** API with **MySQL** and **Redis**, plus a **React (JSX)** static frontend.

| | |
|---|---|
| **Version** | 1.0.0 |
| **Backend** | `com.persondatahub.peopledirectory:people-directory-api` |
| **Stack** | Java 17 · Spring Boot 3.3 · MySQL 8+ · Redis 6+ · React 18 · Bootstrap 5 |

---

## What it does

Manage person records (name, email, age, address) through a browser UI. The API persists data in **MySQL** and uses **Redis cache-aside** for lookups by **email** and **id**. List endpoints support **pagination**, **filtering**, and **sorting**.

---

## Architecture

```
┌──────────────────┐   REST / JSON    ┌─────────────────────────────────┐
│  frontend/       │ ───────────────► │  backend/  (Spring Boot :8080)  │
│  React + Vite    │                  │  Controller → Service → JPA     │
│  :5173           │                  │           │              │        │
└──────────────────┘                  │           ▼              ▼        │
                                      │        MySQL 8+      Redis 6+    │
                                      └─────────────────────────────────┘
```

**Cache-aside:** `GET /by-email` and `GET /{id}` check Redis first, then MySQL, then warm the cache (TTL configurable).

---

## Repository layout

```
PersonDataHub/
├── README.md                 ← you are here (full stack)
├── .gitignore
├── backend/
│   ├── README.md             ← API, config, run instructions
│   └── src/...
└── frontend/
    ├── README.md             ← UI stack, run instructions
    ├── index.html
    ├── css/
    ├── assets/
    └── js/
```

---

## Prerequisites

| Component | Requirement |
|-----------|-------------|
| Backend | JDK 17+, Maven 3.8+, MySQL 8+, Redis 6+ |
| Frontend | Node.js 18+, npm |

---

## Quick start

### 1. MySQL and Redis

Start MySQL and Redis locally (default ports `3306` and `6379`).

### 2. Backend

```bash
cd backend
```

Edit `src/main/resources/application.properties` — set `spring.datasource.password` for your MySQL user.

```bash
mvn clean spring-boot:run
```

API: **http://localhost:8080**

Details: [backend/README.md](backend/README.md)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

Details: [frontend/README.md](frontend/README.md)

---

## API overview

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/persons` | Paginated list + filters + sort |
| `GET` | `/api/persons/{id}` | Get by id (cache-aside) |
| `GET` | `/api/persons/by-email?email=` | Get by email (cache-aside) |
| `POST` | `/api/persons` | Create → `201` |
| `PUT` | `/api/persons/{id}` | Update |
| `DELETE` | `/api/persons/{id}` | Delete → `204` |

**List query params:** `page`, `size` (max 100), `sort=field,asc`, `name`, `email`, `minAge`, `maxAge`, `address`

Full reference: [backend/README.md](backend/README.md#api-reference)

---

## Features

| Area | Highlights |
|------|------------|
| API | CRUD, pagination, filters, consistent JSON errors |
| Cache | Redis cache-aside; `fromCache` flag on single-record reads |
| UI | Directory list, create/edit forms, email lookup, toasts, delete modal |
| Data safety | Hibernate `ddl-auto=update` (schema evolves without dropping data on restart) |

---

## Configuration notes

- **Do not commit** real database passwords. Use local `application.properties` only.
- **CORS** is enabled for `http://localhost:5173` and `http://127.0.0.1:5173` by default.
- First-time DB: JDBC URL can create database `person_data_hub` if missing.

---

## Documentation

| Document | Audience |
|----------|----------|
| [backend/README.md](backend/README.md) | Backend developers, API consumers |
| [frontend/README.md](frontend/README.md) | Frontend / UI work |

---
## Summary
PersonDataHub is a people CRUD app where MySQL permanently stores all data, and Redis temporarily caches individual person lookups by id/email to make repeated searches faster — the React frontend is just the UI that talks to the Spring Boot API.

## License

Academic / portfolio project — PersonDataHub v1.0.0.
