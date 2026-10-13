import { useEffect, useState } from 'react';
import { getAllGradesForRegistrar, encodeGrade } from '../../api/api.js';

const REMARKS_OPTIONS = ['PASSED', 'FAILED', 'INC', 'DRP'];

export default function GradesEncoding() {
  const [grades,  setGrades]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [editing, setEditing] = useState(null); // grade_id being edited
  const [form,    setForm]    = useState({});
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState('');

  useEffect(() => {
    getAllGradesForRegistrar().then(setGrades).finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  function startEdit(g) {
    setEditing(g.grade_id);
    setForm({ midterm: g.midterm ?? '', finals: g.finals ?? '', final_grade: g.final_grade ?? '', remarks: g.remarks ?? 'PASSED' });
  }

  async function saveGrade(grade_id) {
    setSaving(true);
    await encodeGrade(grade_id, {
      midterm:     Number(form.midterm),
      finals:      Number(form.finals),
      final_grade: form.final_grade,
      remarks:     form.remarks,
    });
    setGrades(prev => prev.map(g => g.grade_id === grade_id ? { ...g, ...form, midterm: Number(form.midterm), finals: Number(form.finals) } : g));
    setEditing(null);
    setSaving(false);
    showToast('Grade saved successfully.');
  }

  const filtered = grades.filter(g =>
    !search ||
    (g.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.student_number || '').includes(search) ||
    g.subject_code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Grades Encoding</h1>
      <p className="page-subtitle">Encode and update student grades</p>

      {toast && <div className="alert-success">✓ {toast}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <input className="form-control" placeholder="Search by student name, number, or subject..."
          value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 360 }} />
      </div>

      <div className="card">
        <p className="section-title">Grade Records ({filtered.length})</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student No.</th>
                <th>Student Name</th>
                <th>Subject Code</th>
                <th>Subject Name</th>
                <th>Midterm</th>
                <th>Finals</th>
                <th>Final Grade</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => (
                <tr key={g.grade_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{g.student_number}</td>
                  <td style={{ fontWeight: 600 }}>{g.student_name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>{g.subject_code}</td>
                  <td style={{ fontSize: 12 }}>{g.subject_name}</td>

                  {editing === g.grade_id ? (
                    <>
                      <td><input type="number" className="form-control" style={{ width: 64, padding: '4px 6px' }}
                          value={form.midterm} onChange={e => setForm(f => ({ ...f, midterm: e.target.value }))} /></td>
                      <td><input type="number" className="form-control" style={{ width: 64, padding: '4px 6px' }}
                          value={form.finals} onChange={e => setForm(f => ({ ...f, finals: e.target.value }))} /></td>
                      <td><input type="text" className="form-control" style={{ width: 72, padding: '4px 6px' }}
                          placeholder="e.g. 1.50"
                          value={form.final_grade} onChange={e => setForm(f => ({ ...f, final_grade: e.target.value }))} /></td>
                      <td>
                        <select className="form-control" style={{ padding: '4px 6px' }}
                          value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}>
                          {REMARKS_OPTIONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#1a2340', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                            disabled={saving} onClick={() => saveGrade(g.grade_id)}>
                            {saving ? '...' : 'Save'}
                          </button>
                          <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer' }}
                            onClick={() => setEditing(null)}>Cancel</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ textAlign: 'center' }}>{g.midterm ?? <span className="text-muted">—</span>}</td>
                      <td style={{ textAlign: 'center' }}>{g.finals  ?? <span className="text-muted">—</span>}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: g.final_grade ? '#1a2340' : '#9ca3af' }}>
                        {g.final_grade ?? '—'}
                      </td>
                      <td>
                        {g.remarks
                          ? <span className={`badge ${g.remarks === 'PASSED' ? 'badge-released' : 'badge-pending'}`}>{g.remarks}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <span className="link-view" onClick={() => startEdit(g)}>Edit</span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
