
export default function BarChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  if (data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', margin: 0 }}>No data yet.</p>;
  }

  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-chart-row" key={d.label}>
          <div className="bar-chart-labels">
            <span>{d.label}</span>
            <strong>{d.value}</strong>
          </div>
          <div className="bar-chart-track">
            <div
              className="bar-chart-fill"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}