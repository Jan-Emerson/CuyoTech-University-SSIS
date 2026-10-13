import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = Router();

// POST /api/auth/login  { student_number | username, password } -> { token, user }
router.post('/login', async (req, res) => {
  const body = req.body || {};
  const username = String(body.username ?? body.student_number ?? '').trim();
  const password = body.password;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const [rows] = await pool.query(
    `SELECT u.userId, u.username, u.password, u.fullName AS full_name, u.email, u.role,
            u.status AS user_status, u.deptId, d.deptName AS dept,
            s.studentId AS student_id, s.studentNum AS student_number,
            p.programName AS course_name, s.yearLevel AS year_level
       FROM Users u
       LEFT JOIN Department d ON d.deptId = u.deptId
       LEFT JOIN Student s ON s.userId = u.userId
       LEFT JOIN Program p ON p.programId = s.programId
      WHERE u.username = ?`,
    [username]
  );

  const u = rows[0];
  const ok = u && (await bcrypt.compare(String(password), u.password));
  if (!ok) return res.status(401).json({ message: 'Invalid username or password.' });
  if (u.user_status !== 'Active') return res.status(403).json({ message: 'Account is not active.' });

  const token = jwt.sign(
    { userId: u.userId, role: u.role, student_id: u.student_id, deptId: u.deptId },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  const user = {
    id: u.userId, username: u.username, full_name: u.full_name,
    role: u.role, dept: u.dept || null, email: u.email,
  };
  if (u.role === 'student') {
    Object.assign(user, {
      student_id: u.student_id, student_number: u.student_number,
      course_name: u.course_name, year_level: u.year_level,
    });
  }
  res.json({ token, user });
});

export default router;
