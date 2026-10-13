import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStudents, getAllEnrollments, getAllDocumentRequests, getAllGradesForRegistrar } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, enrollments: 0, pendingDocs: 0, pendingGrades: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllStudents(), getAllEnrollments(), getAllDocumentRequests(), getAllGradesForRegistrar()])
      .then(([students, enrollments, docs, grades]) => {
        setStats({
          students:     students.length,
          enrollments:  enrollments.filter(e => e.status === 'Enrolled').length,
          pendingDocs:  docs.filter(d => d.status === 'Pending').length,
          pendingGrades: grades.filter(g => !g.final_grade).length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-welcome-title">Registrar Dashboard</h1>
        <p className="dashboard-welcome-sub">Welcome, {user?.full_name} — {user?.dept}</p>
      </div>

      <div className="stat-row">
        <div className="stat-card blue">
          <span className="stat-card-label">Total Students</span>
          <span className="stat-card-value">{stats.students}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">Enrolled</span>
          <span className="stat-card-value">{stats.enrollments}</span>
        </div>
        <div className="stat-card yellow">
          <span className="stat-card-label">Pending Doc Requests</span>
          <span className="stat-card-value">{stats.pendingDocs}</span>
        </div>
        <div className="stat-card red">
          <span className="stat-card-label">Grades to Encode</span>
          <span className="stat-card-value">{stats.pendingGrades}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <p className="section-title">Quick Actions</p>
        <div className="quick-actions-row">
          <button className="btn-action blue"   onClick={() => navigate('/registrar/students')}>Student List</button>
          <button className="btn-action dark"   onClick={() => navigate('/registrar/enrollment')}>Enrollment</button>
          <button className="btn-action teal"   onClick={() => navigate('/registrar/grades')}>Encode Grades</button>
          <button className="btn-action purple" onClick={() => navigate('/registrar/documents')}>Doc Requests</button>
        </div>
      </div>
    </div>
  );
}
