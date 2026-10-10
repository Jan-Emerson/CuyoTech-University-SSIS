import { useEffect, useState } from 'react';
import { getClearance } from '../api/api.js';

export default function ClearancePage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getClearance()
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="card" style={{ color: '#dc2626' }}>{error}</div>;

  const cleared = items.filter(i => i.status === 'Cleared').length;
  const pct     = items.length ? Math.round((cleared / items.length) * 100) : 0;

  return (
    <div>
      <h1 className="page-title">Clearance Status</h1>
      <p className="page-subtitle">1st Semester AY 2024–2025</p>

      <div className="card progress-bar-wrap" style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
            {cleared} of {items.length} departments cleared
          </span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>{pct}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="card">
        <p className="section-title">Department Clearances</p>
        <div className="clearance-list">
          {items.map((item, i) => (
            <div key={i} className={`clearance-item ${item.status === 'Cleared' ? 'cleared' : 'pending'}`}>
              <div>
                <p className="clearance-dept">{item.department_name}</p>
                {item.cleared_by && (
                  <p className="clearance-by">Cleared by {item.cleared_by} · {item.cleared_date}</p>
                )}
              </div>
              <span className={`badge ${item.status === 'Cleared' ? 'badge-cleared' : 'badge-pending'}`}>
                {item.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
