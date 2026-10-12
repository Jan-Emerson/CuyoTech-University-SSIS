// ============================================================
//  SSIS Mock API Service — all roles
//  Swap each function body with real fetch() when backend ready
// ============================================================

import {
  MOCK_ACCOUNTS, MOCK_STUDENTS, MOCK_GRADES, MOCK_ENROLLMENT,
  MOCK_DOCUMENTS, MOCK_DOCUMENT_TYPES, MOCK_CLEARANCE,
  MOCK_PAYMENTS, MOCK_FEE_SCHEDULE, MOCK_SUBJECTS, MOCK_COURSES,
} from './mockData.js';

const wait = (ms = 350) => new Promise(r => setTimeout(r, ms));

// in-memory mutable state (persists for the browser session)
let _documents  = [...MOCK_DOCUMENTS];
let _clearance  = [...MOCK_CLEARANCE];
let _payments   = [...MOCK_PAYMENTS];
let _enrollments= [...MOCK_ENROLLMENT];
let _grades     = [...MOCK_GRADES];
let _accounts   = [...MOCK_ACCOUNTS];
let _feeSchedule= [...MOCK_FEE_SCHEDULE];
let _nextDocId  = _documents.length + 1;
let _nextPayId  = _payments.length  + 1;

// ── AUTH ────────────────────────────────────────────────
export async function loginUser(username, password) {
  await wait();
  const acc = MOCK_ACCOUNTS.find(
    a => a.username === username.trim() && a.password === password
  );
  if (!acc) {
    const err = new Error('Invalid username or password.');
    err.status = 401;
    throw err;
  }
  let extra = {};
  if (acc.role === 'student') {
    const s = MOCK_STUDENTS.find(s => s.student_id === acc.student_id);
    extra = { student_id: s.student_id, student_number: s.student_number, course_name: s.course_name, year_level: s.year_level, email: s.email };
  }
  const user = { id: acc.id, username: acc.username, full_name: acc.full_name, role: acc.role, dept: acc.dept || null, ...extra };
  localStorage.setItem('ssis_user', JSON.stringify(user));
  return user;
}

// ── STUDENT ─────────────────────────────────────────────
export async function getDashboard() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  const sid  = user.student_id;
  const myGrades = _grades.filter(g => g.student_id === sid && g.final_grade);
  const totalUnits = myGrades.reduce((s, g) => s + g.units, 0);
  const gwa = totalUnits
    ? (myGrades.reduce((s, g) => s + parseFloat(g.final_grade) * g.units, 0) / totalUnits).toFixed(2)
    : 'N/A';
  const pendingDocs  = _documents.filter(d => d.student_id === sid && ['Pending','Processing'].includes(d.status)).length;
  const pendingClear = _clearance.filter(c => c.student_id === sid && c.status === 'Pending').length;
  const feed = _documents.filter(d => d.student_id === sid).slice(0, 5).map(d => ({
    request_id: d.request_id, document_type: d.document_type, status: d.status, request_date: d.request_date,
  }));
  return { total_units: totalUnits || 21, gwa, pending_docs: pendingDocs, clearance_status: pendingClear === 0 ? 'CLEARED' : 'PENDING', feed };
}

export async function getProfile() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  return MOCK_STUDENTS.find(s => s.student_id === user.student_id) || user;
}

export async function getGrades() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  return _grades.filter(g => g.student_id === user.student_id);
}

export async function getEnrollment() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  return _enrollments.filter(e => e.student_id === user.student_id);
}

export async function getClearance() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  return _clearance.filter(c => c.student_id === user.student_id);
}

export async function getDocumentTypes() {
  await wait(100);
  return MOCK_DOCUMENT_TYPES;
}

export async function getDocuments() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  return _documents.filter(d => d.student_id === user.student_id);
}

export async function submitDocument({ document_type, quantity, payment_method, purpose }) {
  await wait(600);
  const user     = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  const student  = MOCK_STUDENTS.find(s => s.student_id === user.student_id);
  const typeInfo = MOCK_DOCUMENT_TYPES.find(t => t.value === document_type);
  const newReq   = {
    request_id: _nextDocId++,
    student_id: user.student_id,
    student_name:   student?.full_name    || '',
    student_number: student?.student_number || '',
    document_type, quantity,
    amount:         (typeInfo?.price || 0) * quantity,
    payment_method: payment_method || 'Cash',
    purpose:        purpose || '',
    status:         'Pending',
    request_date:   new Date().toISOString().split('T')[0],
    release_date:   null,
  };
  _documents = [newReq, ..._documents];
  return newReq;
}

// ── REGISTRAR ────────────────────────────────────────────
export async function getAllStudents() {
  await wait();
  return [...MOCK_STUDENTS];
}

export async function getAllEnrollments() {
  await wait();
  return _enrollments.map(e => {
    const s = MOCK_STUDENTS.find(s => s.student_id === e.student_id);
    return { ...e, student_name: s?.full_name, student_number: s?.student_number, course_name: s?.course_name };
  });
}

export async function updateEnrollmentStatus(enrollment_id, status) {
  await wait(400);
  _enrollments = _enrollments.map(e => e.enrollment_id === enrollment_id ? { ...e, status } : e);
  return { success: true };
}

export async function getAllGradesForRegistrar() {
  await wait();
  return _grades.map(g => {
    const s = MOCK_STUDENTS.find(s => s.student_id === g.student_id);
    return { ...g, student_name: s?.full_name, student_number: s?.student_number };
  });
}

export async function encodeGrade(grade_id, { midterm, finals, final_grade, remarks }) {
  await wait(400);
  _grades = _grades.map(g => g.grade_id === grade_id ? { ...g, midterm, finals, final_grade, remarks } : g);
  return { success: true };
}

export async function getAllDocumentRequests() {
  await wait();
  return [..._documents];
}

export async function updateDocumentStatus(request_id, status) {
  await wait(400);
  const today = new Date().toISOString().split('T')[0];
  _documents = _documents.map(d =>
    d.request_id === request_id
      ? { ...d, status, release_date: status === 'Released' ? today : d.release_date }
      : d
  );
  return { success: true };
}

export async function getSubjects() {
  await wait();
  return MOCK_SUBJECTS;
}

export async function getCourses() {
  await wait();
  return MOCK_COURSES;
}

// ── CASHIER ──────────────────────────────────────────────
export async function getAllPayments() {
  await wait();
  return [..._payments];
}

export async function confirmPayment(payment_id, or_number) {
  await wait(400);
  _payments = _payments.map(p =>
    p.payment_id === payment_id
      ? { ...p, status: 'Paid', or_number, date: new Date().toISOString().split('T')[0] }
      : p
  );
  return { success: true };
}

export async function addPayment({ student_id, description, amount, method }) {
  await wait(400);
  const student = MOCK_STUDENTS.find(s => s.student_id === Number(student_id));
  const newPay  = {
    payment_id: _nextPayId++,
    student_id: Number(student_id),
    student_name:   student?.full_name || '',
    student_number: student?.student_number || '',
    description, amount: Number(amount), method,
    status: 'Pending',
    date:   new Date().toISOString().split('T')[0],
    or_number: null,
  };
  _payments = [newPay, ..._payments];
  return newPay;
}

export async function getFeeSchedule() {
  await wait();
  return [..._feeSchedule];
}

export async function updateFee(fee_id, amount) {
  await wait(300);
  _feeSchedule = _feeSchedule.map(f => f.fee_id === fee_id ? { ...f, amount: Number(amount) } : f);
  return { success: true };
}

// ── DEPT STAFF ───────────────────────────────────────────
export async function getClearanceForDept() {
  await wait();
  const user = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  return _clearance.filter(c => c.department_name === user.dept);
}

export async function approveClearance(clearance_id) {
  await wait(400);
  const user  = JSON.parse(localStorage.getItem('ssis_user') || '{}');
  const today = new Date().toISOString().split('T')[0];
  _clearance  = _clearance.map(c =>
    c.clearance_id === clearance_id
      ? { ...c, status: 'Cleared', cleared_by: user.full_name, cleared_date: today }
      : c
  );
  return { success: true };
}

export async function rejectClearance(clearance_id) {
  await wait(400);
  _clearance = _clearance.map(c =>
    c.clearance_id === clearance_id ? { ...c, status: 'Pending', cleared_by: null, cleared_date: null } : c
  );
  return { success: true };
}

// ── ADMIN ────────────────────────────────────────────────
export async function getAccounts() {
  await wait();
  return _accounts.map(({ password, ...rest }) => rest); // never expose passwords
}

export async function addAccount(acc) {
  await wait(400);
  const newAcc = { ...acc, id: _accounts.length + 1, password: 'password' };
  _accounts = [..._accounts, newAcc];
  return { ...newAcc, password: undefined };
}

export async function deleteAccount(id) {
  await wait(300);
  _accounts = _accounts.filter(a => a.id !== id);
  return { success: true };
}

export async function resetPassword(id) {
  await wait(300);
  _accounts = _accounts.map(a => a.id === id ? { ...a, password: 'password' } : a);
  return { success: true, message: 'Password reset to "password".' };
}
