import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

// One entry per page in the sidebar menu.
const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u2302' },
  { to: '/owners', label: 'Owners', icon: '\u2605' },
  { to: '/apartments', label: 'Apartments', icon: '\u2317' },
  { to: '/units', label: 'Units', icon: '\u25A6' },
  { to: '/tenants', label: 'Tenants', icon: '\u263A' },
  { to: '/leases', label: 'Leases', icon: '\u2637' },
  { to: '/payments', label: 'Payments', icon: '\u25A4' },
  { to: '/maintenance', label: 'Maintenance', icon: '\u2692' },
  { to: '/reports', label: 'Reports', icon: '\u25B6', adminOnly: true },
  { to: '/employees', label: 'Employees', icon: '\u2699', adminOnly: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false); 
  const navigate = useNavigate();

  
  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <>
      {/* Hamburger button, only visible on small screens */}
      <button className="sidebar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
        &#9776;
      </button>

      {/* Dark overlay behind the sidebar on mobile, closes the menu on click */}
      {open && <div className="sidebar-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">TA</span>
          <div>
            <div className="sidebar-brand-title">TENORA APARTMENTS</div>
            <div className="sidebar-brand-sub">Property Management</div>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
            &times;
          </button>
        </div>

        <nav className="sidebar-nav">
          {links
            .filter((l) => !l.adminOnly || isAdmin)
            .map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setOpen(false)}>
              <span className="sidebar-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
  <div className="sidebar-user">
    <div className="sidebar-avatar">{(user.fullName || user.username).charAt(0).toUpperCase()}</div>
    <div>
      <div className="sidebar-username">{user.fullName || user.username}</div>
      <div className="sidebar-role">{isAdmin ? 'Admin' : 'Employee'}</div>
    </div>
  </div>
  <ThemeToggle />
  <button className="sidebar-logout" onClick={handleLogout}>Logout</button>
</div>
      </aside>
    </>
  );
}