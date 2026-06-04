export default function ExplanationsCard({ explanations, insights }) {
  const hasContent =
    (explanations && explanations.length > 0) ||
    (insights && insights.length > 0);

  if (!hasContent) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">AI Explanations</h2>
        <p className="text-slate-500 text-sm">No explanations available yet.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">AI Explanations</h2>

      {explanations?.length > 0 && (
        <div className="space-y-4">
          {explanations.map((item, index) => (
            <div
              key={index}
              className="rounded-xl bg-gradient-to-r from-health-sky/50 to-medical-50 p-4 border border-sky-100"
            >
              <h3 className="font-semibold text-health-blue text-sm mb-1">
                {item.parameter}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.explanation}
              </p>
            </div>
          ))}
        </div>
      )}

      {insights?.length > 0 && (
        <div>
          <h3 className="font-semibold text-slate-700 text-sm mb-3">
            Educational Insights
          </h3>
          <ul className="space-y-2">
            {insights.map((insight, index) => (
              <li key={index} className="flex gap-2 text-sm text-slate-600">
                <span className="text-health-teal mt-1 flex-shrink-0">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
