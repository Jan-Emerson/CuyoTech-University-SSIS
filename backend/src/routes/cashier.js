import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const SELECT_PAYMENT = `
  SELECT p.paymentId AS payment_id, p.studentId AS student_id,
         u.fullName AS student_name, s.studentNum AS student_number,
         p.description, p.amount, p.paymentMethod AS method, p.status,
         DATE_FORMAT(p.paymentDate, '%Y-%m-%d') AS date,
         p.receiptNumber AS or_number
    FROM Payment p
    JOIN Student s ON s.studentId = p.studentId
    JOIN Users u ON u.userId = s.userId`;

// GET /api/cashier/students  (for the "Add Payment" dropdown)
router.get('/students', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.studentId AS student_id, s.studentNum AS student_number, u.fullName AS full_name
       FROM Student s JOIN Users u ON u.userId = s.userId
      ORDER BY s.studentNum`
  );
  res.json(rows);
});

// GET /api/cashier/payments
router.get('/payments', async (_req, res) => {
  const [rows] = await pool.query(`${SELECT_PAYMENT} ORDER BY p.paymentId`);
  res.json(rows);
});

// POST /api/cashier/payments  { student_id, description, amount, method }
router.post('/payments', async (req, res) => {
  const { student_id, description, method = 'Cash' } = req.body || {};
  const amount = Number(req.body?.amount);
  if (!student_id || !String(description || '').trim() || !(amount > 0)) {
    return res.status(400).json({ message: 'Student, description and a positive amount are required.' });
  }
  if (!['Cash', 'Online'].includes(method)) {
    return res.status(400).json({ message: 'Invalid payment method.' });
  }
  const [st] = await pool.query('SELECT studentId FROM Student WHERE studentId = ?', [student_id]);
  if (!st[0]) return res.status(400).json({ message: 'Student not found.' });

  const [r] = await pool.query(
    `INSERT INTO Payment (studentId, description, amount, paymentMethod, paymentDate, status)
     VALUES (?, ?, ?, ?, CURDATE(), 'Pending')`,
    [student_id, String(description).trim().slice(0, 100), amount, method]
  );
  const [rows] = await pool.query(`${SELECT_PAYMENT} WHERE p.paymentId = ?`, [r.insertId]);
  res.status(201).json(rows[0]);
});

// POST /api/cashier/payments/:id/confirm  { or_number }
router.post('/payments/:id/confirm', async (req, res) => {
  const or = String(req.body?.or_number || '').trim();
  if (!or) return res.status(400).json({ message: 'OR number is required.' });
  try {
    const [r] = await pool.query(
      `UPDATE Payment SET status = 'Paid', receiptNumber = ?, paymentDate = CURDATE(), cashierUserId = ?
        WHERE paymentId = ?`,
      [or.slice(0, 50), req.user.userId, req.params.id]
    );
    if (r.affectedRows === 0) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ success: true });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'That OR number is already used.' });
    throw e;
  }
});

// GET /api/cashier/fees
router.get('/fees', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT feeId AS fee_id, feeName AS fee_name, amount, per, applicableTo AS applicable_to
       FROM Fee_Schedule ORDER BY feeId`
  );
  res.json(rows);
});

// PUT /api/cashier/fees/:id  { amount }
router.put('/fees/:id', async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!(amount >= 0) || Number.isNaN(amount)) return res.status(400).json({ message: 'Invalid amount.' });
  const [r] = await pool.query('UPDATE Fee_Schedule SET amount = ? WHERE feeId = ?', [amount, req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Fee not found.' });
  res.json({ success: true });
});

export default router;
