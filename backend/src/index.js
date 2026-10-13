import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import auth from './routes/auth.js';
import student from './routes/student.js';
import documents from './routes/documents.js';
import registrar from './routes/registrar.js';
import cashier from './routes/cashier.js';
import dept from './routes/dept.js';
import admin from './routes/admin.js';
import { requireAuth, requireRole } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', auth);
app.use('/api/student',   requireAuth, requireRole('student'),    student);
app.use('/api/documents', requireAuth, requireRole('student'),    documents);
app.use('/api/registrar', requireAuth, requireRole('registrar'),  registrar);
app.use('/api/cashier',   requireAuth, requireRole('cashier'),    cashier);
app.use('/api/dept',      requireAuth, requireRole('dept_staff'), dept);
app.use('/api/admin',     requireAuth, requireRole('admin'),      admin);

// Express 5 forwards async errors here automatically
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`SSIS API running on http://localhost:${port}`));
