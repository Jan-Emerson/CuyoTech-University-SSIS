import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/api.js';

function StatusBadge({ status }) {
  const cls = {
    Pending:    'badge badge-pending',
    Processing: 'badge badge-processing',
    Released:   'badge badge-released',
    Cancelled:  'badge badge-cancelled',
  }[status] || 'badge';
  return <span className={cls}>{status}</span>;
}

function RequestDetailModal({ request, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Request Details</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          {[
            ['Request ID',    `REQ-${String(request.request_id).padStart(4, '0')}`],
            ['Document Type', request.document_type],
            ['Status',        request.status],
            ['Request Date',  request.request_date],
          ].map(([label, value]) => (
            <div className="modal-detail-row" key={label}>
              <span className="modal-detail-label">{label}</span>
              <span className="modal-detail-value">{value}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" style={{ width: 'auto', padding: '8px 20px' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="card" style={{ color: '#dc2626' }}>Failed to load dashboard: {error}</div>;

  const { total_units, gwa, pending_docs, clearance_status, feed } = data;

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-welcome-title">Welcome to SSIS!</h1>
        <p className="dashboard-welcome-sub">University of CuyoTech Student Services Information System (SSIS)</p>
      </div>

      {/* Stat cards */}
      <div className="stat-row">
        <div className="stat-card blue">
          <span className="stat-card-label">Units</span>
          <span className="stat-card-value">{total_units}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">GWA</span>
          <span className="stat-card-value">{gwa}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">Status</span>
          <span className="stat-card-value" style={{ fontSize: '15px' }}>{clearance_status}</span>
        </div>
        <div className="stat-card yellow">
          <span className="stat-card-label">Pending</span>
          <span className="stat-card-value">{pending_docs}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '18px' }}>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions-row">
          <button className="btn-action blue"   onClick={() => navigate('/document-request')}>Request Document</button>
          <button className="btn-action dark"   onClick={() => navigate('/clearance')}>Track Clearance</button>
          <button className="btn-action teal"   onClick={() => navigate('/payment')}>Pay Fees</button>
          <button className="btn-action purple" onClick={() => navigate('/profile')}>Manage Profile</button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <p className="section-title">Activity Feed</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Document</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feed && feed.length > 0 ? (
              feed.map(row => (
                <tr key={row.request_id} style={{ cursor: 'pointer' }} onClick={() => setSelected(row)}>
                  <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                    REQ-{String(row.request_id).padStart(4, '0')}
                  </td>
                  <td>{row.document_type}</td>
                  <td><StatusBadge status={row.status} /></td>
                  <td className="text-muted">{row.request_date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
                  No recent activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <RequestDetailModal request={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
