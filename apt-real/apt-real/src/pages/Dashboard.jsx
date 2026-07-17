import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import LoadingState from '../components/LoadingState';
import DonutChart from '../components/DonutChart';
import BarChart from '../components/BarChart';
import { getErrorMessage } from '../utils/getErrorMessage';

// Role-specific blurb shown under the welcome banner.
const ROLE_TEXT = {
  ADMIN:
    'You have full administrator access — manage owners, apartments, units, tenants, leases, payments, maintenance, and staff accounts.',
  EMPLOYEE:
    'You have employee access — handle day-to-day operations like tenants, leases, payments, and maintenance requests.',
};

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the stats once when the page first opens.
  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    setError('');
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load dashboard statistics.'));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingState message="Loading dashboard..." />;

  if (error) {
    return (
      <div className="page">
        <div className="form-error-banner">{error}</div>
      </div>
    );
  }

  const displayName = user?.fullName || user?.username || 'there';

  const occupancyData = [
    { label: 'Occupied', value: stats.occupiedUnits || 0, color: 'var(--chart-blue)' },
    { label: 'Available', value: stats.availableUnits || 0, color: 'var(--success)' },
    { label: 'Maintenance', value: stats.maintenanceUnits || 0, color: 'var(--chart-orange)' },
  ];

  const paymentColors = { PAID: 'var(--success)', PENDING: 'var(--gold)', OVERDUE: 'var(--danger)' };
  const paymentData = Object.entries(stats.paymentStatusBreakdown || {}).map(([label, value]) => ({
    label,
    value,
    color: paymentColors[label] || 'var(--chart-purple)',
  }));

  const maintenanceColors = {
    PENDING: 'var(--gold)',
    IN_PROGRESS: 'var(--chart-blue)',
    COMPLETED: 'var(--success)',
  };
  const maintenanceData = Object.entries(stats.maintenanceStatusBreakdown || {}).map(([label, value]) => ({
    label,
    value,
    color: maintenanceColors[label] || 'var(--chart-purple)',
  }));

  return (
    <div className="page">
      {/* Personal welcome banner: greets whoever is logged in and shows their role */}
      <div className="welcome-banner">
        <div className="welcome-avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="welcome-text">
          <h1>{timeGreeting()}, {displayName}</h1>
          <span className={`welcome-role-badge ${isAdmin ? '' : 'employee'}`}>
            {isAdmin ? 'Administrator' : 'Employee'}
          </span>
          <p className="welcome-subtitle">{isAdmin ? ROLE_TEXT.ADMIN : ROLE_TEXT.EMPLOYEE}</p>
        </div>
      </div>

      <div className="revenue-spotlight">
        <div>
          <div className="revenue-label">Monthly Revenue</div>
          <div className="revenue-value">${stats.monthlyRevenue}</div>
        </div>
        <div className="revenue-icon">💰</div>
      </div>

      <div className="stats-grid">
        <StatCard icon="🏢" label="Apartments" value={stats.totalApartments} variant="" />
        <StatCard icon="🚪" label="Total Units" value={stats.totalUnits} variant="blue" />
        <StatCard icon="✅" label="Occupied Units" value={stats.occupiedUnits} variant="success" />
        <StatCard icon="🔑" label="Available Units" value={stats.availableUnits} variant="" />
        <StatCard icon="🛠️" label="Units in Maintenance" value={stats.maintenanceUnits} variant="orange" />
        <StatCard icon="🧑‍🤝‍🧑" label="Tenants" value={stats.totalTenants} variant="purple" />
        <StatCard icon="📄" label="Active Leases" value={stats.activeLeases} variant="blue" />
        <StatCard icon="⭐" label="Monthly Revenue" value={`$${stats.monthlyRevenue}`} variant="gold" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Unit Occupancy</h3>
          <DonutChart data={occupancyData} centerLabel="Units" />
        </div>

        <div className="chart-card">
          <h3>Payments by Status</h3>
          <DonutChart data={paymentData} centerLabel="Payments" />
        </div>

        <div className="chart-card">
          <h3>Maintenance Requests by Status</h3>
          <BarChart data={maintenanceData} />
        </div>
      </div>
    </div>
  );
}

// A single stat in a colorful card, e.g. an icon + "Total Units: 12"
function StatCard({ icon, label, value, variant }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-card-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}