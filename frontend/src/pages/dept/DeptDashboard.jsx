import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClearanceForDept } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function DeptDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]   = useState({ total: 0, cleared: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClearanceForDept().then(items => {
      setStats({
        total:   items.length,
        cleared: items.filter(i => i.status === 'Cleared').length,
        pending: items.filter(i => i.status === 'Pending').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-welcome-title">{user?.dept} — Dashboard</h1>
        <p className="dashboard-welcome-sub">Welcome, {user?.full_name}</p>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="stat-card blue">
          <span className="stat-card-label">Total Requests</span>
          <span className="stat-card-value">{stats.total}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">Cleared</span>
          <span className="stat-card-value">{stats.cleared}</span>
        </div>
        <div className="stat-card yellow">
          <span className="stat-card-label">Pending</span>
          <span className="stat-card-value">{stats.pending}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions-row">
          <button className="btn-action blue" onClick={() => navigate('/dept/clearance')}>
            Manage Clearances
          </button>
        </div>
      </div>

      {stats.pending > 0 && (
        <div className="notice-box" style={{ marginTop: 16 }}>
          <strong>Note:</strong> You have <strong>{stats.pending}</strong> pending clearance request{stats.pending > 1 ? 's' : ''} waiting for your approval.
        </div>
      )}
    </div>
  );
}
