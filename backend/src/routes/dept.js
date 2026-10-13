import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/dept/clearance  (only this staff member's own department)
router.get('/clearance', async (req, res) => {
  if (!req.user.deptId) return res.json([]);
  const [rows] = await pool.query(
    `SELECT c.clearanceId AS clearance_id, c.studentId AS student_id,
            u.fullName AS student_name, s.studentNum AS student_number,
            d.deptName AS department_name, c.status,
            IF(c.status = 'Cleared', a.fullName, NULL) AS cleared_by,
            IF(c.status = 'Cleared', DATE_FORMAT(c.updatedAt, '%Y-%m-%d'), NULL) AS cleared_date,
            c.semester, c.schoolYear AS school_year
       FROM Clearance c
       JOIN Student s ON s.studentId = c.studentId
       JOIN Users u ON u.userId = s.userId
       JOIN Department d ON d.deptId = c.deptId
       LEFT JOIN Users a ON a.userId = c.adminUserId
      WHERE c.deptId = ?
      ORDER BY c.clearanceId`,
    [req.user.deptId]
  );
  res.json(rows);
});

// POST /api/dept/clearance/:id/approve
router.post('/clearance/:id/approve', async (req, res) => {
  const [r] = await pool.query(
    `UPDATE Clearance SET status = 'Cleared', adminUserId = ?
      WHERE clearanceId = ? AND deptId = ?`,
    [req.user.userId, req.params.id, req.user.deptId]
  );
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Clearance not found for your department.' });
  res.json({ success: true });
});

// POST /api/dept/clearance/:id/reject  (resets to Pending)
router.post('/clearance/:id/reject', async (req, res) => {
  const [r] = await pool.query(
    `UPDATE Clearance SET status = 'Pending', adminUserId = NULL
      WHERE clearanceId = ? AND deptId = ?`,
    [req.params.id, req.user.deptId]
  );
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Clearance not found for your department.' });
  res.json({ success: true });
});

export default router;
