import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as ownerService from '../services/ownerService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';


const emptyForm = { ownerName: '', phone: '', email: '', address: '' };

export default function Owners() {
  const { isAdmin } = useAuth();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');


  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  async function loadOwners() {
    setLoading(true);
    setError('');
    try {
      const data = await ownerService.getOwners();
      setOwners(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load owners.'));
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

  function openEditForm(owner) {
    setEditingId(owner.id);
    setForm({
      ownerName: owner.ownerName,
      phone: owner.phone || '',
      email: owner.email || '',
      address: owner.address || '',
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
    if (!form.ownerName.trim()) errs.ownerName = 'Owner name is required';
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
        await ownerService.updateOwner(editingId, form);
      } else {
        await ownerService.createOwner(form);
      }
      closeForm();
      await loadOwners();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this owner.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this owner? This cannot be undone.')) return;
    try {
      await ownerService.deleteOwner(id);
      await loadOwners();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this owner.'));
    }
  }

  if (loading) return <LoadingState message="Loading owners..." />;

  const q = search.trim().toLowerCase();
  const filteredOwners = !q
    ? owners
    : owners.filter((o) =>
        [o.ownerName, o.phone, o.email, o.address]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Owners</h1>
        {isAdmin && (
  <button className="btn btn-primary" onClick={openCreateForm}>+ New Owner</button>
)}
      </div>

      {owners.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search owners by name, phone, or email..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}

      {owners.length === 0 ? (
        <EmptyState title="No owners yet" message="Add the first apartment owner to get started." />
      ) : filteredOwners.length === 0 ? (
        <EmptyState title="No matches" message="No owners match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filteredOwners.map((owner) => (
                <tr key={owner.id}>
                  <td>{owner.ownerName}</td>
                  <td>{owner.phone || '-'}</td>
                  <td>{owner.email || '-'}</td>
                  <td>{owner.address || '-'}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditForm(owner)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(owner.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Owner' : 'New Owner'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="ownerName">Owner Name</label>
                <input id="ownerName" name="ownerName" value={form.ownerName} onChange={handleChange} />
                {formErrors.ownerName && <div className="field-error">{formErrors.ownerName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea id="address" name="address" rows={3} value={form.address} onChange={handleChange} />
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