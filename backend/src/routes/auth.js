import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

// POST /api/auth/login  { student_number, password } -> { token, user }
router.post('/login', async (req, res) => {
  const { student_number, password } = req.body || {};
  if (!student_number || !password) {
    return res.status(400).json({ message: 'Student number and password are required.' });
  }

  const [rows] = await pool.query(
    `SELECT u.userId, u.password, u.fullName AS full_name, u.email, u.status AS user_status,
            s.studentId AS student_id, s.studentNum AS student_number,
            s.program AS course_name, s.yearLevel AS year_level
       FROM Student s
       JOIN Users u ON u.userId = s.userId
      WHERE s.studentNum = ?`,
    [String(student_number).trim()]
  );

  const u = rows[0];
  const ok = u && (await bcrypt.compare(password, u.password));
  if (!ok) return res.status(401).json({ message: 'Invalid student number or password.' });
  if (u.user_status !== 'Active') return res.status(403).json({ message: 'Account is not active.' });

  const token = jwt.sign(
    { userId: u.userId, student_id: u.student_id },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  const { password: _pw, userId: _id, user_status: _st, ...user } = u;
  res.json({ token, user });
});

export default router;
