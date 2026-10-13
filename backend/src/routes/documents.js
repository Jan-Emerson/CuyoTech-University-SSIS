import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const METHODS = ['Cash', 'Online'];

const SELECT_REQUEST = `
  SELECT r.requestId AS request_id, r.studentId AS student_id,
         u.fullName AS student_name, s.studentNum AS student_number,
         r.documentType AS document_type, r.quantity,
         r.totalAmount AS amount, r.paymentMethod AS payment_method, r.purpose, r.status,
         DATE_FORMAT(r.requestDate, '%Y-%m-%d') AS request_date,
         DATE_FORMAT(r.releaseDate, '%Y-%m-%d') AS release_date
    FROM Document_Request r
    JOIN Student s ON s.studentId = r.studentId
    JOIN Users u ON u.userId = s.userId`;

// GET /api/documents/types
router.get('/types', async (_req, res) => {
  const [rows] = await pool.query(
    'SELECT code AS value, label, price FROM Document_Type ORDER BY label'
  );
  res.json(rows);
});

// GET /api/documents  (this student's requests)
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `${SELECT_REQUEST} WHERE r.studentId = ? ORDER BY r.requestId DESC`,
    [req.user.student_id]
  );
  res.json(rows);
});

// POST /api/documents  { document_type, quantity, payment_method, purpose }
router.post('/', async (req, res) => {
  const { document_type, payment_method = 'Cash', purpose = '' } = req.body || {};
  const quantity = Number(req.body?.quantity);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return res.status(400).json({ message: 'Quantity must be between 1 and 10.' });
  }
  if (!METHODS.includes(payment_method)) {
    return res.status(400).json({ message: 'Invalid payment method.' });
  }

  const [types] = await pool.query('SELECT price FROM Document_Type WHERE code = ?', [document_type]);
  if (!types[0]) return res.status(400).json({ message: 'Invalid document type.' });

  // Price is computed on the server, never trusted from the client
  const total = types[0].price * quantity;

  const [result] = await pool.query(
    `INSERT INTO Document_Request
       (studentId, documentType, quantity, totalAmount, paymentMethod, purpose)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.student_id, document_type, quantity, total, payment_method, String(purpose).slice(0, 100)]
  );

  const [rows] = await pool.query(`${SELECT_REQUEST} WHERE r.requestId = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
});

export default router;
