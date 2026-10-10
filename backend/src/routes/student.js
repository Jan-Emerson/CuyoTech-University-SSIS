import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const remarksFor = (g) => (g == null ? null : g <= 3.0 ? 'PASSED' : 'FAILED');

// GET /api/student/profile
router.get('/profile', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT s.studentId AS student_id, s.studentNum AS student_number,
            u.fullName AS full_name, u.email, u.contactNumber AS contact_number,
            u.address, s.yearLevel AS year_level, s.program AS course_name,
            s.enroll_status AS status
       FROM Student s JOIN Users u ON u.userId = s.userId
      WHERE s.studentId = ?`,
    [req.user.student_id]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Student not found.' });
  res.json(rows[0]);
});

// GET /api/student/grades  (only enrollments that already have a final grade)
router.get('/grades', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.courseCode AS subject_code, c.courseTitle AS subject_name,
            c.creditUnits AS units, e.midterm, e.finals, e.grade,
            e.semester, e.academicYear AS school_year
       FROM Enrollment e JOIN Course c ON c.courseId = e.courseId
      WHERE e.studentId = ? AND e.grade IS NOT NULL
      ORDER BY e.academicYear, e.semester, c.courseCode`,
    [req.user.student_id]
  );
  res.json(rows.map(({ grade, ...r }) => ({
    ...r,
    final_grade: grade.toFixed(2),
    remarks: remarksFor(grade),
  })));
});

// GET /api/student/enrollment  (currently enrolled, not yet graded)
router.get('/enrollment', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.courseCode AS subject_code, c.courseTitle AS subject_name,
            c.creditUnits AS units, e.semester, e.academicYear AS school_year
       FROM Enrollment e JOIN Course c ON c.courseId = e.courseId
      WHERE e.studentId = ? AND e.grade IS NULL AND e.status = 'Enrolled'
      ORDER BY c.courseCode`,
    [req.user.student_id]
  );
  res.json(rows);
});

// GET /api/student/clearance
router.get('/clearance', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT d.deptName AS department_name, c.status,
            IF(c.status = 'Cleared', a.fullName, NULL) AS cleared_by,
            IF(c.status = 'Cleared', DATE_FORMAT(c.updatedAt, '%Y-%m-%d'), NULL) AS cleared_date,
            c.academicTerm AS semester
       FROM Clearance c
       JOIN Department d ON d.deptId = c.deptId
       LEFT JOIN Users a ON a.userId = c.adminUserId
      WHERE c.studentId = ?
      ORDER BY d.deptName`,
    [req.user.student_id]
  );
  res.json(rows);
});

// GET /api/student/dashboard
router.get('/dashboard', async (req, res) => {
  const id = req.user.student_id;

  const [[stats]] = await pool.query(
    `SELECT COALESCE(SUM(c.creditUnits), 0) AS total_units,
            SUM(e.grade * c.creditUnits) / NULLIF(SUM(c.creditUnits), 0) AS gwa
       FROM Enrollment e JOIN Course c ON c.courseId = e.courseId
      WHERE e.studentId = ? AND e.grade IS NOT NULL`,
    [id]
  );

  const [[docs]] = await pool.query(
    `SELECT COUNT(*) AS pending_docs FROM Document_Request
      WHERE studentId = ? AND status IN ('Pending', 'Processing')`,
    [id]
  );

  const [[clr]] = await pool.query(
    `SELECT COUNT(*) AS total, COALESCE(SUM(status <> 'Cleared'), 0) AS pending
       FROM Clearance WHERE studentId = ?`,
    [id]
  );

  const [feed] = await pool.query(
    `SELECT requestId AS request_id, documentType AS document_type, status,
            DATE_FORMAT(requestDate, '%Y-%m-%d') AS request_date
       FROM Document_Request WHERE studentId = ?
      ORDER BY requestId DESC LIMIT 5`,
    [id]
  );

  res.json({
    total_units: Number(stats.total_units),
    gwa: stats.gwa == null ? 'N/A' : Number(stats.gwa).toFixed(2),
    pending_docs: docs.pending_docs,
    clearance_status: clr.total > 0 && Number(clr.pending) === 0 ? 'CLEARED' : 'PENDING',
    feed,
  });
});

export default router;
