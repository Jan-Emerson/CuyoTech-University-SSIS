// Run once after schema.sql:  npm run seed
import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

const hash = bcrypt.hashSync('password', 10);

async function main() {
  const [d1] = await pool.query("INSERT INTO Department (deptCode, deptName) VALUES ('CCS','College of Computing Studies')");
  const [d2] = await pool.query("INSERT INTO Department (deptCode, deptName) VALUES ('GE','General Education')");
  const ccs = d1.insertId, ge = d2.insertId;

  // Clearance offices are stored as departments
  const offices = {};
  for (const [code, name] of [
    ['LIB', 'Library'], ['CSH', 'Cashier'], ['REG', 'Registrar'],
    ['LAB', 'Laboratory'], ['GUI', 'Guidance Office'], ['DEAN', "Dean's Office"],
  ]) {
    const [r] = await pool.query('INSERT INTO Department (deptCode, deptName) VALUES (?, ?)', [code, name]);
    offices[name] = r.insertId;
  }

  // Staff user who signs clearances
  const [adm] = await pool.query(
    `INSERT INTO Users (username, fullName, password, email, role)
     VALUES ('registrar', 'Ms. Alvarez', ?, 'registrar@cuyotech.edu.ph', 'Admin')`, [hash]);

  async function addStudent(num, name, email, phone, addr, program, year) {
    const [u] = await pool.query(
      `INSERT INTO Users (username, fullName, password, email, contactNumber, address, role)
       VALUES (?, ?, ?, ?, ?, ?, 'Student')`, [num, name, hash, email, phone, addr]);
    const [s] = await pool.query(
      'INSERT INTO Student (userId, studentNum, program, yearLevel) VALUES (?, ?, ?, ?)',
      [u.insertId, num, program, year]);
    return s.insertId;
  }
  const juan = await addStudent('2024-00001', 'Juan Dela Cruz', 'juan.delacruz@cuyotech.edu.ph',
    '09171234567', 'Cabuyao, Laguna', 'BS Computer Science', 3);
  await addStudent('2023-10042', 'Maria Santos', 'maria.santos@cuyotech.edu.ph',
    '09189876543', 'Biñan, Laguna', 'BS Information Technology', 2);

  // Graded courses (1st sem)
  const graded = [
    ['CS301', 'Data Structures and Algorithms', ccs, 88, 91, 1.50],
    ['CS302', 'Object-Oriented Programming', ccs, 92, 95, 1.25],
    ['CS303', 'Database Management Systems', ccs, 85, 87, 1.75],
    ['CS304', 'Computer Networks', ccs, 78, 82, 2.00],
    ['GE001', 'Purposive Communication', ge, 90, 88, 1.50],
    ['GE002', 'Mathematics in the Modern World', ge, 75, 80, 2.25],
  ];
  for (const [code, title, dept, mid, fin, grade] of graded) {
    const [c] = await pool.query(
      'INSERT INTO Course (deptId, courseCode, courseTitle, creditUnits) VALUES (?, ?, ?, 3)',
      [dept, code, title]);
    await pool.query(
      `INSERT INTO Enrollment (studentId, courseId, academicYear, semester, midterm, finals, grade, status)
       VALUES (?, ?, '2024-2025', '1st Semester', ?, ?, ?, 'Completed')`,
      [juan, c.insertId, mid, fin, grade]);
  }

  // Current (ungraded) enrollment, 2nd sem
  for (const [code, title, dept] of [
    ['CS401', 'Software Engineering', ccs], ['CS402', 'Operating Systems', ccs],
    ['CS403', 'Human-Computer Interaction', ccs], ['CS404', 'Capstone Project 1', ccs],
    ['GE003', 'Ethics', ge],
  ]) {
    const [c] = await pool.query(
      'INSERT INTO Course (deptId, courseCode, courseTitle, creditUnits) VALUES (?, ?, ?, 3)',
      [dept, code, title]);
    await pool.query(
      `INSERT INTO Enrollment (studentId, courseId, academicYear, semester)
       VALUES (?, ?, '2024-2025', '2nd Semester')`, [juan, c.insertId]);
  }

  for (const [code, label, price] of [
    ['TOR', 'Transcript of Records', 150], ['COR', 'Certificate of Registration', 50],
    ['COE', 'Certificate of Enrollment', 50], ['COG', 'Certificate of Graduation', 200],
    ['DIPLOMA', 'Diploma', 500], ['GOOD_MORAL', 'Good Moral Certificate', 50],
    ['HONORABLE', 'Honorable Dismissal', 100], ['CERT', 'Certification', 150],
  ]) {
    await pool.query('INSERT INTO Document_Type (code, label, price) VALUES (?, ?, ?)', [code, label, price]);
  }

  await pool.query(
    `INSERT INTO Document_Request (studentId, documentType, quantity, totalAmount, paymentMethod, purpose, status, requestDate, releaseDate)
     VALUES (?, 'TOR', 1, 150, 'Cash', 'Job Application', 'Released', '2024-01-15', '2024-01-22'),
            (?, 'COR', 2, 100, 'Cash', 'Scholarship', 'Processing', '2024-02-10', NULL),
            (?, 'CERT', 1, 150, 'Online', 'Board Exam', 'Pending', '2024-03-01', NULL)`,
    [juan, juan, juan]);

  const term = '1st Semester 2024-2025';
  for (const [office, cleared] of [
    ['Library', true], ['Cashier', true], ['Registrar', false],
    ['Laboratory', false], ['Guidance Office', true], ["Dean's Office", false],
  ]) {
    await pool.query(
      'INSERT INTO Clearance (studentId, deptId, adminUserId, academicTerm, status) VALUES (?, ?, ?, ?, ?)',
      [juan, offices[office], cleared ? adm.insertId : null, term, cleared ? 'Cleared' : 'Pending']);
  }

  // Fees: tuition + misc already paid via a seed payment, the rest outstanding
  const [p] = await pool.query(
    `INSERT INTO Payment (studentId, receiptNumber, amountPaid, paymentMethod)
     VALUES (?, 'OR-SEED0001', 14000, 'Cash')`, [juan]);
  await pool.query(
    `INSERT INTO Fee (studentId, description, amount, dueDate, academicTerm, paymentId) VALUES
      (?, 'Tuition Fee', 12500, '2024-09-01', ?, ?),
      (?, 'Miscellaneous Fee', 1500, '2024-09-01', ?, ?),
      (?, 'Laboratory Fee', 800, '2024-09-15', ?, NULL),
      (?, 'Library Fee', 300, '2024-09-15', ?, NULL),
      (?, 'Student Activity Fund', 200, '2024-09-15', ?, NULL)`,
    [juan, term, p.insertId, juan, term, p.insertId, juan, term, juan, term, juan, term]);

  console.log('Seeded. Login: 2024-00001 / password');
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
