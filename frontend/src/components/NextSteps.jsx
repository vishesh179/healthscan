function StepList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800 mb-3">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-slate-600">
            <span className="text-status-healthy font-medium">→</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NextSteps({ actions }) {
  if (!actions) return null;
  const { this_week = [], this_month = [] } = actions;
  if (!this_week.length && !this_month.length) return null;

  return (
    <section className="dashboard-card animate-slide-up">
      <p className="section-label mb-2">Take action</p>
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Recommended Next Steps</h2>
      <div className="grid sm:grid-cols-2 gap-8">
        <StepList title="This Week" items={this_week} />
        <StepList title="This Month" items={this_month} />
      </div>
    </section>
  );
}
