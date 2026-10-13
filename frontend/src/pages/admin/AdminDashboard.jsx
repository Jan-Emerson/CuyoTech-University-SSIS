import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts().then(accounts => {
      const c = {};
      accounts.forEach(a => { c[a.role] = (c[a.role] || 0) + 1; });
      setCounts(c);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const roleInfo = [
    { role: 'student',    label: 'Students',       color: 'blue'   },
    { role: 'registrar',  label: 'Registrar Staff', color: 'green'  },
    { role: 'cashier',    label: 'Cashier Staff',   color: 'yellow' },
    { role: 'dept_staff', label: 'Dept Staff',      color: 'red'    },
    { role: 'admin',      label: 'Admins',          color: 'blue'   },
  ];

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-welcome-title">Admin Dashboard</h1>
        <p className="dashboard-welcome-sub">Welcome, {user?.full_name} — System Administrator</p>
      </div>

      <div className="stat-row">
        {roleInfo.map(r => (
          <div key={r.role} className={`stat-card ${r.color}`}>
            <span className="stat-card-label">{r.label}</span>
            <span className="stat-card-value">{counts[r.role] || 0}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions-row">
          <button className="btn-action blue"   onClick={() => navigate('/admin/users')}>Manage Users</button>
        </div>
      </div>
    </div>
  );
}
