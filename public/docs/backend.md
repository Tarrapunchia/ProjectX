# Backend README

## Overview

The backend uses Fastify, Prisma, and JWT to manage authentication, organizations, projects, tasks, files, and realtime chat.

## Main modules

- Users
- Organizations
- Projects
- Tasks
- Files
- WebSocket
- Google OAuth authentication

## Main APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/users/login` | User login |
| GET | `/api/v1/users/profile` | User profile |
| GET | `/api/v1/organizations/:id/organization` | Organization details |
| GET | `/api/v1/users/calendarEntries` | Calendar tasks and events |