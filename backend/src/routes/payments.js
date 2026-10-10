import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/payments/fees
router.get('/fees', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT feeId AS id, description, amount,
            DATE_FORMAT(dueDate, '%Y-%m-%d') AS due,
            (paymentId IS NOT NULL) AS paid
       FROM Fee WHERE studentId = ? ORDER BY dueDate, feeId`,
    [req.user.student_id]
  );
  res.json(rows.map(r => ({ ...r, paid: !!r.paid })));
});

// POST /api/payments  { payment_method }  -> pays ALL outstanding fees
router.post('/', async (req, res) => {
  const method = req.body?.payment_method;
  if (!['Cash', 'Online'].includes(method)) {
    return res.status(400).json({ message: 'Invalid payment method.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[sum]] = await conn.query(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM Fee
        WHERE studentId = ? AND paymentId IS NULL FOR UPDATE`,
      [req.user.student_id]
    );
    if (sum.total <= 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'No outstanding fees.' });
    }

    const receipt = `OR-${Date.now().toString().slice(-8)}`;
    const [pay] = await conn.query(
      `INSERT INTO Payment (studentId, receiptNumber, amountPaid, paymentMethod)
       VALUES (?, ?, ?, ?)`,
      [req.user.student_id, receipt, sum.total, method]
    );
    await conn.query(
      'UPDATE Fee SET paymentId = ? WHERE studentId = ? AND paymentId IS NULL',
      [pay.insertId, req.user.student_id]
    );

    await conn.commit();
    res.status(201).json({
      refNo: receipt,
      date: new Date().toLocaleDateString('en-PH'),
      method,
      amount: sum.total,
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

export default router;
