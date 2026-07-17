import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as tenantService from '../services/tenantService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = { fullName: '', gender: '', phone: '', email: '', nationalId: '' };

export default function Tenants() {
  const { isAdmin } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);
    setError('');
    try {
      const data = await tenantService.getTenants();
      setTenants(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load tenants.'));
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

  function openEditForm(tenant) {
    setEditingId(tenant.id);
    setForm({
      fullName: tenant.fullName,
      gender: tenant.gender || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      nationalId: tenant.nationalId || '',
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
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      if (editingId) {
        await tenantService.updateTenant(editingId, form);
      } else {
        await tenantService.createTenant(form);
      }
      closeForm();
      await loadTenants();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this tenant.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this tenant? This cannot be undone.')) return;
    try {
      await tenantService.deleteTenant(id);
      await loadTenants();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this tenant.'));
    }
  }

  if (loading) return <LoadingState message="Loading tenants..." />;

  const q = search.trim().toLowerCase();
  const filteredTenants = !q
    ? tenants
    : tenants.filter((t) =>
        [t.fullName, t.gender, t.phone, t.email, t.nationalId]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tenants</h1>
        <button className="btn btn-primary" onClick={openCreateForm}>+ New Tenant</button>
      </div>

      {tenants.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search tenants by name, phone, or email..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}

      {tenants.length === 0 ? (
        <EmptyState title="No tenants yet" message="Add the first tenant to get started." />
      ) : filteredTenants.length === 0 ? (
        <EmptyState title="No matches" message="No tenants match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>National ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>{tenant.fullName}</td>
                  <td>{tenant.gender || '-'}</td>
                  <td>{tenant.phone || '-'}</td>
                  <td>{tenant.email || '-'}</td>
                  <td>{tenant.nationalId || '-'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditForm(tenant)}>Edit</button>{' '}
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tenant.id)}>Delete</button>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Tenant' : 'New Tenant'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} />
                {formErrors.fullName && <div className="field-error">{formErrors.fullName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
                    <option value="">Not specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="nationalId">National ID</label>
                  <input id="nationalId" name="nationalId" value={form.nationalId} onChange={handleChange} />
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