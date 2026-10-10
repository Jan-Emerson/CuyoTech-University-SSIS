# CuyoTech University — SSIS Frontend

**Student Services Information System**
University of CuyoTech | College of Computing Studies

---

## Stack
- **Vite** + **React 18**
- **React Router DOM v6** — client-side routing
- **Pure CSS** (`src/index.css`) — no Tailwind, no UI library

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Demo Login Credentials

| Student Number | Password |
|---|---|
| `2024-00001`   | `password` |
| `2023-10042`   | `password` |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── api/
│   │   ├── api.js          ← Mock API service (swap for real fetch calls)
│   │   └── mockData.js     ← All mock data lives here
│   ├── components/
│   │   ├── Icons.jsx       ← Inline SVG icons (no icon library)
│   │   ├── MainLayout.jsx  ← Sidebar + Topbar shell
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx ← Login / logout state
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── DocumentRequestPage.jsx
│   │   ├── GradesPage.jsx
│   │   ├── ClearancePage.jsx
│   │   ├── PaymentPage.jsx
│   │   └── ProfilePage.jsx
│   ├── App.jsx             ← Route definitions
│   ├── index.css           ← All styles
│   └── main.jsx            ← Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Connecting to a Real Backend

All data currently comes from `src/api/api.js` (mock functions) and `src/api/mockData.js`.

When the backend is ready, replace each function in `api.js` with a real `fetch()` call.

**Expected API endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | `{ student_number, password }` → `{ token, user }` |
| GET  | `/api/student/dashboard` | Stats + activity feed |
| GET  | `/api/student/profile` | Student info |
| GET  | `/api/student/grades` | Grades list |
| GET  | `/api/student/enrollment` | Enrolled subjects |
| GET  | `/api/student/clearance` | Clearance status |
| GET  | `/api/documents` | Document requests |
| GET  | `/api/documents/types` | Document type + price list |
| POST | `/api/documents` | Submit new request |

---

## Pages

| Route | Page |
|---|---|
| `/login` | Login Page |
| `/dashboard` | Student Dashboard |
| `/document-request` | Document Request |
| `/grades` | Grades per Semester |
| `/clearance` | Clearance Status |
| `/payment` | Pay Fees |
| `/profile` | My Profile |
