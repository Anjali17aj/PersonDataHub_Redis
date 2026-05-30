# PersonDataHub

A full-stack **people directory** application for managing contact records through a modern web interface. PersonDataHub demonstrates a production-style architecture: a **React** frontend, a **Spring Boot** REST API, **MySQL** for durable storage, and **Redis** for high-performance cache-aside lookups.

| | |
|---|---|
| **Version** | 1.0.0 |
| **Backend artifact** | `com.persondatahub.peopledirectory:people-directory-api` |
| **Frontend** | React 18 · Vite 6 · Bootstrap 5 |
| **Backend** | Java 17 · Spring Boot 3.3 · MySQL 8+ · Redis 6+ |

---

## Table of contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Architecture](#architecture)
- [How Redis fits in](#how-redis-fits-in)
- [Features](#features)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [API overview](#api-overview)
- [Configuration](#configuration)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

PersonDataHub lets you **create, read, update, and delete** person records with the following fields:

| Field | Description |
|-------|-------------|
| **Name** | Full name (required) |
| **Email** | Unique email address (required) |
| **Age** | Non-negative integer (required) |
| **Address** | Optional mailing address |

All data is **persisted in MySQL**. When you look up a single person by **email** or **id**, the backend checks **Redis first** — if the record was recently fetched, it is returned from memory without hitting the database. The UI surfaces this with a **Redis badge** on cache hits.

The list view supports **pagination**, **sorting**, **server-side filtering**, and **client-side search** in the frontend.

---

## Screenshots

### Directory — browse and manage contacts

The main dashboard displays all persons as cards with avatar initials, metadata, and edit/delete actions. The hero section shows live counts; the search bar filters locally by name, email, or address.

[![Directory view — person cards, search, and hero stats](https://drive.google.com/uc?export=view&id=1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5)](https://drive.google.com/file/d/1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5/view?usp=sharing)

[View full size →](https://drive.google.com/file/d/1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5/view?usp=sharing)

### Email lookup — Redis cache-aside in action

Search by email to trigger the cache-aside flow. When a record is served from Redis, the card displays a **Redis** badge (`fromCache: true` in the API response).

[![Email lookup — cache hit with Redis badge](https://drive.google.com/uc?export=view&id=1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw)](https://drive.google.com/file/d/1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw/view?usp=sharing)

[View full size →](https://drive.google.com/file/d/1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw/view?usp=sharing)

---

## Architecture

```
┌─────────────────────────┐
│   Browser (React UI)    │
│   http://localhost:5173 │
└───────────┬─────────────┘
            │  REST / JSON
            ▼
┌─────────────────────────┐
│   Spring Boot API       │
│   http://localhost:8080 │
│                         │
│   Controller            │
│      ↓                  │
│   Service (cache-aside) │
│      ↓         ↓        │
│   MySQL     Redis       │
│   :3306     :6379       │
│   (source   (fast       │
│   of truth)  cache)     │
└─────────────────────────┘
```

| Layer | Role |
|-------|------|
| **Frontend** | React SPA — forms, directory grid, email lookup, toasts |
| **Backend** | REST API — validation, business rules, cache orchestration |
| **MySQL** | Permanent storage for all person records |
| **Redis** | In-memory cache for single-record lookups by id or email |

**Request flow (email lookup):**

1. User searches by email in the UI.
2. Backend checks Redis key `person:email:{email}`.
3. **Cache hit** → return immediately with `fromCache: true`.
4. **Cache miss** → query MySQL, store copy in Redis (TTL 24 h), return with `fromCache: false`.

On **create**, **update**, or **delete**, matching Redis keys are evicted so the cache never serves stale data.

---

## How Redis fits in

Redis is **not** the primary database. MySQL holds every record permanently; Redis holds **temporary copies** of recently accessed persons to speed up repeated lookups.

| Operation | MySQL | Redis |
|-----------|-------|-------|
| List all persons | Always queried | Not used |
| Get by email / id | Queried on cache miss | Checked first |
| Create / update / delete | Written | Cache updated or cleared |

This pattern — **cache-aside** — is widely used in production systems where read-heavy workloads benefit from a fast in-memory layer.

---

## Features

### Backend

- Full CRUD REST API with consistent JSON error responses
- Pagination, sorting, and multi-field filtering on list endpoint
- Redis cache-aside for `GET /api/persons/{id}` and `GET /api/persons/by-email`
- Jakarta Bean Validation on request bodies
- Configurable cache TTL and CORS origins
- Hibernate schema evolution (`ddl-auto=update`) — data survives restarts

### Frontend

- React 18 single-page application with Vite dev server
- Directory view with search, person cards, and skeleton loading states
- Create and edit forms with client-side validation
- Email lookup with visual Redis cache indicator
- Delete confirmation modal with keyboard focus trap
- Success/error toast notifications

---

## Repository structure

```
PersonDataHub/
├── README.md                    # Full-stack overview (this file)
├── .gitignore
│
├── backend/                     # Spring Boot REST API
│   ├── README.md
│   ├── pom.xml
│   └── src/main/
│       ├── java/.../peopledirectory/
│       └── resources/application.properties
│
└── frontend/                    # React + Vite UI
    ├── README.md
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── public/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        ├── hooks/
        ├── services/
        └── utils/
```

---

## Prerequisites

| Component | Requirement |
|-----------|-------------|
| **JDK** | 17 or later |
| **Maven** | 3.8+ |
| **MySQL** | 8+ running on `localhost:3306` |
| **Redis** | 6+ running on `localhost:6379` |
| **Node.js** | 18+ with npm |

---

## Quick start

### 1. Start MySQL and Redis

Ensure both services are running on their default ports before starting the backend.

### 2. Configure and run the backend

```bash
cd backend
```

Edit `src/main/resources/application.properties` and set your MySQL credentials (`spring.datasource.username`, `spring.datasource.password`).

```bash
mvn clean spring-boot:run
```

Verify the API:

```bash
curl "http://localhost:8080/api/persons?page=0&size=10"
```

API base URL: **http://localhost:8080**

→ Full backend docs: [backend/README.md](backend/README.md)

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

In development, Vite proxies `/api` requests to the backend — no extra CORS configuration is needed locally.

→ Full frontend docs: [frontend/README.md](frontend/README.md)

---

## API overview

Base URL: `http://localhost:8080`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/persons` | Paginated list with filters and sort |
| `GET` | `/api/persons/{id}` | Get person by id (cache-aside) |
| `GET` | `/api/persons/by-email?email=` | Get person by email (cache-aside) |
| `POST` | `/api/persons` | Create person → `201 Created` |
| `PUT` | `/api/persons/{id}` | Update person → `200 OK` |
| `DELETE` | `/api/persons/{id}` | Delete person → `204 No Content` |

**List query parameters:** `page`, `size` (max 100), `sort=field,asc|desc`, `name`, `email`, `minAge`, `maxAge`, `address`

Complete API reference: [backend/README.md#api-reference](backend/README.md#api-reference)

---

## Configuration

| Setting | Location | Notes |
|---------|----------|-------|
| Database credentials | `backend/src/main/resources/application.properties` | Do not commit real passwords |
| Redis host / port | Same file | Default `localhost:6379` |
| Cache TTL | `app.cache.ttl-hours` | Default 24 hours |
| CORS origins | `app.cors.allowed-origins` | Includes `http://localhost:5173` |
| Frontend API URL | `frontend/.env` | Empty in dev (uses Vite proxy) |

The JDBC URL can auto-create the `person_data_hub` database on first connection.

---

## Documentation

| Document | Description |
|----------|-------------|
| [backend/README.md](backend/README.md) | API reference, caching, schema, configuration |
| [frontend/README.md](frontend/README.md) | UI stack, components, dev and build commands |

---

## License

Academic / portfolio project — **PersonDataHub v1.0.0**
