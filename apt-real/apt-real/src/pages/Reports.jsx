import { useEffect, useMemo, useState } from 'react';
import * as paymentService from '../services/paymentService';
import * as leaseService from '../services/leaseService';
import * as unitService from '../services/unitService';
import * as tenantService from '../services/tenantService';
import * as maintenanceService from '../services/maintenanceService';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { getErrorMessage } from '../utils/getErrorMessage';



export default function Reports() {
  const [payments, setPayments] = useState([]);
  const [units, setUnits] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [paymentList, unitList, tenantList, maintenanceList] = await Promise.all([
        paymentService.getPayments(),
        unitService.getUnits(),
        tenantService.getTenants(),
        maintenanceService.getMaintenanceRequests(),
      ]);
      setPayments(paymentList);
      setUnits(unitList);
      setTenants(tenantList);
      setMaintenanceRequests(maintenanceList);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load report data.'));
    } finally {
      setLoading(false);
    }
  }


  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (fromDate && p.paymentDate < fromDate) return false;
      if (toDate && p.paymentDate > toDate) return false;
      return true;
    });
  }, [payments, fromDate, toDate]);

  // --- Financial summary ----
  const financials = useMemo(() => {
    const totals = { PAID: 0, PENDING: 0, OVERDUE: 0 };
    for (const p of filteredPayments) {
      const amount = Number(p.amount) || 0;
      if (totals[p.paymentStatus] !== undefined) {
        totals[p.paymentStatus] += amount;
      }
    }
    return totals;
  }, [filteredPayments]);

  // How many payments fall into each status, for the breakdown card.
  const paymentStatusCounts = useMemo(() => {
    const counts = {};
    for (const p of filteredPayments) {
      counts[p.paymentStatus] = (counts[p.paymentStatus] || 0) + 1;
    }
    return counts;
  }, [filteredPayments]);

  // --- Occupancy report -----------
  const occupancy = useMemo(() => {
    const total = units.length;
    const occupied = units.filter((u) => u.status === 'OCCUPIED').length;
    const available = units.filter((u) => u.status === 'AVAILABLE').length;
    const maintenance = units.filter((u) => u.status === 'MAINTENANCE').length;
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, maintenance, rate };
  }, [units]);

  // --- Maintenance breakdown --------
  const maintenanceCounts = useMemo(() => {
    const counts = {};
    for (const m of maintenanceRequests) {
      counts[m.status] = (counts[m.status] || 0) + 1;
    }
    return counts;
  }, [maintenanceRequests]);

  function clearFilters() {
    setFromDate('');
    setToDate('');
  }

  // Downloads the currently filtered payments as a CSV file so the report
  // can be handed off or archived outside the app.
  function exportCsv() {
    const header = ['Date', 'Tenant', 'Unit', 'Amount', 'Method', 'Status'];
    const rows = filteredPayments.map((p) => [
      p.paymentDate,
      p.lease?.tenant?.fullName || '',
      p.lease?.unit?.unitNumber || '',
      p.amount,
      p.paymentMethod || '',
      p.paymentStatus,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments-report${fromDate ? `_${fromDate}` : ''}${toDate ? `_${toDate}` : ''}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <LoadingState message="Loading report..." />;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports</h1>
        <button className="btn btn-outline" onClick={exportCsv} disabled={filteredPayments.length === 0}>
          Export CSV
        </button>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      {/* Date range filter for the financial numbers below */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-group">
            <label htmlFor="fromDate">From</label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="toDate">To</label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: '0 0 auto' }}>
            <button type="button" className="btn btn-outline" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Financial summary */}
      <div className="stats-grid">
        <StatCard label="Revenue Collected" value={`$${financials.PAID.toFixed(2)}`} gold />
        <StatCard label="Pending Payments" value={`$${financials.PENDING.toFixed(2)}`} />
        <StatCard label="Overdue Payments" value={`$${financials.OVERDUE.toFixed(2)}`} />
        <StatCard label="Occupancy Rate" value={`${occupancy.rate}%`} />
      </div>

      {/* Occupancy report */}
      <div className="stats-grid">
        <StatCard label="Total Units" value={occupancy.total} />
        <StatCard label="Occupied" value={occupancy.occupied} />
        <StatCard label="Available" value={occupancy.available} />
        <StatCard label="In Maintenance" value={occupancy.maintenance} />
      </div>

      <div className="form-row" style={{ marginBottom: '1.75rem' }}>
        <BreakdownCard title="Payments by Status" breakdown={paymentStatusCounts} />
        <BreakdownCard title="Maintenance by Status" breakdown={maintenanceCounts} />
      </div>

      {/* Detailed payments table for the selected range */}
    <h2 style={{ color: 'var(--text)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>
    Payments {fromDate || toDate ? `(${fromDate || 'start'} to ${toDate || 'now'})` : ''}
  </h2>

      {filteredPayments.length === 0 ? (
        <EmptyState title="No payments in this range" message="Try widening or clearing the date filter." />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tenant</th>
                <th>Unit</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>{p.paymentDate}</td>
                  <td>{p.lease?.tenant?.fullName || '-'}</td>
                  <td>{p.lease?.unit?.unitNumber || '-'}</td>
                  <td>${p.amount}</td>
                  <td>{p.paymentMethod || '-'}</td>
                  <td><StatusBadge status={p.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



function StatCard({ label, value, gold }) {
  return (
    <div className={`stat-card ${gold ? 'gold' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}


function BreakdownCard({ title, breakdown }) {
  const entries = Object.entries(breakdown || {});

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, color: 'var(--text)' }}>{title}</h3>
      {entries.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>}
      {entries.map(([status, count]) => (
        <div
          key={status}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.4rem 0',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <span>{status}</span>
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}
