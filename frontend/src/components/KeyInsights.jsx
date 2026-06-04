export default function KeyInsights({ insights }) {
  if (!insights?.length) return null;

  return (
    <section className="dashboard-card animate-slide-up">
      <p className="section-label mb-2">At a glance</p>
      <h2 className="text-xl font-semibold text-slate-900 mb-5">Key Insights</h2>
      <ul className="space-y-3">
        {insights.slice(0, 5).map((insight, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm text-slate-700 leading-relaxed"
          >
            <span className="mt-1.5 h-2 w-2 rounded-full bg-health-accent flex-shrink-0" />
            {insight}
          </li>
        ))}
      </ul>
    </section>
  );
}
