import { useEffect, useState } from 'react';
import { getAllEnrollments, updateEnrollmentStatus } from '../../api/api.js';

const STATUS_BADGE = {
  Enrolled: 'badge badge-released',
  Pending:  'badge badge-pending',
  Dropped:  'badge badge-cancelled',
};

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search,  setSearch]          = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving, setSaving]           = useState(null);
  const [toast,  setToast]            = useState('');

  useEffect(() => {
    getAllEnrollments().then(setEnrollments).finally(() => setLoading(false));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleStatus(enrollment_id, status) {
    setSaving(enrollment_id);
    await updateEnrollmentStatus(enrollment_id, status);
    setEnrollments(prev => prev.map(e => e.enrollment_id === enrollment_id ? { ...e, status } : e));
    setSaving(null);
    showToast(`Status updated to ${status}.`);
  }

  const filtered = enrollments.filter(e => {
    const matchSearch = !search ||
      (e.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.student_number || '').includes(search) ||
      e.subject_code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Enrollment Management</h1>
      <p className="page-subtitle">Review and manage student subject enrollments</p>

      {toast && <div className="alert-success">✓ {toast}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Search</label>
            <input className="form-control" placeholder="Student name, number, or subject..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
            <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Pending">Pending</option>
              <option value="Dropped">Dropped</option>
            </select>
          </div>
          <button className="btn-cancel" style={{ padding: '9px 16px', height: 38 }}
            onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear</button>
        </div>
      </div>

      <div className="card">
        <p className="section-title">Enrollments ({filtered.length})</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student No.</th>
                <th>Student Name</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Schedule</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No records found.</td></tr>
              ) : filtered.map(e => (
                <tr key={e.enrollment_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{e.student_number}</td>
                  <td style={{ fontWeight: 600 }}>{e.student_name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>{e.subject_code}</td>
                  <td>{e.subject_name}</td>
                  <td style={{ fontSize: 11, color: '#6b7280' }}>{e.schedule}</td>
                  <td style={{ fontSize: 11 }}>{e.semester}</td>
                  <td><span className={STATUS_BADGE[e.status] || 'badge'}>{e.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {e.status !== 'Enrolled' && (
                        <button
                          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          disabled={saving === e.enrollment_id}
                          onClick={() => handleStatus(e.enrollment_id, 'Enrolled')}>
                          Enroll
                        </button>
                      )}
                      {e.status !== 'Dropped' && (
                        <button
                          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          disabled={saving === e.enrollment_id}
                          onClick={() => handleStatus(e.enrollment_id, 'Dropped')}>
                          Drop
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
