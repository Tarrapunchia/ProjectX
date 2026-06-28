# WEB
1) **[MAJ]** 2 pt
    - Frontend -> Osme e Manuel
    - Beckend  -> Fabio e Giulia
2) **[MAJ]** 2 pt
    - real-time con websockets
3) **[MAJ]** 2 pt
    Allow users to interact with other users. The minimum requirements are:
    - A basic chat system (send/receive messages between users).
    - A profile system (view user information).
    - A friends system (add/remove friends, see friends list)
4) **[MAJ]** 2 pt
    A public API to interact with the database with a secured API key, rate
    limiting, documentation, and at least 5 endpoints:
    - GET /api/{something}
    - POST /api/{something}
    - PUT /api/{something}
    - DELETE /api/{something}
5) **[min]** 1pt
    - ORM (fatto)
6) **[min]** 1pt
    - A complete notification system for all creation, update, and deletion actions
6) **[min]** 1pt [OPZIONALE] Custom components per React
7) **[min]** 1pt Implement advanced search functionality with filters, sorting, and pagination
8) **[min]** 1pt 
    File upload and management system.
    - Support multiple file types (images, documents, etc.).
    - Client-side and server-side validation (type, size, format).
    - Secure file storage with proper access control.
    - File preview functionality where applicable.
    - Progress indicators for uploads.
    - Ability to delete uploaded files.

# USER MANAGEMENT
9) **[MAJ]** 2pt
    Standard user management and authentication.
    - Users can update their profile information.
    - Users can upload an avatar (with a default avatar if none provided).
    - Users can add other users as friends and see their online status.
    - Users have a profile page displaying their information.
10) **[min]** 1pt
    - OAuth 2.0 Google [FATTA]
11) **[MAJ]** 2pt
    Advanced permissions system:
    - View, edit, and delete users (CRUD).
    - Roles management (admin, user, guest, moderator, etc.).
    - Different views and actions based on user role.
12)  **[MAJ]** 2pt
    An organization system:
    - Create, edit, and delete organizations.
    - Add users to organizations.
    - Remove users from organizations.
    - View organizations and allow users to perform specific actions within an organization (minimum: create, read, update).

# Data and Analytics
13) **[MAJ]** 2 pt
    Advanced analytics dashboard with data visualization.
    - Interactive charts and graphs (line, bar, pie, etc.).
    - Real-time data updates.
    - Export functionality (PDF, CSV, etc.).
    - Customizable date ranges and filters.

# PER ORA 21 punti

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
