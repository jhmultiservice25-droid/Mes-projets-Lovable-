export function MetricCard({ label, value, meta, icon }: { label: string; value: string; meta: string; icon: string }) {
  return (
    <article className="metric-card">
      <div className="metric-head"><span>{label}</span><span className="metric-icon">{icon}</span></div>
      <strong className="metric-value">{value}</strong>
      <span className="metric-meta">{meta}</span>
    </article>
  );
}
