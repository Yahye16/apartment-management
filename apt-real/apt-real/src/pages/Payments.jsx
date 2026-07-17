import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as paymentService from '../services/paymentService';
import * as leaseService from '../services/leaseService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = {
  leaseId: '',
  amount: '',
  paymentDate: '',
  paymentMethod: '',
  paymentStatus: 'PAID',
};

export default function Payments() {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [balanceNotice, setBalanceNotice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [paymentList, leaseList] = await Promise.all([
        paymentService.getPayments(),
        leaseService.getLeases(),
      ]);
      setPayments(paymentList);
      setLeases(leaseList);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load payments.'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowForm(true);
  }

  function openEditForm(payment) {
    setEditingId(payment.id);
    setForm({
      leaseId: String(payment.lease?.id ?? ''),
      amount: String(payment.amount),
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod || '',
      paymentStatus: payment.paymentStatus,
    });
    setFormErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const errs = {};
    if (!editingId && !form.leaseId) errs.leaseId = 'Lease is required';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Amount must be greater than 0';
    if (!form.paymentDate) errs.paymentDate = 'Payment date is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      amount: Number(form.amount),
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
    };

    setSaving(true);
    try {
      let saved;
      if (editingId) {
        saved = await paymentService.updatePayment(editingId, payload);
      } else {
        saved = await paymentService.createPayment(form.leaseId, payload);
      }
      closeForm();
      await loadData();

      const lease = saved.lease;
      if (lease && lease.monthlyRent != null) {
        const rent = Number(lease.monthlyRent);
        const paid = Number(saved.amount);
        if (paid > rent) {
          setBalanceNotice({
            type: 'success',
            text: `Overpayment of $${(paid - rent).toFixed(2)} has been saved as credit on this lease.`,
          });
        } else if (paid < rent) {
          setBalanceNotice({
            type: 'warning',
            text: `Underpayment: $${(rent - paid).toFixed(2)} still remains owed on this lease.`,
          });
        } else {
          setBalanceNotice({ type: 'success', text: 'Payment recorded — rent fully paid.' });
        }
      }
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this payment.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this payment? This cannot be undone.')) return;
    try {
      await paymentService.deletePayment(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this payment.'));
    }
  }

  if (loading) return <LoadingState message="Loading payments..." />;

  function leaseLabel(lease) {
    return `${lease.tenant?.fullName || 'Tenant'} - ${lease.unit?.unitNumber || 'Unit'}`;
  }

  const q = search.trim().toLowerCase();
  const filteredPayments = !q
    ? payments
    : payments.filter((p) =>
        [
          p.lease?.tenant?.fullName,
          p.lease?.unit?.unitNumber,
          p.paymentMethod,
          p.paymentStatus,
        ]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Payments</h1>
        <button className="btn btn-primary" onClick={openCreateForm} disabled={leases.length === 0}>
          + New Payment
        </button>
      </div>

      {payments.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search payments by tenant, unit, or method..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}
      {leases.length === 0 && (
        <div className="form-error-banner">Create a lease first before recording a payment.</div>
      )}
      {balanceNotice && (
        <div
          className={balanceNotice.type === 'warning' ? 'form-error-banner' : 'form-success-banner'}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>{balanceNotice.text}</span>
          <button
            type="button"
            onClick={() => setBalanceNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {payments.length === 0 ? (
        <EmptyState title="No payments yet" message="Record the first rent payment." />
      ) : filteredPayments.length === 0 ? (
        <EmptyState title="No matches" message="No payments match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Lease</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.lease ? leaseLabel(payment.lease) : '-'}</td>
                  <td>${payment.amount}</td>
                  <td>{payment.paymentDate}</td>
                  <td>{payment.paymentMethod || '-'}</td>
                  <td><StatusBadge status={payment.paymentStatus} /></td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditForm(payment)}>Edit</button>{' '}
                    {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(payment.id)}>Delete</button>
                  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Payment' : 'New Payment'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {!editingId && (
                <div className="form-group">
                  <label htmlFor="leaseId">Lease</label>
                  <select id="leaseId" name="leaseId" value={form.leaseId} onChange={handleChange}>
                    <option value="">Select a lease</option>
                    {leases.map((lease) => (
                      <option key={lease.id} value={lease.id}>{leaseLabel(lease)}</option>
                    ))}
                  </select>
                  {formErrors.leaseId && <div className="field-error">{formErrors.leaseId}</div>}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount</label>
                  <input id="amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} />
                  {formErrors.amount && <div className="field-error">{formErrors.amount}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="paymentDate">Payment Date</label>
                  <input id="paymentDate" name="paymentDate" type="date" value={form.paymentDate} onChange={handleChange} />
                  {formErrors.paymentDate && <div className="field-error">{formErrors.paymentDate}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method</label>
                  <input id="paymentMethod" name="paymentMethod" placeholder="e.g. Cash, Bank Transfer" value={form.paymentMethod} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentStatus">Status</label>
                  <select id="paymentStatus" name="paymentStatus" value={form.paymentStatus} onChange={handleChange}>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}