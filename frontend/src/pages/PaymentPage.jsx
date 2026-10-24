import { useEffect, useState } from 'react';
import { getMyPayments, setPaymentMethod } from '../api/api.js';

export default function PaymentPage() {
  const [fees, setFees]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(null); // { method, amount }

  useEffect(() => {
    getMyPayments()
      .then(rows => {
        setFees(rows);
        const firstPending = rows.find(f => f.status !== 'Paid');
        if (firstPending) setPayMethod(firstPending.method);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const unpaidFees  = fees.filter(f => f.status !== 'Paid');
  const paidFees    = fees.filter(f => f.status === 'Paid');
  const totalUnpaid = unpaidFees.reduce((s, f) => s + f.amount, 0);
  const totalPaid   = paidFees.reduce((s, f) => s + f.amount, 0);

  // The student only chooses HOW they will pay.
  // Fees stay "Pending" until the cashier confirms them with an OR number.
  async function handleSave() {
    if (unpaidFees.length === 0) return;
    setSaving(true);
    setError('');
    try {
      await Promise.all(unpaidFees.map(f => setPaymentMethod(f.payment_id, payMethod)));
      setFees(prev => prev.map(f => f.status === 'Paid' ? f : { ...f, method: payMethod }));
      setSaved({ method: payMethod, amount: totalUnpaid });
    } catch (err) {
      setError(err.message || 'Failed to save payment method.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Pay Fees</h1>
      <p className="page-subtitle">School Year 2024–2025 | 1st Semester</p>

      {error && <div className="alert-error">{error}</div>}

      {saved && (
        <div className="payment-success-banner">
          <div className="payment-success-icon">✓</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Payment method saved!</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              {saved.method === 'Cash'
                ? "Please pay at the Cashier's Office."
                : 'Please complete your online payment.'}{' '}
              Amount: ₱{saved.amount.toFixed(2)}. The cashier will confirm it and issue an OR number.
            </p>
          </div>
        </div>
      )}

      <div className="payment-grid">

        {/* Left — Fees breakdown */}
        <div>
          {unpaidFees.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="card-title" style={{ color: '#dc2626' }}>Outstanding Fees</p>
              <table className="payment-fees-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date Billed</th>
                    <th>Method</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidFees.map(f => (
                    <tr key={f.payment_id}>
                      <td>{f.description}</td>
                      <td className="text-muted">{f.date}</td>
                      <td className="text-muted">{f.method}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>₱{f.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="payment-total-row">
                <span className="payment-total-label">Total Due</span>
                <span className="payment-total-value">₱{totalUnpaid.toFixed(2)}</span>
              </div>
            </div>
          )}

          {paidFees.length > 0 && (
            <div className="card">
              <p className="card-title" style={{ color: '#16a34a' }}>Paid Fees</p>
              <table className="payment-fees-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date Paid</th>
                    <th>OR No.</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidFees.map(f => (
                    <tr key={f.payment_id}>
                      <td>{f.description}</td>
                      <td className="text-muted">{f.date}</td>
                      <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: 11 }}>{f.or_number || '—'}</td>
                      <td style={{ textAlign: 'right' }}>₱{f.amount.toFixed(2)}</td>
                      <td><span className="badge badge-released">PAID</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {fees.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: '#9ca3af' }}>No fees on record.</div>
          )}
        </div>

        {/* Right — Payment method */}
        <div className="card">
          <p className="card-title">Payment Method</p>

          <div className="payment-method-options">
            {[
              { value: 'Cash',   label: 'Cash Payment',   sub: "Pay at the Cashier's Office" },
              { value: 'Online', label: 'Online Payment',  sub: 'GCash / Maya / Bank Transfer'  },
            ].map(m => (
              <label
                key={m.value}
                className={`payment-method-option ${payMethod === m.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  value={m.value}
                  checked={payMethod === m.value}
                  onChange={() => setPayMethod(m.value)}
                />
                <div>
                  <p className="payment-method-label">{m.label}</p>
                  <p className="payment-method-sub">{m.sub}</p>
                </div>
              </label>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Outstanding Balance</span>
              <span className="modal-detail-value">₱{totalUnpaid.toFixed(2)}</span>
            </div>
            <div className="modal-detail-row">
              <span className="modal-detail-label">Already Paid</span>
              <span className="modal-detail-value" style={{ color: '#16a34a' }}>₱{totalPaid.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn-pay"
            onClick={handleSave}
            disabled={saving || unpaidFees.length === 0}
          >
            {saving ? 'Saving...' : `Confirm Method — ₱${totalUnpaid.toFixed(2)}`}
          </button>

          {unpaidFees.length === 0 && fees.length > 0 && (
            <p style={{ fontSize: 12, color: '#16a34a', textAlign: 'center', marginTop: 10 }}>
              ✓ All fees are settled.
            </p>
          )}

          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
            Fees are marked PAID once the Cashier's Office confirms your payment.
            For concerns, contact cashier@cuyotech.edu.ph
          </p>
        </div>
      </div>
    </div>
  );
}
