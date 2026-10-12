import { useEffect, useState } from 'react';
import { getAllDocumentRequests, updateDocumentStatus } from '../../api/api.js';

const STATUS_BADGE = {
  Pending:    'badge badge-pending',
  Processing: 'badge badge-processing',
  Released:   'badge badge-released',
  Cancelled:  'badge badge-cancelled',
};

export default function DocumentApproval() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving,   setSaving]   = useState(null);
  const [toast,    setToast]    = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllDocumentRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleStatus(request_id, status) {
    setSaving(request_id);
    await updateDocumentStatus(request_id, status);
    setRequests(prev => prev.map(r => r.request_id === request_id
      ? { ...r, status, release_date: status === 'Released' ? new Date().toISOString().split('T')[0] : r.release_date }
      : r
    ));
    setSaving(null);
    showToast(`Request ${status.toLowerCase()}.`);
    if (selected?.request_id === request_id) setSelected(s => ({ ...s, status }));
  }

  const filtered = requests.filter(r => {
    const matchSearch = !search ||
      (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.student_number || '').includes(search) ||
      r.document_type.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Document Request Approval</h1>
      <p className="page-subtitle">Review and process student document requests</p>

      {toast && <div className="alert-success">✓ {toast}</div>}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Search</label>
            <input className="form-control" placeholder="Student name, number, or document type..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
            <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Released">Released</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button className="btn-cancel" style={{ padding: '9px 16px', height: 38 }}
            onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear</button>
        </div>
      </div>

      <div className="card">
        <p className="section-title">Requests ({filtered.length})</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student</th>
                <th>Document</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No requests found.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.request_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>
                    REQ-{String(r.request_id).padStart(4, '0')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{r.student_name}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{r.student_number}</div>
                  </td>
                  <td>{r.document_type}</td>
                  <td style={{ textAlign: 'center' }}>{r.quantity}</td>
                  <td>₱{Number(r.amount).toFixed(2)}</td>
                  <td style={{ fontSize: 11, color: '#6b7280' }}>{r.request_date}</td>
                  <td><span className={STATUS_BADGE[r.status] || 'badge'}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <span className="link-view" onClick={() => setSelected(r)}>View</span>
                      {r.status === 'Pending' && (
                        <button style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: '#dbeafe', color: '#1d4ed8', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          disabled={saving === r.request_id}
                          onClick={() => handleStatus(r.request_id, 'Processing')}>Process</button>
                      )}
                      {r.status === 'Processing' && (
                        <button style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          disabled={saving === r.request_id}
                          onClick={() => handleStatus(r.request_id, 'Released')}>Release</button>
                      )}
                      {['Pending','Processing'].includes(r.status) && (
                        <button style={{ fontSize: 11, padding: '3px 8px', borderRadius: 5, background: '#fee2e2', color: '#991b1b', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          disabled={saving === r.request_id}
                          onClick={() => handleStatus(r.request_id, 'Cancelled')}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Request Details</span>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              {[
                ['Request ID',     `REQ-${String(selected.request_id).padStart(4,'0')}`],
                ['Student',        selected.student_name],
                ['Student No.',    selected.student_number],
                ['Document Type',  selected.document_type],
                ['Quantity',       selected.quantity],
                ['Amount',         `₱${Number(selected.amount).toFixed(2)}`],
                ['Payment Method', selected.payment_method],
                ['Purpose',        selected.purpose || '—'],
                ['Status',         selected.status],
                ['Request Date',   selected.request_date],
                ['Release Date',   selected.release_date || '—'],
              ].map(([l,v]) => (
                <div className="modal-detail-row" key={l}>
                  <span className="modal-detail-label">{l}</span>
                  <span className="modal-detail-value">{v}</span>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" style={{ width: 'auto', padding: '8px 20px' }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
