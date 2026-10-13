import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = Router();
const ROLES = ['student', 'registrar', 'cashier', 'dept_staff', 'admin'];
const DEFAULT_PW = 'password';

// GET /api/admin/accounts
router.get('/accounts', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT u.userId AS id, u.username, u.fullName AS full_name, u.role, d.deptName AS dept
       FROM Users u LEFT JOIN Department d ON d.deptId = u.deptId
      ORDER BY u.userId`
  );
  res.json(rows);
});

// POST /api/admin/accounts  { username, full_name, role, dept }
router.post('/accounts', async (req, res) => {
  const { username, full_name, role, dept } = req.body || {};
  const uname = String(username || '').trim();
  const name = String(full_name || '').trim();
  if (!uname || !name || !ROLES.includes(role)) {
    return res.status(400).json({ message: 'Username, full name and a valid role are required.' });
  }

  let deptId = null;
  if (dept) {
    const [d] = await pool.query('SELECT deptId FROM Department WHERE deptName = ?', [dept]);
    deptId = d[0]?.deptId ?? null;
  }

  const hash = await bcrypt.hash(DEFAULT_PW, 10);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [u] = await conn.query(
      `INSERT INTO Users (username, fullName, password, email, role, deptId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uname, name, hash, `${uname.replace(/[^A-Za-z0-9._-]/g, '')}@cuyotech.edu.ph`, role, deptId]
    );
    if (role === 'student') {
      const [[prog]] = await conn.query('SELECT programId FROM Program ORDER BY programId LIMIT 1');
      await conn.query(
        'INSERT INTO Student (userId, studentNum, programId, yearLevel) VALUES (?, ?, ?, 1)',
        [u.insertId, uname.slice(0, 20), prog.programId]
      );
    }
    await conn.commit();
    res.status(201).json({ id: u.insertId, username: uname, full_name: name, role, dept: dept || null });
  } catch (e) {
    await conn.rollback();
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That username already exists.' });
    throw e;
  } finally {
    conn.release();
  }
});

// DELETE /api/admin/accounts/:id
router.delete('/accounts/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.userId) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }
  await pool.query('DELETE FROM Users WHERE userId = ?', [req.params.id]);
  res.json({ success: true });
});

// POST /api/admin/accounts/:id/reset-password
router.post('/accounts/:id/reset-password', async (req, res) => {
  const hash = await bcrypt.hash(DEFAULT_PW, 10);
  const [r] = await pool.query('UPDATE Users SET password = ? WHERE userId = ?', [hash, req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Account not found.' });
  res.json({ success: true, message: `Password reset to "${DEFAULT_PW}".` });
});

export default router;
