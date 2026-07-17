import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as unitService from '../services/unitService';
import * as apartmentService from '../services/apartmentService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = {
  apartmentId: '',
  unitNumber: '',
  floorNo: '',
  bedrooms: '',
  bathrooms: '',
  kitchens: '',
  monthlyRent: '',
  status: 'AVAILABLE',
};

export default function Units() {
  const { isAdmin } = useAuth();
  const [units, setUnits] = useState([]);
  const [apartments, setApartments] = useState([]);
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

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [unitList, apartmentList] = await Promise.all([
        unitService.getUnits(),
        apartmentService.getApartments(),
      ]);
      setUnits(unitList);
      setApartments(apartmentList);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load units.'));
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

  function openEditForm(unit) {
    setEditingId(unit.id);
    setForm({
      apartmentId: String(unit.apartment?.id ?? ''),
      unitNumber: unit.unitNumber,
      floorNo: String(unit.floorNo),
      bedrooms: String(unit.bedrooms),
      bathrooms: String(unit.bathrooms),
      kitchens: String(unit.kitchens),
      monthlyRent: String(unit.monthlyRent),
      status: unit.status,
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
    if (!editingId && !form.apartmentId) errs.apartmentId = 'Apartment is required';
    if (!form.unitNumber.trim()) errs.unitNumber = 'Unit number is required';
    if (!form.floorNo) errs.floorNo = 'Floor is required';
    if (!form.bedrooms) errs.bedrooms = 'Bedrooms is required';
    if (!form.bathrooms) errs.bathrooms = 'Bathrooms is required';
    if (!form.kitchens) errs.kitchens = 'Kitchens is required';
    if (!form.monthlyRent || Number(form.monthlyRent) <= 0) errs.monthlyRent = 'Monthly rent must be greater than 0';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      unitNumber: form.unitNumber,
      floorNo: Number(form.floorNo),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      kitchens: Number(form.kitchens),
      monthlyRent: Number(form.monthlyRent),
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingId) {
        await unitService.updateUnit(editingId, payload);
      } else {
        await unitService.createUnit(form.apartmentId, payload);
      }
      closeForm();
      await loadData();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this unit.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this unit? This cannot be undone.')) return;
    try {
      await unitService.deleteUnit(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this unit.'));
    }
  }

  if (loading) return <LoadingState message="Loading units..." />;

  const q = search.trim().toLowerCase();
  const filteredUnits = !q
    ? units
    : units.filter((u) =>
        [u.unitNumber, u.apartment?.apartmentName, u.status]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Apartment Units</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreateForm} disabled={apartments.length === 0}>
            + New Unit
          </button>
        )}
      </div>

      {units.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search units by number, apartment, or status..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}
      {apartments.length === 0 && (
        <div className="form-error-banner">Add an apartment first before creating a unit.</div>
      )}

      {units.length === 0 ? (
        <EmptyState title="No units yet" message="Add the first unit to an apartment." />
      ) : filteredUnits.length === 0 ? (
        <EmptyState title="No matches" message="No units match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Unit #</th>
                <th>Apartment</th>
                <th>Floor</th>
                <th>Beds / Baths</th>
                <th>Rent</th>
                <th>Status</th>
               {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {filteredUnits.map((unit) => (
                <tr key={unit.id}>
                  <td>{unit.unitNumber}</td>
                  <td>{unit.apartment?.apartmentName || '-'}</td>
                  <td>{unit.floorNo}</td>
                  <td>{unit.bedrooms} / {unit.bathrooms}</td>
                  <td>${unit.monthlyRent}</td>
                  <td><StatusBadge status={unit.status} /></td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditForm(unit)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(unit.id)}>Delete</button>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Unit' : 'New Unit'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {!editingId && (
                <div className="form-group">
                  <label htmlFor="apartmentId">Apartment</label>
                  <select id="apartmentId" name="apartmentId" value={form.apartmentId} onChange={handleChange}>
                    <option value="">Select an apartment</option>
                    {apartments.map((apartment) => (
                      <option key={apartment.id} value={apartment.id}>{apartment.apartmentName}</option>
                    ))}
                  </select>
                  {formErrors.apartmentId && <div className="field-error">{formErrors.apartmentId}</div>}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unitNumber">Unit Number</label>
                  <input id="unitNumber" name="unitNumber" value={form.unitNumber} onChange={handleChange} />
                  {formErrors.unitNumber && <div className="field-error">{formErrors.unitNumber}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="floorNo">Floor</label>
                  <input id="floorNo" name="floorNo" type="number" min="0" value={form.floorNo} onChange={handleChange} />
                  {formErrors.floorNo && <div className="field-error">{formErrors.floorNo}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bedrooms">Bedrooms</label>
                  <input id="bedrooms" name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} />
                  {formErrors.bedrooms && <div className="field-error">{formErrors.bedrooms}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="bathrooms">Bathrooms</label>
                  <input id="bathrooms" name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} />
                  {formErrors.bathrooms && <div className="field-error">{formErrors.bathrooms}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="kitchens">Kitchens</label>
                  <input id="kitchens" name="kitchens" type="number" min="0" value={form.kitchens} onChange={handleChange} />
                  {formErrors.kitchens && <div className="field-error">{formErrors.kitchens}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="monthlyRent">Monthly Rent</label>
                  <input id="monthlyRent" name="monthlyRent" type="number" min="0" step="0.01" value={form.monthlyRent} onChange={handleChange} />
                  {formErrors.monthlyRent && <div className="field-error">{formErrors.monthlyRent}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
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