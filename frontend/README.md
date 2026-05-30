# PersonDataHub — Frontend

The browser-facing layer of PersonDataHub: a **React 18** single-page application built with **Vite**, styled with **Bootstrap 5**, and connected to the Spring Boot API for all data operations.

| | |
|---|---|
| **Dev server** | http://localhost:5173 |
| **Backend API** | http://localhost:8080 |
| **Build tool** | Vite 6 |
| **UI framework** | React 18 + Bootstrap 5 |

---

## Table of contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Technology stack](#technology-stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API integration](#api-integration)
- [Component overview](#component-overview)
- [Troubleshooting](#troubleshooting)
- [Related documentation](#related-documentation)

---

## Overview

The frontend provides a responsive interface for managing person records. It does **not** store data locally — every create, read, update, and delete operation is sent to the backend REST API via `fetch`.

Key user flows:

1. **Directory** — view all persons as cards, search locally, refresh from server
2. **Add / Edit** — validated forms for name, email, age, and address
3. **Email lookup** — search by email and see whether the result came from Redis cache
4. **Delete** — confirmation modal before removing a record

---

## Screenshots

### Directory view

Hero section with live stats, email lookup panel, searchable person card grid, and navbar with person count.

[![Directory view — person cards, search, and hero stats](https://drive.google.com/uc?export=view&id=1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5)](https://drive.google.com/file/d/1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5/view?usp=sharing)

[View full size →](https://drive.google.com/file/d/1LpTWUVTd3KUbb0qog4U9dYIb5U2q5wH5/view?usp=sharing)

### Email lookup with Redis cache indicator

When the backend returns `fromCache: true`, the person card displays a **Redis** badge — meaning the record was served from the in-memory cache rather than MySQL.

[![Email lookup — cache hit with Redis badge](https://drive.google.com/uc?export=view&id=1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw)](https://drive.google.com/file/d/1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw/view?usp=sharing)

[View full size →](https://drive.google.com/file/d/1qW7CF2VUcA7laD0FZ3xD9u28d7m1gwgw/view?usp=sharing)

---

## Technology stack

| Technology | Purpose |
|------------|---------|
| **React 18** | Component-based UI with hooks |
| **Vite 6** | Fast dev server, HMR, and production bundling |
| **Bootstrap 5** | Responsive grid, forms, navbar, modals |
| **Inter** (Google Fonts) | Typography |

There is no client-side routing library — navigation is handled with local React state (`list`, `create`, `edit` views).

---

## Features

| Feature | Description |
|---------|-------------|
| **Person directory** | Card grid with avatar initials, age, address, and last-updated timestamp |
| **Local search** | Filter displayed cards by name, email, or address without extra API calls |
| **Create / edit forms** | Required-field validation; displays server validation errors |
| **Email lookup** | Dedicated search panel calling `GET /api/persons/by-email` |
| **Redis badge** | Visual indicator when lookup result is served from cache |
| **Delete modal** | Accessible confirmation dialog with Escape key and focus trap |
| **Toast notifications** | Auto-dismissing success and error feedback |
| **Loading skeletons** | Shimmer placeholders while data is fetching |
| **Error boundary** | Graceful fallback if a React render error occurs |

---

## Project structure

```
frontend/
├── index.html              # HTML shell, font imports
├── package.json            # Dependencies and npm scripts
├── vite.config.js          # Dev server, API proxy, React plugin
├── .env                    # Dev environment (empty API base → proxy)
├── .env.production         # Production API URL
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React root, Bootstrap imports
    ├── App.jsx             # View routing, CRUD orchestration
    ├── index.css           # Custom design tokens and layout
    ├── components/
    │   ├── Ui.jsx          # Navbar, toast, modal, skeletons
    │   ├── PersonCard.jsx  # Person display card
    │   ├── PersonForm.jsx  # Create/edit form
    │   ├── EmailLookup.jsx # Email search panel
    │   └── ErrorBoundary.jsx
    ├── hooks/
    │   ├── usePersons.js   # List fetch with abort controller
    │   └── useToast.js     # Toast state management
    ├── services/
    │   └── person-api.js   # fetch wrapper and API methods
    └── utils/
        └── avatar.js       # Initials and avatar color generation
```

---

## Prerequisites

- **Node.js 18+** and npm
- Backend running at **http://localhost:8080** — see [backend/README.md](../backend/README.md)

---

## Getting started

### Development

```powershell
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

> **PowerShell note:** If `npm` is blocked by execution policy, use `npm.cmd` instead.

### Production build

```powershell
npm run build      # Output → dist/
npm run preview    # Preview the production build locally
```

---

## Configuration

| File | Variable | Purpose |
|------|----------|---------|
| `.env` | `VITE_API_BASE` | Leave empty in dev — Vite proxies `/api` to `localhost:8080` |
| `.env.production` | `VITE_API_BASE` | Set to backend URL for production builds |

**Vite proxy** (defined in `vite.config.js`):

```js
proxy: {
  '/api': { target: 'http://localhost:8080', changeOrigin: true }
}
```

This means frontend code calls `/api/persons` and Vite forwards it to the Spring Boot server during development.

---

## API integration

All HTTP calls go through `src/services/person-api.js`:

| Method | Backend endpoint | Used by |
|--------|------------------|---------|
| `getAll()` | `GET /api/persons` | Directory list |
| `getByEmail()` | `GET /api/persons/by-email` | Email lookup |
| `create()` | `POST /api/persons` | Add person form |
| `update()` | `PUT /api/persons/{id}` | Edit person form |
| `delete()` | `DELETE /api/persons/{id}` | Delete modal |

Errors from the backend (validation, 404, 409 conflict) are parsed and displayed in the UI. Network failures show a message prompting the user to start the backend.

---

## Component overview

```
App
├── Navbar              — branding, directory link, person count, add button
├── Toast               — auto-dismissing notifications
├── [list view]
│   ├── Hero            — stats and tech badges
│   ├── EmailLookup     — email search with cache indicator
│   └── PersonCard[]    — grid of person cards with search filter
├── [create / edit view]
│   └── PersonForm      — validated CRUD form
└── DeleteModal         — confirmation before deletion
```

Custom hooks:

- **`usePersons`** — loads the directory on mount, exposes `reload()` for refresh
- **`useToast`** — manages toast message and type (`success` / `danger`)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm` blocked in PowerShell | Run `npm.cmd install` and `npm.cmd run dev` |
| "Cannot reach the API" | Start the backend: `mvn spring-boot:run` in `backend/` |
| Blank page / CORS error in production | Set `VITE_API_BASE` and ensure backend CORS includes your origin |
| List empty but backend has data | Check browser Network tab for failed `/api/persons` requests |

---

## Related documentation

| Document | Description |
|----------|-------------|
| [../README.md](../README.md) | Full-stack overview, architecture, Redis explanation |
| [../backend/README.md](../backend/README.md) | REST API reference and caching details |
