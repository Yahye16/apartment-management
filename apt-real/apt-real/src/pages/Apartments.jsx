import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as apartmentService from '../services/apartmentService';
import * as ownerService from '../services/ownerService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = {
  ownerId: '',
  apartmentName: '',
  address: '',
  totalFloors: '',
  totalUnits: '',
  description: '',
  status: 'ACTIVE',
};

export default function Apartments() {
  const { isAdmin } = useAuth();
  const [apartments, setApartments] = useState([]);
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
    loadData();
  }, []);

  // Apartments and owners are loaded together because the form needs the
  // list of owners for its dropdown, and the table needs owner names too.
  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [apartmentList, ownerList] = await Promise.all([
        apartmentService.getApartments(),
        ownerService.getOwners(),
      ]);
      setApartments(apartmentList);
      setOwners(ownerList);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load apartments.'));
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

  function openEditForm(apartment) {
    setEditingId(apartment.id);
    setForm({
      ownerId: String(apartment.owner?.id ?? ''),
      apartmentName: apartment.apartmentName,
      address: apartment.address,
      totalFloors: String(apartment.totalFloors),
      totalUnits: String(apartment.totalUnits),
      description: apartment.description || '',
      status: apartment.status,
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
    if (!editingId && !form.ownerId) errs.ownerId = 'Owner is required';
    if (!form.apartmentName.trim()) errs.apartmentName = 'Apartment name is required';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.totalFloors) errs.totalFloors = 'Total floors is required';
    if (!form.totalUnits) errs.totalUnits = 'Total units is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // The owner relation is only sent to the backend as part of the URL
    // when creating a new apartment - it can't be changed afterwards.
    const payload = {
      apartmentName: form.apartmentName,
      address: form.address,
      totalFloors: Number(form.totalFloors),
      totalUnits: Number(form.totalUnits),
      description: form.description,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingId) {
        await apartmentService.updateApartment(editingId, payload);
      } else {
        await apartmentService.createApartment(form.ownerId, payload);
      }
      closeForm();
      await loadData();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this apartment.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this apartment? This cannot be undone.')) return;
    try {
      await apartmentService.deleteApartment(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this apartment.'));
    }
  }

  if (loading) return <LoadingState message="Loading apartments..." />;

  const q = search.trim().toLowerCase();
  const filteredApartments = !q
    ? apartments
    : apartments.filter((a) =>
        [a.apartmentName, a.address, a.owner?.ownerName, a.status]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Apartments</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateForm} disabled={owners.length === 0}>
            + New Apartment
          </button>
        )}
      </div>

      {apartments.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search apartments by name, address, or owner..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}
      {owners.length === 0 && (
        <div className="form-error-banner">Add an owner first before creating an apartment.</div>
      )}

      {apartments.length === 0 ? (
        <EmptyState title="No apartments yet" message="Create your first apartment building." />
      ) : filteredApartments.length === 0 ? (
        <EmptyState title="No matches" message="No apartments match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Floors</th>
                <th>Units</th>
                <th>Status</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filteredApartments.map((apartment) => (
                <tr key={apartment.id}>
                  <td>{apartment.apartmentName}</td>
                  <td>{apartment.owner?.ownerName || '-'}</td>
                  <td>{apartment.totalFloors}</td>
                  <td>{apartment.totalUnits}</td>
                  <td><StatusBadge status={apartment.status} /></td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditForm(apartment)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(apartment.id)}>Delete</button>
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
          <div className="modal-card wide" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Apartment' : 'New Apartment'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* The owner can only be picked when creating a new apartment */}
              {!editingId && (
                <div className="form-group">
                  <label htmlFor="ownerId">Owner</label>
                  <select id="ownerId" name="ownerId" value={form.ownerId} onChange={handleChange}>
                    <option value="">Select an owner</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>{owner.ownerName}</option>
                    ))}
                  </select>
                  {formErrors.ownerId && <div className="field-error">{formErrors.ownerId}</div>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="apartmentName">Apartment Name</label>
                <input id="apartmentName" name="apartmentName" value={form.apartmentName} onChange={handleChange} />
                {formErrors.apartmentName && <div className="field-error">{formErrors.apartmentName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea id="address" name="address" rows={2} value={form.address} onChange={handleChange} />
                {formErrors.address && <div className="field-error">{formErrors.address}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalFloors">Total Floors</label>
                  <input id="totalFloors" name="totalFloors" type="number" min="0" value={form.totalFloors} onChange={handleChange} />
                  {formErrors.totalFloors && <div className="field-error">{formErrors.totalFloors}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="totalUnits">Total Units</label>
                  <input id="totalUnits" name="totalUnits" type="number" min="0" value={form.totalUnits} onChange={handleChange} />
                  {formErrors.totalUnits && <div className="field-error">{formErrors.totalUnits}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={2} value={form.description} onChange={handleChange} />
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