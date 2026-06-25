# Frontend README

## Overview

The frontend is a **React + TypeScript + Vite** single-page application built around a dashboard-style collaborative workspace.

It provides the user-facing experience for:

- authentication flows
- profile display
- organizations
- projects and tasks
- documents and file library
- calendar and alerts
- settings
- direct and floating chat
- developer-facing docs pages

---

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Chart.js
- FullCalendar / react-big-calendar
- lucide-react
- react-markdown
- nginx (container serving path)

---

## Main Entry Points

```text
frontend/src/main.tsx
frontend/src/App.tsx
```

The dashboard application mounts different areas such as:

- profile
- projects
- tasks
- chat
- documents
- file library
- settings
- docs / how-to-use pages

---

## Main UI Areas

### Dashboard
The dashboard aggregates the main application pages and keeps the workspace state connected through local storage and the WebSocket provider.

### Profile
Displays user profile information, avatar, and friends.

### Projects / Tasks
Shows project structures, statuses, and task-related content.

### Chat
Uses the shared WebSocket context to manage real-time interactions, floating chat windows, and history loading.

### File Library
Handles the UI flows for file upload, access, and organization/project-scoped file browsing.

### Documentation Pages
The frontend includes internal documentation pages for project guidance and markdown-based docs display.

---

## Real-Time Integration

The frontend uses a dedicated WebSocket context:

```text
frontend/src/utilities/WebSocketContext.tsx
```

This context manages:

- connection lifecycle
- friend presence updates
- direct messages
- pending requests
- group loading
- calendar refresh events
- chat window state

---

## Local Development

### Install

```bash
cd frontend
npm install
```

### Start dev server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## Routing

Main routes currently include:

- `/`
- `/login`
- `/signup`
- `/dashboard`
- `/docs`
- `/docs/:slug`
- `/how-to-use`

---

## Styling

The UI relies on Tailwind CSS plus project-specific stylesheets.

Goals of the visual system:

- responsive dashboard layout
- clean workspace navigation
- reusable components
- readable information density for project/task management
- integration of charts, calendars, and chat overlays

---

## Container Notes

The frontend has its own multi-stage Dockerfile:

```text
frontend/Dockerfile
```

The production image:

1. installs dependencies
2. builds the Vite app
3. copies the compiled output into nginx
4. serves the app as a static site

nginx configuration:

```text
frontend/default.conf
```

---

## Known Frontend Responsibilities by Team Member

Primary frontend implementation:
- **Manuel Chiaramello (`mchiaram`)**
- **Ansi Osmenaj (`aosmenaj`)**

Specific emphasis:
- **Ansi Osmenaj** focused especially on file upload / download related sections and frontend architecture details.
- **Manuel Chiaramello** combined frontend development with project coordination and synchronization work.

---

## Notes

This frontend is designed as the user-facing layer of a collaborative workspace rather than a game-oriented interface. Its structure reflects the project focus on:

- organizations
- projects
- tasks
- files
- chat
- notifications
- dashboard productivity flows
