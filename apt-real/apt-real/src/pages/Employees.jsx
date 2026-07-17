import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import { getErrorMessage } from '../utils/getErrorMessage';

const emptyForm = { fullName: '', username: '', email: '', phone: '', role: 'EMPLOYEE', status: true };

export default function Employees() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load employees.'));
    } finally {
      setLoading(false);
    }
  }

  function openEditForm(u) {
    setEditingId(u.id);
    setForm({
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      status: u.status,
    });
    setFormErrors({});
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'status' ? value === 'true' : value });
  }

  function validate() {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.username.trim()) errs.username = 'Username is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await userService.updateUser(editingId, form);
      closeForm();
      await loadUsers();
    } catch (err) {
      setFormErrors({ submit: getErrorMessage(err, 'Could not save this employee.') });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Delete ${u.fullName}? This cannot be undone.`)) return;
    try {
      await userService.deleteUser(u.id);
      await loadUsers();
    } catch (err) {
      alert(getErrorMessage(err, 'Could not delete this employee.'));
    }
  }

  if (loading) return <LoadingState message="Loading employees..." />;

  const q = search.trim().toLowerCase();
  const filteredUsers = !q
    ? users
    : users.filter((u) =>
        [u.fullName, u.username, u.email, u.phone, u.role]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      );

  return (
    <div className="page">
      <div className="page-header">
        <h1>Employees</h1>
      </div>

      {users.length > 0 && (
        <SearchBar value={search} onChange={setSearch} placeholder="Search employees by name, username, email, or role..." />
      )}

      {error && <div className="form-error-banner">{error}</div>}

      {users.length === 0 ? (
        <EmptyState title="No users yet" message="Nobody has registered yet." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="No matches" message="No employees match your search." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                {isAdmin && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>{u.role}</td>
                  <td>{u.status ? 'Active' : 'Inactive'}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditForm(u)}>Edit</button>{' '}
                      {u.id !== user.id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u)}>Delete</button>
                      )}
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
            <h2 style={{ marginTop: 0 }}>Edit Employee</h2>

            {formErrors.submit && <div className="form-error-banner">{formErrors.submit}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} />
                {formErrors.fullName && <div className="field-error">{formErrors.fullName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input id="username" name="username" value={form.username} onChange={handleChange} />
                  {formErrors.username && <div className="field-error">{formErrors.username}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                {formErrors.email && <div className="field-error">{formErrors.email}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    disabled={editingId === user.id}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={String(form.status)}
                    onChange={handleChange}
                    disabled={editingId === user.id}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
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