import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPayments } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CashierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPayments().then(payments => {
      setStats({
        total:   payments.length,
        paid:    payments.filter(p => p.status === 'Paid').length,
        pending: payments.filter(p => p.status === 'Pending').length,
        revenue: payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0),
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-welcome-title">Cashier Dashboard</h1>
        <p className="dashboard-welcome-sub">Welcome, {user?.full_name} — {user?.dept}</p>
      </div>

      <div className="stat-row">
        <div className="stat-card blue">
          <span className="stat-card-label">Total Records</span>
          <span className="stat-card-value">{stats.total}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">Paid</span>
          <span className="stat-card-value">{stats.paid}</span>
        </div>
        <div className="stat-card yellow">
          <span className="stat-card-label">Pending</span>
          <span className="stat-card-value">{stats.pending}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">Total Revenue</span>
          <span className="stat-card-value" style={{ fontSize: 16 }}>₱{stats.revenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions-row">
          <button className="btn-action blue" onClick={() => navigate('/cashier/payments')}>Payment Records</button>
          <button className="btn-action teal" onClick={() => navigate('/cashier/fees')}>Fee Schedule</button>
        </div>
      </div>
    </div>
  );
}
