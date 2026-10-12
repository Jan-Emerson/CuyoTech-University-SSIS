import { useEffect, useState } from 'react';
import { getAllStudents, getCourses } from '../../api/api.js';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([getAllStudents(), getCourses()])
      .then(([s, c]) => { setStudents(s); setCourses(c); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s => {
    const matchSearch = !search ||
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_number.includes(search);
    const matchCourse = !filterCourse || s.course_code === filterCourse;
    const matchStatus = !filterStatus || s.status === filterStatus;
    return matchSearch && matchCourse && matchStatus;
  });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Student List</h1>
      <p className="page-subtitle">Manage and view all enrolled students</p>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-field" style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Search</label>
            <input className="form-control" placeholder="Name or student number..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="form-field" style={{ flex: '0 1 180px' }}>
            <label className="form-label" style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Course</label>
            <select className="form-control" value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.course_code} value={c.course_code}>{c.course_code}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ flex: '0 1 150px' }}>
            <label className="form-label" style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
            <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button className="btn-cancel" style={{ padding: '9px 16px', height: 38 }}
            onClick={() => { setSearch(''); setFilterCourse(''); setFilterStatus(''); }}>
            Clear
          </button>
        </div>
      </div>

      <div className="card">
        <p className="section-title">Students ({filtered.length})</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Student No.</th>
              <th>Full Name</th>
              <th>Course</th>
              <th>Year</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No students found.</td></tr>
            ) : filtered.map(s => (
              <tr key={s.student_id}>
                <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{s.student_number}</td>
                <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                <td>{s.course_code}</td>
                <td style={{ textAlign: 'center' }}>{s.year_level}</td>
                <td style={{ fontSize: 11, color: '#6b7280' }}>{s.email}</td>
                <td>
                  <span className={`badge ${s.status === 'Active' ? 'badge-released' : 'badge-cancelled'}`}>
                    {s.status}
                  </span>
                </td>
                <td>
                  <span className="link-view" onClick={() => setSelected(s)}>View</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Student Details</span>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              {[
                ['Student Number', selected.student_number],
                ['Full Name',      selected.full_name],
                ['Course',         selected.course_name],
                ['Year Level',     `${selected.year_level}`],
                ['Email',          selected.email],
                ['Contact',        selected.contact_number || '—'],
                ['Address',        selected.address || '—'],
                ['Status',         selected.status],
              ].map(([l, v]) => (
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
