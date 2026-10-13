import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();
const ENROLL_STATUS = ['Enrolled', 'Pending', 'Dropped'];
const DOC_STATUS = ['Pending', 'Processing', 'Released', 'Cancelled'];
const REMARKS = ['PASSED', 'FAILED', 'INC', 'DRP'];

// GET /api/registrar/students
router.get('/students', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT s.studentId AS student_id, s.studentNum AS student_number,
            u.fullName AS full_name, u.email, u.contactNumber AS contact_number,
            u.address, s.yearLevel AS year_level, p.programName AS course_name,
            p.programCode AS course_code, u.status
       FROM Student s
       JOIN Users u ON u.userId = s.userId
       JOIN Program p ON p.programId = s.programId
      ORDER BY s.studentId`
  );
  res.json(rows);
});

// GET /api/registrar/courses  (programs, e.g. BSCS)
router.get('/courses', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT programId AS course_id, programCode AS course_code, programName AS course_name
       FROM Program ORDER BY programId`
  );
  res.json(rows);
});

// GET /api/registrar/subjects
router.get('/subjects', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT courseId AS subject_id, courseCode AS subject_code, courseTitle AS subject_name,
            creditUnits AS units, 'All' AS course_code
       FROM Course ORDER BY courseCode`
  );
  res.json(rows);
});

// GET /api/registrar/enrollments
router.get('/enrollments', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT e.enrollmentId AS enrollment_id, e.studentId AS student_id,
            u.fullName AS student_name, s.studentNum AS student_number, p.programName AS course_name,
            c.courseCode AS subject_code, c.courseTitle AS subject_name, c.creditUnits AS units,
            e.schedule, e.room, e.instructor,
            e.semester, e.academicYear AS school_year, e.status
       FROM Enrollment e
       JOIN Course c ON c.courseId = e.courseId
       JOIN Student s ON s.studentId = e.studentId
       JOIN Users u ON u.userId = s.userId
       JOIN Program p ON p.programId = s.programId
      WHERE e.status IN ('Enrolled', 'Pending', 'Dropped')
      ORDER BY e.enrollmentId`
  );
  res.json(rows);
});

// PATCH /api/registrar/enrollments/:id  { status }
router.patch('/enrollments/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!ENROLL_STATUS.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const [r] = await pool.query('UPDATE Enrollment SET status = ? WHERE enrollmentId = ?', [status, req.params.id]);
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Enrollment not found.' });
  res.json({ success: true });
});

// GET /api/registrar/grades  (every non-dropped enrollment, graded or not)
router.get('/grades', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT e.enrollmentId AS grade_id, e.studentId AS student_id,
            u.fullName AS student_name, s.studentNum AS student_number,
            c.courseCode AS subject_code, c.courseTitle AS subject_name, c.creditUnits AS units,
            e.midterm, e.finals, e.grade, e.remarks,
            e.semester, e.academicYear AS school_year
       FROM Enrollment e
       JOIN Course c ON c.courseId = e.courseId
       JOIN Student s ON s.studentId = e.studentId
       JOIN Users u ON u.userId = s.userId
      WHERE e.status <> 'Dropped'
      ORDER BY e.enrollmentId`
  );
  res.json(rows.map(({ grade, ...r }) => ({
    ...r,
    final_grade: grade == null ? null : grade.toFixed(2),
  })));
});

// PUT /api/registrar/grades/:id  { midterm, finals, final_grade, remarks }
router.put('/grades/:id', async (req, res) => {
  const { midterm, finals, final_grade, remarks } = req.body || {};
  const mid = midterm === '' || midterm == null ? null : Number(midterm);
  const fin = finals === '' || finals == null ? null : Number(finals);
  const grade = final_grade === '' || final_grade == null ? null : Number(final_grade);

  for (const v of [mid, fin]) {
    if (v !== null && (Number.isNaN(v) || v < 0 || v > 100)) {
      return res.status(400).json({ message: 'Midterm/finals must be between 0 and 100.' });
    }
  }
  if (grade !== null && (Number.isNaN(grade) || grade < 1 || grade > 5)) {
    return res.status(400).json({ message: 'Final grade must be between 1.00 and 5.00.' });
  }
  if (remarks && !REMARKS.includes(remarks)) {
    return res.status(400).json({ message: 'Invalid remarks.' });
  }

  const [r] = await pool.query(
    'UPDATE Enrollment SET midterm = ?, finals = ?, grade = ?, remarks = ? WHERE enrollmentId = ?',
    [mid, fin, grade, remarks || null, req.params.id]
  );
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Grade record not found.' });
  res.json({ success: true });
});

// GET /api/registrar/documents  (all students' requests)
router.get('/documents', async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT r.requestId AS request_id, r.studentId AS student_id,
            u.fullName AS student_name, s.studentNum AS student_number,
            r.documentType AS document_type, r.quantity, r.totalAmount AS amount,
            r.paymentMethod AS payment_method, r.purpose, r.status,
            DATE_FORMAT(r.requestDate, '%Y-%m-%d') AS request_date,
            DATE_FORMAT(r.releaseDate, '%Y-%m-%d') AS release_date
       FROM Document_Request r
       JOIN Student s ON s.studentId = r.studentId
       JOIN Users u ON u.userId = s.userId
      ORDER BY r.requestId`
  );
  res.json(rows);
});

// PATCH /api/registrar/documents/:id  { status }
router.patch('/documents/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!DOC_STATUS.includes(status)) return res.status(400).json({ message: 'Invalid status.' });
  const [r] = await pool.query(
    `UPDATE Document_Request
        SET status = ?, releaseDate = IF(? = 'Released', CURDATE(), releaseDate)
      WHERE requestId = ?`,
    [status, status, req.params.id]
  );
  if (r.affectedRows === 0) return res.status(404).json({ message: 'Request not found.' });
  res.json({ success: true });
});

export default router;
