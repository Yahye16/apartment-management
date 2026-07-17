import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as leaseService from '../services/leaseService';
import * as tenantService from '../services/tenantService';
import * as unitService from '../services/unitService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = {
  tenantId: '',
  unitId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  depositAmount: '',
  leaseStatus: 'ACTIVE',
};

export default function Leases() {
  const { isAdmin } = useAuth();
  const [leases, setLeases] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [fixingBalances, setFixingBalances] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [leaseList, tenantList, unitList] = await Promise.all([
        leaseService.getLeases(),
        tenantService.getTenants(),
        unitService.getUnits(),
      ]);
      setLeases(leaseList);
      setTenants(tenantList);
      setUnits(unitList);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load leases.'));
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

  function openEditForm(lease) {
    setEditingId(lease.id);
    setForm({
      tenantId: String(lease.tenant?.id ?? ''),
      unitId: String(lease.unit?.id ?? ''),
      startDate: lease.startDate,
      endDate: lease.endDate || '',
      monthlyRent: String(lease.monthlyRent),
      depositAmount: String(lease.depositAmount ?? ''),
      leaseStatus: lease.leaseStatus,
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
    if (!editingId && !form.tenantId) errs.tenantId = 'Tenant is required';
    if (!editingId && !form.unitId) errs.unitId = 'Unit is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) errs.monthlyRent = 'Monthly rent must be greater than 0';
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      errs.endDate = 'End date cannot be before the start date';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      startDate: form.startDate,
      endDate: form.endDate || null,
      monthlyRent: Number(form.monthlyRent),
      depositAmount: form.depositAmount ? Number(form.depositAmount) : null,
      leaseStatus: form.leaseStatus,
    };

    setSaving(true);
    try {
      if (editingId) {
        await leaseService.updateLease(editingId, payload);
      } else {
        await leaseService.createLease(form.tenantId, form.unitId, payload);
      }
      closeForm();
      await loadData();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this lease.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lease? This cannot be undone.')) return;
    try {
      await leaseService.deleteLease(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this lease.'));
    }
  }

  // One-time cleanup for leases whose balance was thrown off by the old
  // calculation bug - recomputes every lease's balance from its actual
  // payment history.
  async function handleFixBalances() {
    if (!confirm('Recalculate the balance for every lease based on its payment history?')) return;
    setFixingBalances(true);
    try {
      await leaseService.recalculateBalances();
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not recalculate balances.'));
    } finally {
      setFixingBalances(false);
    }
  }

  if (loading) return <LoadingState message="Loading leases..." />;

  const canCreate = tenants.length > 0 && units.length > 0;

  const q = search.trim().toLowerCase();
  const filteredLeases = !q
    ? leases
    : leases.filter((l) =>
        [l.tenant?.fullName, l.unit?.unitNumber, l.leaseStatus]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Leases</h1>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {isAdmin && leases.length > 0 && (
            <button className="btn btn-outline" onClick={handleFixBalances} disabled={fixingBalances}>
              {fixingBalances ? 'Fixing...' : 'Fix Balances'}
            </button>
          )}
          <button className="btn btn-primary" onClick={openCreateForm} disabled={!canCreate}>
            + New Lease
          </button>
        </div>
      </div>

      {leases.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search leases by tenant, unit, or status..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}
      {!canCreate && (
        <div className="form-error-banner">Add at least one tenant and one unit before creating a lease.</div>
      )}

      {leases.length === 0 ? (
        <EmptyState title="No leases yet" message="Create a lease to link a tenant to a unit." />
      ) : filteredLeases.length === 0 ? (
        <EmptyState title="No matches" message="No leases match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Start</th>
                <th>End</th>
                <th>Rent</th>
                <th>Balance</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLeases.map((lease) => (
                <tr key={lease.id}>
                  <td>{lease.tenant?.fullName || '-'}</td>
                  <td>{lease.unit?.unitNumber || '-'}</td>
                  <td>{lease.startDate}</td>
                  <td>{lease.endDate || '-'}</td>
                  <td>${lease.monthlyRent}</td>
                  <td>
                    {Number(lease.balance) > 0 && (
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        +${Number(lease.balance).toFixed(2)} (credit)
                      </span>
                    )}
                    {Number(lease.balance) < 0 && (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                        -${Math.abs(Number(lease.balance)).toFixed(2)} (owed)
                      </span>
                    )}
                    {Number(lease.balance) === 0 && (
                      <span style={{ color: 'var(--text-muted)' }}>Settled</span>
                    )}
                  </td>
                  <td><StatusBadge status={lease.leaseStatus} /></td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditForm(lease)}>Edit</button>{' '}
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lease.id)}>Delete</button>
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
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Lease' : 'New Lease'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {!editingId && (
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="tenantId">Tenant</label>
                    <select id="tenantId" name="tenantId" value={form.tenantId} onChange={handleChange}>
                      <option value="">Select a tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>{tenant.fullName}</option>
                      ))}
                    </select>
                    {formErrors.tenantId && <div className="field-error">{formErrors.tenantId}</div>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="unitId">Unit</label>
                    <select id="unitId" name="unitId" value={form.unitId} onChange={handleChange}>
                      <option value="">Select a unit</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.apartment?.apartmentName} - {unit.unitNumber}
                        </option>
                      ))}
                    </select>
                    {formErrors.unitId && <div className="field-error">{formErrors.unitId}</div>}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Start Date</label>
                  <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
                  {formErrors.startDate && <div className="field-error">{formErrors.startDate}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="endDate">End Date (optional)</label>
                  <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                  {formErrors.endDate && <div className="field-error">{formErrors.endDate}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="monthlyRent">Monthly Rent</label>
                  <input id="monthlyRent" name="monthlyRent" type="number" min="0" step="0.01" value={form.monthlyRent} onChange={handleChange} />
                  {formErrors.monthlyRent && <div className="field-error">{formErrors.monthlyRent}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="depositAmount">Deposit Amount</label>
                  <input id="depositAmount" name="depositAmount" type="number" min="0" step="0.01" value={form.depositAmount} onChange={handleChange} />
                </div>
              </div>

              {/* Lease status can only be changed once the lease already exists */}
              {editingId && (
                <div className="form-group">
                  <label htmlFor="leaseStatus">Status</label>
                  <select id="leaseStatus" name="leaseStatus" value={form.leaseStatus} onChange={handleChange}>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              )}

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