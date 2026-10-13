import { useEffect, useState } from 'react';

const FEES = [
  { id: 1, description: 'Tuition Fee',           amount: 12500.00, due: '2024-09-01', paid: true  },
  { id: 2, description: 'Miscellaneous Fee',      amount: 1500.00,  due: '2024-09-01', paid: true  },
  { id: 3, description: 'Laboratory Fee',         amount: 800.00,   due: '2024-09-15', paid: false },
  { id: 4, description: 'Library Fee',            amount: 300.00,   due: '2024-09-15', paid: false },
  { id: 5, description: 'Student Activity Fund',  amount: 200.00,   due: '2024-09-15', paid: false },
];

export default function PaymentPage() {
  const [fees]                      = useState(FEES);
  const [payMethod, setPayMethod]   = useState('Cash');
  const [paying, setPaying]         = useState(false);
  const [paid, setPaid]             = useState(false);
  const [receipt, setReceipt]       = useState(null);

  const unpaidFees  = fees.filter(f => !f.paid);
  const paidFees    = fees.filter(f => f.paid);
  const totalUnpaid = unpaidFees.reduce((s, f) => s + f.amount, 0);
  const totalPaid   = paidFees.reduce((s, f)   => s + f.amount, 0);

  async function handlePay() {
    if (unpaidFees.length === 0) return;
    setPaying(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1200));
    setPaying(false);
    setPaid(true);
    setReceipt({
      refNo:    `OR-${Date.now().toString().slice(-8)}`,
      date:     new Date().toLocaleDateString('en-PH'),
      method:   payMethod,
      amount:   totalUnpaid,
    });
  }

  return (
    <div>
      <h1 className="page-title">Pay Fees</h1>
      <p className="page-subtitle">School Year 2024–2025 | 1st Semester</p>

      {/* Payment success banner */}
      {paid && receipt && (
        <div className="payment-success-banner">
          <div className="payment-success-icon">✓</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>Payment Successful!</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
              OR No: <strong>{receipt.refNo}</strong> · {receipt.date} · {receipt.method} · ₱{receipt.amount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="payment-grid">

        {/* Left — Fees breakdown */}
        <div>
          {/* Unpaid fees */}
          {unpaidFees.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <p className="card-title" style={{ color: '#dc2626' }}>Outstanding Fees</p>
              <table className="payment-fees-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidFees.map(f => (
                    <tr key={f.id}>
                      <td>{f.description}</td>
                      <td className="text-muted">{f.due}</td>
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

          {/* Paid fees */}
          {paidFees.length > 0 && (
            <div className="card">
              <p className="card-title" style={{ color: '#16a34a' }}>Paid Fees</p>
              <table className="payment-fees-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paidFees.map(f => (
                    <tr key={f.id}>
                      <td>{f.description}</td>
                      <td className="text-muted">{f.due}</td>
                      <td style={{ textAlign: 'right' }}>₱{f.amount.toFixed(2)}</td>
                      <td><span className="badge badge-released">PAID</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right — Payment method + Pay button */}
        <div className="card">
          <p className="card-title">Payment Method</p>

          <div className="payment-method-options">
            {[
              { value: 'Cash',   label: 'Cash Payment',   sub: 'Pay at the Cashier\'s Office' },
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
            onClick={handlePay}
            disabled={paying || unpaidFees.length === 0 || paid}
          >
            {paying
              ? 'Processing...'
              : paid
              ? 'Payment Complete ✓'
              : `Pay ₱${totalUnpaid.toFixed(2)}`
            }
          </button>

          {unpaidFees.length === 0 && !paid && (
            <p style={{ fontSize: 12, color: '#16a34a', textAlign: 'center', marginTop: 10 }}>
              ✓ All fees are settled.
            </p>
          )}

          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
            For concerns, contact the Cashier's Office at cashier@cuyotech.edu.ph
          </p>
        </div>
      </div>
    </div>
  );
}
