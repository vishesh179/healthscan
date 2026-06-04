export default function HealthInsightsPanel({ insights }) {
  if (!insights?.length) return null;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Key Insights</h2>
      <ul className="space-y-3">
        {insights.map((insight, index) => (
          <li
            key={index}
            className="flex gap-3 text-sm text-slate-700 leading-relaxed p-3 rounded-xl bg-gradient-to-r from-health-sky/40 to-transparent border-l-4 border-health-teal"
          >
            <span className="text-health-teal font-bold flex-shrink-0">{index + 1}.</span>
            <span>{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
