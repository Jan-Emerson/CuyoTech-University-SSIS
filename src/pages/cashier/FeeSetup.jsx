import { useEffect, useState } from 'react';
import { getFeeSchedule, updateFee } from '../../api/api.js';

export default function FeeSetup() {
  const [fees,    setFees]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState('');
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    getFeeSchedule().then(setFees).finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  async function handleSave(fee_id) {
    if (!editVal || isNaN(Number(editVal))) { showToast('Please enter a valid amount.'); return; }
    setSaving(true);
    await updateFee(fee_id, editVal);
    setFees(prev => prev.map(f => f.fee_id === fee_id ? { ...f, amount: Number(editVal) } : f));
    setEditing(null);
    setEditVal('');
    setSaving(false);
    showToast('Fee updated successfully.');
  }

  const totalFees = fees.reduce((s, f) => s + f.amount, 0);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Fee Schedule</h1>
      <p className="page-subtitle">View and update the school fee schedule</p>

      {toast && <div className="alert-success">✓ {toast}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 18, alignItems: 'start' }}>
        {/* Fee table */}
        <div className="card">
          <p className="section-title">Current Fee Schedule</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Fee Name</th>
                <th>Per</th>
                <th>Applicable To</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.fee_id}>
                  <td style={{ color: '#9ca3af', fontSize: 11 }}>{f.fee_id}</td>
                  <td style={{ fontWeight: 600 }}>{f.fee_name}</td>
                  <td style={{ fontSize: 11, textTransform: 'capitalize' }}>{f.per}</td>
                  <td style={{ fontSize: 11 }}>{f.applicable_to}</td>
                  <td>
                    {editing === f.fee_id ? (
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ color: '#6b7280', fontSize: 12 }}>₱</span>
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: 90, padding: '4px 6px' }}
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span style={{ fontWeight: 700, color: '#1a1a2e' }}>₱{f.amount.toLocaleString()}</span>
                    )}
                  </td>
                  <td>
                    {editing === f.fee_id ? (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button
                          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#1a2340', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          disabled={saving} onClick={() => handleSave(f.fee_id)}>
                          {saving ? '...' : 'Save'}
                        </button>
                        <button
                          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer' }}
                          onClick={() => { setEditing(null); setEditVal(''); }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="link-view" onClick={() => { setEditing(f.fee_id); setEditVal(String(f.amount)); }}>
                        Edit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary card */}
        <div className="card">
          <p className="section-title">Summary</p>
          {fees.map(f => (
            <div key={f.fee_id} className="modal-detail-row">
              <span className="modal-detail-label">{f.fee_name}</span>
              <span className="modal-detail-value">₱{f.amount.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, padding: '12px', background: '#1a2340', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#a8b4cc', fontWeight: 600 }}>Total per Semester</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>₱{totalFees.toLocaleString()}</span>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 10, lineHeight: 1.5 }}>
            Changes apply to the next billing cycle. Contact the Finance Office for major adjustments.
          </p>
        </div>
      </div>
    </div>
  );
}
