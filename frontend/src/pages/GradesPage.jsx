import { useEffect, useState } from 'react';
import { getGrades } from '../api/api.js';

function gradeColor(grade) {
  const g = parseFloat(grade);
  if (g <= 1.5)  return '#16a34a';
  if (g <= 2.0)  return '#2563eb';
  if (g <= 2.5)  return '#d97706';
  return '#dc2626';
}

export default function GradesPage() {
  const [grades, setGrades]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getGrades()
      .then(setGrades)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (error)   return <div className="card" style={{ color: '#dc2626' }}>{error}</div>;

  const totalUnits = grades.reduce((s, g) => s + (g.units || 0), 0);
  const gradedRows = grades.filter(g => g.final_grade);
  const gwa = gradedRows.length
    ? (gradedRows.reduce((s, g) => s + parseFloat(g.final_grade) * g.units, 0) /
       gradedRows.reduce((s, g) => s + g.units, 0)).toFixed(2)
    : 'N/A';

  return (
    <div>
      <h1 className="page-title">Grades per Semester</h1>
      <p className="page-subtitle">1st Semester AY 2024–2025</p>

      <div className="grades-summary">
        <div className="stat-card blue">
          <span className="stat-card-label">Total Units</span>
          <span className="stat-card-value">{totalUnits}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">GWA</span>
          <span className="stat-card-value">{gwa}</span>
        </div>
        <div className="stat-card green">
          <span className="stat-card-label">Subjects Passed</span>
          <span className="stat-card-value">
            {grades.filter(g => g.remarks === 'PASSED').length}/{grades.length}
          </span>
        </div>
      </div>

      <div className="card">
        <p className="section-title">Grade Report</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject Code</th>
              <th>Subject Name</th>
              <th>Units</th>
              <th>Midterm</th>
              <th>Finals</th>
              <th>Final Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(g => (
              <tr key={g.subject_code}>
                <td style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>{g.subject_code}</td>
                <td>{g.subject_name}</td>
                <td style={{ textAlign: 'center' }}>{g.units}</td>
                <td style={{ textAlign: 'center' }}>{g.midterm ?? '—'}</td>
                <td style={{ textAlign: 'center' }}>{g.finals ?? '—'}</td>
                <td style={{ textAlign: 'center', fontWeight: 700, color: gradeColor(g.final_grade) }}>
                  {g.final_grade ?? '—'}
                </td>
                <td>
                  <span className={`badge ${g.remarks === 'PASSED' ? 'badge-released' : 'badge-cancelled'}`}>
                    {g.remarks || '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
