import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as maintenanceService from '../services/maintenanceService';
import * as unitService from '../services/unitService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = {
  unitId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
};

export default function MaintenanceRequests() {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [units, setUnits] = useState([]);
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
      const [requestList, unitList] = await Promise.all([
        maintenanceService.getMaintenanceRequests(),
        unitService.getUnits(),
      ]);
      setRequests(requestList);
      setUnits(unitList);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load maintenance requests.'));
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

  function openEditForm(request) {
    setEditingId(request.id);
    setForm({
      unitId: String(request.unit?.id ?? ''),
      title: request.title,
      description: request.description || '',
      priority: request.priority,
      status: request.status,
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
    if (!editingId && !form.unitId) errs.unitId = 'Unit is required';
    if (!form.title.trim()) errs.title = 'Title is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
    };

    setSaving(true);
    try {
      if (editingId) {
        await maintenanceService.updateMaintenanceRequest(editingId, payload);
      } else {
        await maintenanceService.createMaintenanceRequest(form.unitId, payload);
      }
      closeForm();
      await loadData();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this request.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this maintenance request? This cannot be undone.')) return;
    try {
      await maintenanceService.deleteMaintenanceRequest(id);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this request.'));
    }
  }

  
  async function handleAssign(id) {
    const userId = prompt('Enter the user ID to assign this request to:');
    if (!userId) return;
    try {
      await maintenanceService.assignMaintenanceRequest(id, userId);
      await loadData();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not assign this request.'));
    }
  }

  if (loading) return <LoadingState message="Loading maintenance requests..." />;

  const q = search.trim().toLowerCase();
  const filteredRequests = !q
    ? requests
    : requests.filter((r) =>
        [r.title, r.unit?.unitNumber, r.priority, r.status, r.assignedUser?.fullName]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Maintenance Requests</h1>
        <button className="btn btn-primary" onClick={openCreateForm} disabled={units.length === 0}>
          + New Request
        </button>
      </div>

      {requests.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search requests by title, unit, or status..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}
      {units.length === 0 && (
        <div className="form-error-banner">Add a unit first before logging a maintenance request.</div>
      )}

      {requests.length === 0 ? (
        <EmptyState title="No maintenance requests" message="Log the first request for a unit." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState title="No matches" message="No requests match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Unit</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.title}</td>
                  <td>{request.unit?.unitNumber || '-'}</td>
                  <td><StatusBadge status={request.priority} /></td>
                  <td><StatusBadge status={request.status} /></td>
                  <td>{request.assignedUser?.fullName || 'Unassigned'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => openEditForm(request)}>Edit</button>{' '}
                    <button className="btn btn-gold btn-sm" onClick={() => handleAssign(request.id)}>Assign</button>{' '}
                    {isAdmin && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(request.id)}>Delete</button>
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
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Request' : 'New Request'}</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {!editingId && (
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
              )}

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input id="title" name="title" value={form.title} onChange={handleChange} />
                {formErrors.title && <div className="field-error">{formErrors.title}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={3} value={form.description} onChange={handleChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select id="status" name="status" value={form.status} onChange={handleChange}>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
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