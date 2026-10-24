import { useEffect, useState } from 'react';
import { getAllPayments, confirmPayment, addPayment, getCashierStudents } from '../../api/api.js';

const STATUS_BADGE = {
  Paid:    'badge badge-released',
  Pending: 'badge badge-pending',
};

export default function PaymentRecords() {
  const [payments, setPayments]       = useState([]);
  const [students, setStudents]       = useState([]);
  const [loading,  setLoading]        = useState(true);
  const [search,   setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [saving,   setSaving]         = useState(null);
  const [toast,    setToast]          = useState('');
  const [showAdd,  setShowAdd]        = useState(false);
  const [orInput,  setOrInput]        = useState({});   // payment_id -> OR string
  const [newForm,  setNewForm]        = useState({ student_id: '', description: '', amount: '', method: 'Cash' });
  const [adding,   setAdding]         = useState(false);

  useEffect(() => {
    Promise.all([getAllPayments(), getCashierStudents()])
      .then(([p, s]) => { setPayments(p); setStudents(s); })
      .catch(err => setToast(err.message))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3500); }

  async function handleConfirm(payment_id) {
    const or = orInput[payment_id]?.trim();
    if (!or) { showToast('Please enter an OR number first.'); return; }
    setSaving(payment_id);
    try {
      await confirmPayment(payment_id, or);
      setPayments(prev => prev.map(p => p.payment_id === payment_id
        ? { ...p, status: 'Paid', or_number: or, date: new Date().toISOString().split('T')[0] }
        : p
      ));
      showToast(`Payment confirmed — OR: ${or}`);
    } catch (err) {
      showToast(err.message || 'Failed to confirm payment.');
    } finally {
      setSaving(null);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newForm.student_id || !newForm.description || !newForm.amount) {
      showToast('Please fill in all required fields.'); return;
    }
    setAdding(true);
    try {
      const created = await addPayment(newForm);
      setPayments(prev => [created, ...prev]);
      setNewForm({ student_id: '', description: '', amount: '', method: 'Cash' });
      setShowAdd(false);
      showToast('Payment record added.');
    } catch (err) {
      showToast(err.message || 'Failed to add payment.');
    } finally {
      setAdding(false);
    }
  }

  const filtered = payments.filter(p => {
    const matchSearch = !search ||
      (p.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.student_number || '').includes(search) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalFiltered = filtered.reduce((s, p) => s + (p.status === 'Paid' ? p.amount : 0), 0);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Payment Records</h1>
      <p className="page-subtitle">Manage and confirm student fee payments</p>

      {toast && <div className="alert-success">✓ {toast}</div>}

      {/* Filters + Add */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Search</label>
            <input className="form-control" placeholder="Student name, number, or description..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ flex: '0 1 150px' }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Status</label>
            <select className="form-control" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <button className="btn-cancel" style={{ padding: '9px 16px', height: 38 }}
            onClick={() => { setSearch(''); setFilterStatus(''); }}>Clear</button>
          <button className="btn-submit" style={{ padding: '9px 18px', height: 38 }}
            onClick={() => setShowAdd(v => !v)}>
            {showAdd ? 'Cancel' : '+ Add Payment'}
          </button>
        </div>

        {/* Inline Add Form */}
        {showAdd && (
          <form onSubmit={handleAdd} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 12 }}>New Payment Record</p>
            <div className="form-row">
              <div className="form-field">
                <label>Student <span className="required">*</span></label>
                <select className="form-control" value={newForm.student_id}
                  onChange={e => setNewForm(f => ({ ...f, student_id: e.target.value }))}>
                  <option value="">— Select Student —</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.student_number} — {s.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Description <span className="required">*</span></label>
                <input className="form-control" placeholder="e.g. Tuition Fee"
                  value={newForm.description} onChange={e => setNewForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Amount <span className="required">*</span></label>
                <input type="number" className="form-control" placeholder="0.00"
                  value={newForm.amount} onChange={e => setNewForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Payment Method</label>
                <select className="form-control" value={newForm.method}
                  onChange={e => setNewForm(f => ({ ...f, method: e.target.value }))}>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-submit" style={{ padding: '9px 24px' }} disabled={adding}>
              {adding ? 'Adding...' : 'Add Record'}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p className="section-title" style={{ marginBottom: 0 }}>Records ({filtered.length})</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
            Collected: ₱{totalFiltered.toLocaleString()}
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>OR No.</th>
                <th>Student</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>No records found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.payment_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{p.or_number || '—'}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{p.student_name}</div>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{p.student_number}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{p.description}</td>
                  <td style={{ fontWeight: 600 }}>₱{p.amount.toLocaleString()}</td>
                  <td style={{ fontSize: 11 }}>{p.method}</td>
                  <td style={{ fontSize: 11, color: '#6b7280' }}>{p.date}</td>
                  <td><span className={STATUS_BADGE[p.status] || 'badge'}>{p.status}</span></td>
                  <td>
                    {p.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <input
                          className="form-control"
                          style={{ width: 90, padding: '3px 6px', fontSize: 11 }}
                          placeholder="OR No."
                          value={orInput[p.payment_id] || ''}
                          onChange={e => setOrInput(prev => ({ ...prev, [p.payment_id]: e.target.value }))}
                        />
                        <button
                          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 5, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}
                          disabled={saving === p.payment_id}
                          onClick={() => handleConfirm(p.payment_id)}>
                          {saving === p.payment_id ? '...' : 'Confirm'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓ Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
