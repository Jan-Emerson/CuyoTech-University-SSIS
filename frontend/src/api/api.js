// ============================================================
//  SSIS API service — talks to the Express backend.
//  Vite proxies /api -> http://localhost:3001 (see vite.config.js)
//  Replaces the old mock version; exports keep the same names.
// ============================================================

async function request(path, options = {}) {
  const token = localStorage.getItem('ssis_token');
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Expired/invalid session on a protected call -> force re-login
    if (res.status === 401 && !path.startsWith('/auth/')) {
      localStorage.removeItem('ssis_token');
      localStorage.removeItem('ssis_user');
      window.location.href = '/login';
    }
    const err = new Error(data.message || 'Request failed.');
    err.status = res.status;
    throw err;
  }
  return data;
}

// ── Auth ──────────────────────────────────────────────────
export async function loginUser(student_number, password) {
  const { token, user } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ student_number, password }),
  });
  localStorage.setItem('ssis_token', token);
  localStorage.setItem('ssis_user', JSON.stringify(user));
  return user;
}

// ── Student ───────────────────────────────────────────────
export const getDashboard  = () => request('/student/dashboard');
export const getProfile    = () => request('/student/profile');
export const getGrades     = () => request('/student/grades');
export const getEnrollment = () => request('/student/enrollment');
export const getClearance  = () => request('/student/clearance');

// ── Documents ─────────────────────────────────────────────
export const getDocumentTypes = () => request('/documents/types');
export const getDocuments     = () => request('/documents');
export const submitDocument   = (body) =>
  request('/documents', { method: 'POST', body: JSON.stringify(body) });

// ── Payments ──────────────────────────────────────────────
export const getFees = () => request('/payments/fees');
export const payFees = (payment_method) =>
  request('/payments', { method: 'POST', body: JSON.stringify({ payment_method }) });
