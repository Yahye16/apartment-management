
export default function DonutChart({ data, centerLabel = 'Total' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 140;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const dash = fraction * circumference;
    const segment = {
      ...d,
      dashArray: `${dash} ${circumference - dash}`,
      dashOffset: -offset,
    };
    offset += dash;
    return segment;
  });

  return (
    <div className="donut-chart-row">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="16"
          />
          {total > 0 &&
            segments.map((s) => (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={s.dashArray}
                strokeDashoffset={s.dashOffset}
                strokeLinecap="butt"
              />
            ))}
        </g>
        <text x="50%" y="47%" textAnchor="middle" className="donut-center-value">
          {total}
        </text>
        <text x="50%" y="60%" textAnchor="middle" className="donut-center-label">
          {centerLabel}
        </text>
      </svg>

      <div className="chart-legend">
        {data.length === 0 && <p style={{ color: 'var(--text-muted)', margin: 0 }}>No data yet.</p>}
        {data.map((d) => (
          <div className="legend-row" key={d.label}>
            <span className="legend-label">
              <span className="legend-dot" style={{ background: d.color }} />
              {d.label}
            </span>
            <span className="legend-value">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}