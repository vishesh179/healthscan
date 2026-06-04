const LEVEL_STYLES = {
  Low: 'border-emerald-200 bg-emerald-50',
  Moderate: 'border-amber-200 bg-amber-50',
  High: 'border-red-200 bg-red-50',
};

const LEVEL_BADGE = {
  Low: 'bg-emerald-100 text-emerald-800',
  Moderate: 'bg-amber-100 text-amber-800',
  High: 'bg-red-100 text-red-800',
};

export default function RiskCards({ riskAssessment }) {
  if (!riskAssessment) return null;

  const concerns = riskAssessment.concerns || [];
  const notConcerns = riskAssessment.not_concerns || [];

  if (concerns.length === 0 && notConcerns.length === 0) return null;

  return (
    <div className="card space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">Risk Analysis</h2>

      {concerns.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-3">Potential Areas of Concern</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {concerns.map((item, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 ${LEVEL_STYLES[item.level] || LEVEL_STYLES.Moderate}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 text-sm">{item.area}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_BADGE[item.level] || LEVEL_BADGE.Moderate}`}>
                    {item.level}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notConcerns.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-3">Not Medical Concerns</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {notConcerns.map((item, i) => (
              <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <h4 className="font-semibold text-emerald-800 text-sm mb-1">{item.area}</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
