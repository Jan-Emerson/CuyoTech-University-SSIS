import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getDocuments, getDocumentTypes, submitDocument } from '../api/api.js';

function StatusBadge({ status }) {
  const cls = {
    Pending:    'badge badge-pending',
    Processing: 'badge badge-processing',
    Released:   'badge badge-released',
    Cancelled:  'badge badge-cancelled',
  }[status] || 'badge';
  return <span className={cls}>{status}</span>;
}

function RequestDetailModal({ request, onClose }) {
  if (!request) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Request Details</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="modal-body">
          {[
            ['Request ID',     `REQ-${String(request.request_id).padStart(4, '0')}`],
            ['Document Type',  request.document_type],
            ['Quantity',       request.quantity],
            ['Payment Method', request.payment_method],
            ['Amount',         `₱${Number(request.amount).toFixed(2)}`],
            ['Status',         request.status],
            ['Request Date',   request.request_date],
            ['Release Date',   request.release_date || '—'],
          ].map(([label, value]) => (
            <div className="modal-detail-row" key={label}>
              <span className="modal-detail-label">{label}</span>
              <span className="modal-detail-value">{value}</span>
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" style={{ width: 'auto', padding: '8px 20px' }} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_METHODS = ['Cash', 'Online'];

export default function DocumentRequestPage() {
  const { user } = useAuth();

  const [docTypes, setDocTypes]         = useState([]);
  const [requests, setRequests]         = useState([]);
  const [loadingData, setLoadingData]   = useState(true);

  const [docType, setDocType]           = useState('');
  const [qty, setQty]                   = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState('');
  const [formError, setFormError]       = useState('');
  const [selectedReq, setSelectedReq]   = useState(null);

  useEffect(() => {
    Promise.all([getDocumentTypes(), getDocuments()])
      .then(([types, reqs]) => { setDocTypes(types); setRequests(reqs); })
      .catch(console.error)
      .finally(() => setLoadingData(false));
  }, []);

  const selectedType = docTypes.find(d => d.value === docType);
  const unitPrice    = selectedType ? selectedType.price : 0;
  const totalAmount  = unitPrice * qty;

  function handleQtyChange(delta) {
    setQty(prev => Math.max(1, Math.min(10, prev + delta)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    if (!docType) { setFormError('Please select a document type.'); return; }

    setSubmitting(true);
    try {
      const newReq = await submitDocument({ document_type: docType, quantity: qty, payment_method: paymentMethod, purpose: '' });
      setRequests(prev => [newReq, ...prev]);
      setSuccess('Request submitted successfully!');
      setDocType('');
      setQty(1);
      setPaymentMethod('Cash');
    } catch (err) {
      setFormError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingData) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Document Request Page</h1>
      <p className="page-subtitle">Student Services Information System (SSIS)</p>

      {success && <div className="alert-success">✓ {success}</div>}

      <div className="docreq-grid">
        {/* Form */}
        <div className="card">
          <p className="card-title">New Document Request</p>
          {formError && <div className="alert-error">{formError}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field">
                <label>Student ID <span className="required">*</span></label>
                <input type="text" className="form-control" value={user?.student_number || ''} readOnly
                  style={{ background: '#f9fafb', color: '#6b7280' }} aria-label="Student ID" />
              </div>
              <div className="form-field">
                <label>Document Type <span className="required">*</span></label>
                <select className="form-control" value={docType} onChange={e => setDocType(e.target.value)} aria-label="Document Type">
                  <option value="">Select Document</option>
                  {docTypes.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Quantity <span className="required">*</span></label>
                <div className="qty-stepper">
                  <button type="button" className="qty-btn" onClick={() => handleQtyChange(-1)} aria-label="Decrease">−</button>
                  <input type="number" className="qty-display" value={qty} min={1} max={10}
                    onChange={e => setQty(Math.max(1, Math.min(10, Number(e.target.value))))} aria-label="Quantity" />
                  <button type="button" className="qty-btn" onClick={() => handleQtyChange(1)} aria-label="Increase">+</button>
                </div>
              </div>
              <div className="form-field">
                <label>Payment Method</label>
                <select className="form-control" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} aria-label="Payment Method">
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Summary */}
        <div className="summary-card">
          <p className="card-title">Request Summary</p>
          <div className="summary-row">
            <span className="summary-label">Document</span>
            <span className="summary-value">{selectedType ? selectedType.value : '—'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Quantity</span>
            <span className="summary-value">{qty}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Fee per copy</span>
            <span className="summary-value">{selectedType ? `₱${unitPrice.toFixed(2)}` : '—'}</span>
          </div>
          <hr className="summary-divider" />
          <div className="summary-total-row">
            <span className="summary-total-label">Total Amount</span>
            <span className="summary-total-value">₱{totalAmount.toFixed(2)}</span>
          </div>
          <div className="summary-btn-row">
            <button type="button" className="btn-cancel"
              onClick={() => { setDocType(''); setQty(1); setFormError(''); setSuccess(''); }}>
              Cancel
            </button>
            <button type="button" className="btn-submit" disabled={submitting || !docType} onClick={handleSubmit}>
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <p className="section-title">My Document Requests</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Document</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Request Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>No document requests yet.</td></tr>
            ) : (
              requests.map(r => (
                <tr key={r.request_id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                    REQ-{String(r.request_id).padStart(4, '0')}
                  </td>
                  <td>{r.document_type}</td>
                  <td style={{ textAlign: 'center' }}>{r.quantity}</td>
                  <td>₱{Number(r.amount).toFixed(2)}</td>
                  <td className="text-muted">{r.request_date}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td><span className="link-view" onClick={() => setSelectedReq(r)}>View Details</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedReq && <RequestDetailModal request={selectedReq} onClose={() => setSelectedReq(null)} />}
    </div>
  );
}
