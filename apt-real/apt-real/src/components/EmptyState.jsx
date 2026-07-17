export default function EmptyState({ title = 'Nothing here yet', message = '', action = null }) {
  return (
    <div className="state-box">
      <h3 style={{ color: 'var(--navy)', marginBottom: '0.35rem' }}>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
