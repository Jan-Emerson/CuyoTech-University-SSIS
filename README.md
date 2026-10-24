# University of CuyoTech — SSIS

**Student Services Information System**
College of Computing Studies

A role-based web system for student services: grades, document requests, clearance, and fee payments. It has a separate frontend and backend.

| Part | Stack | Port |
|---|---|---|
| `frontend/` | React 18 + Vite, React Router v6, plain CSS | 5173 |
| `backend/` | Node.js + Express 5, MySQL (`mysql2`), JWT auth, bcrypt | 3001 |

---

## Requirements

- **Node.js 18 or newer** (20+ recommended)
- **MySQL** server running locally (for example XAMPP — click *Start* next to MySQL)

---

## First-time setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `backend/.env` file (copy `.env.example` if you have it):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ssis
JWT_SECRET=change-this-to-any-long-random-string
PORT=3001
```

- Leave `DB_PASSWORD` empty for a default XAMPP install.
- `JWT_SECRET` is **required**. Without it, login will fail.
- `PORT` is optional (defaults to 3001).

Then create and fill the database:

```bash
npm run setup-db   # creates the "ssis" database and all tables
npm run seed       # inserts the sample data
npm run dev        # starts the API on http://localhost:3001
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## Running it every time

1. Start MySQL.
2. `cd backend` then `npm run dev`
3. `cd frontend` then `npm run dev`
4. Open http://localhost:5173

The frontend calls `/api/...` and Vite forwards it to `http://localhost:3001` (see `frontend/vite.config.js`). Both servers must be running.

---

## Resetting the data

`npm run setup-db` **wipes and recreates** the whole database. Always run it before `npm run seed`.

```bash
cd backend
npm run setup-db
npm run seed
```

> Never run `seed` twice without running `setup-db` in between. It will fail on duplicate data.

---

## Test accounts

All passwords are `password`.

| Username | Role |
|---|---|
| `2024-00001` | Student — Juan Dela Cruz |
| `2023-10042` | Student — Maria Santos |
| `2022-00315` | Student — Pedro Reyes |
| `2024-00892` | Student — Ana Garcia |
| `registrar` | Registrar |
| `cashier` | Cashier |
| `dept.lib` | Department Staff — Library |
| `dept.lab` | Department Staff — Laboratory |
| `dept.guid` | Department Staff — Guidance Office |
| `dept.dean` | Department Staff — Dean's Office |
| `admin` | Admin |

Accounts created from the Admin page also get the default password `password`.

---

## Roles and pages

Each role logs in to its own portal. Opening another role's page redirects you back to your own dashboard, and the API returns `403` for the wrong role.

| Role | Pages |
|---|---|
| **Student** | Dashboard, Grades, Document Requests, Clearance, Pay Fees, Profile |
| **Registrar** | Dashboard, Student List, Enrollment, Grades Encoding, Document Requests |
| **Cashier** | Dashboard, Payment Records, Fee Schedule |
| **Department Staff** | Dashboard, Clearance Approval (own department only) |
| **Admin** | Dashboard, User Accounts |

### How payments work

1. The cashier adds a fee for a student (status **Pending**).
2. The student opens **Pay Fees** and chooses Cash or Online.
3. The cashier enters an OR number and clicks **Confirm**. The fee becomes **Paid**.

Students cannot mark their own fees as paid.

---

## Project structure

```
backend/
├── db/schema.sql           Database schema (3NF)
├── scripts/
│   ├── setup-db.js         Creates the database from schema.sql
│   └── seed.js             Sample data
└── src/
    ├── index.js            Express app, route mounting, role guards
    ├── db.js               MySQL connection pool
    ├── middleware/auth.js  requireAuth (JWT) and requireRole
    └── routes/
        ├── auth.js         Login
        ├── student.js      Student portal data
        ├── documents.js    Document requests (student)
        ├── registrar.js
        ├── cashier.js
        ├── dept.js
        └── admin.js

frontend/
├── public/images/          logo.png, login-bg.png
└── src/
    ├── api/api.js          All API calls (fetch + JWT header)
    ├── context/AuthContext.jsx
    ├── components/         RoleSidebar, Topbar, MainLayout, ProtectedRoute, Icons
    ├── pages/              Student pages + login
    │   ├── registrar/
    │   ├── cashier/
    │   ├── dept/
    │   └── admin/
    ├── App.jsx             Route definitions
    ├── index.css           All styles
    └── main.jsx
```

`frontend/src/api/mockData.js` and `components/Sidebar.jsx` are leftovers from the old mock-data version and are no longer used by the app.

---

## API endpoints

All routes are under `/api`. Everything except login needs the header `Authorization: Bearer <token>`.

| Prefix | Role | Endpoints |
|---|---|---|
| `/auth` | public | `POST /login` |
| `/student` | student | `GET /dashboard`, `/profile`, `/grades`, `/enrollment`, `/clearance`, `/payments` · `PATCH /payments/:id/method` |
| `/documents` | student | `GET /types`, `GET /`, `POST /` |
| `/registrar` | registrar | `GET /students`, `/courses`, `/subjects`, `/enrollments`, `/grades`, `/documents` · `PATCH /enrollments/:id`, `/documents/:id` · `PUT /grades/:id` |
| `/cashier` | cashier | `GET /students`, `/payments`, `/fees` · `POST /payments`, `/payments/:id/confirm` · `PUT /fees/:id` |
| `/dept` | dept_staff | `GET /clearance` · `POST /clearance/:id/approve`, `/clearance/:id/reject` |
| `/admin` | admin | `GET /accounts` · `POST /accounts`, `/accounts/:id/reset-password` · `DELETE /accounts/:id` |
| `/health` | public | `GET /api/health` |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Cannot reach MySQL` | Start MySQL (XAMPP → Start next to MySQL). |
| `Wrong DB_USER / DB_PASSWORD` | Check `backend/.env`. |
| Login always fails or the server crashes on login | `JWT_SECRET` is missing in `backend/.env`. |
| Frontend shows errors or blank data | The backend isn't running on port 3001. |
| `seed` fails with duplicate entry errors | Run `npm run setup-db` first, then `npm run seed`. |
| Logged out unexpectedly | Tokens expire after 8 hours. Log in again. |

---

## Notes for deployment

- The Vite proxy only exists in development. A deployed frontend needs either a reverse proxy that forwards `/api` to the backend, or an API base URL setting in `api.js`.
- Set `JWT_SECRET` and the `DB_*` variables as environment variables on the server. Never commit `.env`.
- Change the default `password` on all seeded accounts before using the system for anything real.
