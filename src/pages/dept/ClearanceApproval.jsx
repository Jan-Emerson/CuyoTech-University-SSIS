import { useEffect, useState } from 'react';
import { getClearanceForDept, approveClearance, rejectClearance } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ClearanceApproval() {
  const { user }  = useAuth();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');
  const [saving,  setSaving]  = useState(null);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    getClearanceForDept().then(setItems).finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleApprove(clearance_id) {
    setSaving(clearance_id);
    await approveClearance(clearance_id);
    setItems(prev => prev.map(i => i.clearance_id === clearance_id
      ? { ...i, status: 'Cleared', cleared_by: user.full_name, cleared_date: new Date().toISOString().split('T')[0] }
      : i
    ));
    setSaving(null);
    showToast('Clearance approved.');
  }

  async function handleReject(clearance_id) {
    setSaving(clearance_id);
    await rejectClearance(clearance_id);
    setItems(prev => prev.map(i => i.clearance_id === clearance_id
      ? { ...i, status: 'Pending', cleared_by: null, cleared_date: null }
      : i
    ));
    setSaving(null);
    showToast('Clearance reset to Pending.');
  }

  const filtered = filter ? items.filter(i => i.status === filter) : items;
  const cleared  = items.filter(i => i.status === 'Cleared').length;
  const pct      = items.length ? Math.round((cleared / items.length) * 100) : 0;

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Clearance Approval</h1>
      <p className="page-subtitle">{user?.dept} — Manage student clearance requests</p>

      {toast && <div className="alert-success">✓ {toast}</div>}

      {/* Progress */}
      <div className="card progress-bar-wrap" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            {cleared} of {items.length} students cleared
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{pct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['', 'Pending', 'Cleared'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1px solid',
              borderColor: filter === s ? '#1a2340' : '#d1d5db',
              background:  filter === s ? '#1a2340' : '#fff',
              color:       filter === s ? '#fff'    : '#374151',
              transition: 'all 0.15s',
            }}>
            {s || 'All'} ({s ? items.filter(i => i.status === s).length : items.length})
          </button>
        ))}
      </div>

      <div className="card">
        <p className="section-title">Students ({filtered.length})</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student No.</th>
              <th>Student Name</th>
              <th>Semester</th>
              <th>School Year</th>
              <th>Status</th>
              <th>Cleared By</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No records found.</td></tr>
            ) : filtered.map(item => (
              <tr key={item.clearance_id}>
                <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{item.student_number}</td>
                <td style={{ fontWeight: 600 }}>{item.student_name}</td>
                <td style={{ fontSize: 11 }}>{item.semester}</td>
                <td style={{ fontSize: 11 }}>{item.school_year}</td>
                <td>
                  <span className={`badge ${item.status === 'Cleared' ? 'badge-cleared' : 'badge-pending'}`}>
                    {item.status}
                  </span>
                </td>
                <td style={{ fontSize: 11, color: '#6b7280' }}>{item.cleared_by || '—'}</td>
                <td style={{ fontSize: 11, color: '#6b7280' }}>{item.cleared_date || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {item.status === 'Pending' ? (
                      <button
                        style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        disabled={saving === item.clearance_id}
                        onClick={() => handleApprove(item.clearance_id)}>
                        {saving === item.clearance_id ? '...' : 'Approve'}
                      </button>
                    ) : (
                      <button
                        style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                        disabled={saving === item.clearance_id}
                        onClick={() => handleReject(item.clearance_id)}>
                        {saving === item.clearance_id ? '...' : 'Revoke'}
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
  );
}
