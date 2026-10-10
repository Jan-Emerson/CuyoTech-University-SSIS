import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import auth from './routes/auth.js';
import student from './routes/student.js';
import documents from './routes/documents.js';
import payments from './routes/payments.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', auth);
app.use('/api/student', requireAuth, student);
app.use('/api/documents', requireAuth, documents);
app.use('/api/payments', requireAuth, payments);

// Express 5 forwards async errors here automatically
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`SSIS API running on http://localhost:${port}`));
