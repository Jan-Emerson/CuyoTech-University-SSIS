# CHANGES

## Role-Based System Overhaul

### New: 5 Role Portals
- **Student** — Dashboard, Grades, Document Request, Clearance, Payment, Profile
- **Registrar** — Dashboard, Student List, Enrollment Management, Grades Encoding, Document Approval
- **Cashier** — Dashboard, Payment Records, Fee Schedule
- **Department Staff** — Dashboard, Clearance Approval (per department)
- **Admin** — Dashboard, User Account Management

### Auth
- Login now handles all 5 roles
- Role-based redirect on login (each role goes to its own dashboard)
- `AuthContext` exposes `user.role` and role booleans
- `ProtectedRoute` accepts `allowedRoles` — blocks cross-role access
- Version key in `main.jsx` clears stale localStorage on app update

### Navigation
- `RoleSidebar` — single component, renders correct nav items and accent color per role
- Sidebar accent colors: navy (student), green (registrar), brown (cashier), purple (dept staff), dark blue (admin)
- Sidebar shows user name, student number / department under avatar

### Mock Data (`src/api/mockData.js`)
- `MOCK_ACCOUNTS` — 11 accounts across all 5 roles
- 4 student accounts: Juan Dela Cruz, Maria Santos, Pedro Reyes, Ana Garcia
- Each student has own grades (5 subjects), enrollments (4-5 subjects), document requests, clearance (6 departments), payments
- Added: `MOCK_COURSES`, `MOCK_SUBJECTS`, `MOCK_FEE_SCHEDULE`
- Clearance generated for all 4 students × 6 departments (24 records)

### Mock API (`src/api/api.js`)
- `loginUser` — matches any role account
- Student: `getDashboard`, `getProfile`, `getGrades`, `getEnrollment`, `getClearance`, `getDocuments`, `submitDocument`
- Registrar: `getAllStudents`, `getAllEnrollments`, `updateEnrollmentStatus`, `getAllGradesForRegistrar`, `encodeGrade`, `getAllDocumentRequests`, `updateDocumentStatus`
- Cashier: `getAllPayments`, `confirmPayment`, `addPayment`, `getFeeSchedule`, `updateFee`
- Dept Staff: `getClearanceForDept`, `approveClearance`, `rejectClearance`
- Admin: `getAccounts`, `addAccount`, `deleteAccount`, `resetPassword`

### Pages Added
- `registrar/RegistrarDashboard.jsx`
- `registrar/StudentList.jsx` — search, filter, detail modal
- `registrar/EnrollmentManagement.jsx` — enroll / drop actions
- `registrar/GradesEncoding.jsx` — inline grade editing
- `registrar/DocumentApproval.jsx` — process / release / cancel workflow
- `cashier/CashierDashboard.jsx`
- `cashier/PaymentRecords.jsx` — confirm with OR number, add new record
- `cashier/FeeSetup.jsx` — inline fee editing
- `dept/DeptDashboard.jsx`
- `dept/ClearanceApproval.jsx` — approve / revoke, progress bar, filter tabs
- `admin/AdminDashboard.jsx`
- `admin/UserManagement.jsx` — add, delete, reset password, confirm modal

### Pages Updated
- `LoginPage.jsx` — removed demo buttons, handles all roles, role flash on success
- `DashboardPage.jsx` — Pay Fees now routes to `/payment`
- `DocumentRequestPage.jsx` — View Details modal added
- `GradesPage.jsx`, `ClearancePage.jsx`, `ProfilePage.jsx` — use named API functions

### Routing (`App.jsx`)
- 5 role-grouped route sections, each with `ProtectedRoute allowedRoles`
- `RootRedirect` reads stored role and sends to correct dashboard
- Routes: `/dashboard`, `/registrar/*`, `/cashier/*`, `/dept/*`, `/admin/*`

### Login Credentials
All passwords: `password`

| Username | Role |
|---|---|
| `2024-00001` | Student — Juan Dela Cruz |
| `2023-10042` | Student — Maria Santos |
| `2022-00315` | Student — Pedro Reyes |
| `2024-00892` | Student — Ana Garcia |
| `registrar` | Registrar |
| `cashier` | Cashier |
| `dept.lib` | Dept Staff — Library |
| `dept.lab` | Dept Staff — Laboratory |
| `dept.guid` | Dept Staff — Guidance Office |
| `dept.dean` | Dept Staff — Dean's Office |
| `admin` | Admin |
