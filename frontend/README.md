# PersonDataHub — Frontend

**React 18** UI for the PersonDataHub people directory, built with **Vite**.

| | |
|---|---|
| **Dev server** | `http://localhost:5173` |
| **API** | `http://localhost:8080` (Spring Boot) |

---

## Stack

| Technology | Role |
|------------|------|
| React 18 | UI components |
| Vite 6 | Dev server and build |
| Bootstrap 5 | Grid, forms, navbar, modals |

---

## Prerequisites

- **Node.js 18+** and npm
- Backend running at **http://localhost:8080** ([backend/README.md](../backend/README.md))

---

## Run (development)

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

In dev mode, Vite proxies `/api` requests to the backend — no CORS setup needed for local development.

---

## Other commands

```powershell
npm run build    # production build → dist/
npm run preview  # preview production build
```

---

## Configuration

| File | Purpose |
|------|---------|
| `.env` | Dev API base (empty = use Vite proxy) |
| `.env.production` | Production API URL (`http://localhost:8080`) |

---

## Project structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── hooks/
    ├── services/
    └── components/
```

---

## Features

| Screen | Behavior |
|--------|----------|
| Directory | Paginated person cards, refresh, empty state |
| Add / Edit | Validated form (name, email, age 0–150, address) |
| Email lookup | Search with Redis cache indicator |
| Delete | Confirmation modal |

---

## Full-stack project

See the root [README.md](../README.md) for architecture and backend setup.
