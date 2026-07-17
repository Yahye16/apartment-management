import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
//import ThemeToggle from './components/ThemeToggle';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Apartments from './pages/Apartments';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import Leases from './pages/Leases';
import Payments from './pages/Payments';
import MaintenanceRequests from './pages/MaintenanceRequests';
import Reports from './pages/Reports';
import Employees from './pages/Employees';


function protect(element) {
  return <PrivateRoute>{element}</PrivateRoute>;
}

function AppShell() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {/* <ThemeToggle /> */}
      <Sidebar />
      {/* Only push the content over when the sidebar is actually showing */}
      <div className={`app-main ${user ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={protect(<Dashboard />)} />
          <Route path="/owners" element={protect(<Owners />)} />
          <Route path="/apartments" element={protect(<Apartments />)} />
          <Route path="/units" element={protect(<Units />)} />
          <Route path="/tenants" element={protect(<Tenants />)} />
          <Route path="/leases" element={protect(<Leases />)} />
          <Route path="/payments" element={protect(<Payments />)} />
          <Route path="/maintenance" element={protect(<MaintenanceRequests />)} />
          <Route path="/reports" element={<PrivateRoute adminOnly><Reports /></PrivateRoute>} />
          <Route path="/employees" element={<PrivateRoute adminOnly><Employees /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
