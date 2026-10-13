# CuyoTech University SSIS

Student Services Information System. Separate frontend and backend.

```
frontend/   React + Vite (port 5173)
backend/    Express + MySQL (port 3001)
```

## Run (first time)
1. Start MySQL (XAMPP).
2. `cd backend`, create `.env` (copy `.env.example`; leave DB_PASSWORD empty for XAMPP).
3. `npm install`, `npm run setup-db`, `npm run seed`, `npm run dev`
4. New terminal: `cd frontend`, `npm install`, `npm run dev`
5. Open http://localhost:5173

## Run (every time)
MySQL on, `npm run dev` in `backend/`, `npm run dev` in `frontend/`.

## Test accounts (password: `password`)
Students: `2024-00001`, `2023-10042`, `2022-00315`, `2024-00892`
Staff: `registrar`, `cashier`, `dept.lib`, `dept.lab`, `dept.guid`, `dept.dean`, `admin`

`npm run setup-db` then `npm run seed` (in `backend/`) resets all data. Never run `seed` twice without `setup-db`.
