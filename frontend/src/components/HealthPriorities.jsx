const IMPACT_STYLES = {
  High: 'bg-red-50 text-red-700 ring-red-100',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-100',
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function HealthPriorities({ priorities }) {
  if (!priorities?.length) {
    return (
      <section className="dashboard-card animate-slide-up">
        <p className="section-label mb-2">What to focus on first</p>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Health Priorities</h2>
        <p className="text-slate-500">No priorities flagged — your key markers look healthy.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 animate-slide-up">
      <div className="px-1">
        <p className="section-label mb-1">What to focus on first</p>
        <h2 className="text-xl font-semibold text-slate-900">Health Priorities</h2>
        <p className="text-sm text-slate-500 mt-1">Ranked by impact on your report</p>
      </div>

      <div className="space-y-4">
        {priorities.map((item) => (
          <article
            key={item.rank}
            className="dashboard-card group"
            style={{ animationDelay: `${item.rank * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white text-sm font-bold">
                  {item.rank}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{item.parameter}</h3>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ring-1 ${IMPACT_STYLES[item.impact] || IMPACT_STYLES.Medium}`}>
                Impact: {item.impact}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Current</p>
                <p className="text-2xl font-semibold text-slate-900 tracking-tight">{item.current_value}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Target</p>
                <p className="text-lg font-medium text-status-healthy">{item.target_value}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
              {item.explanation}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
