const CATEGORY_STYLES = {
  Excellent: { ring: 'ring-emerald-400', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  Good: { ring: 'ring-blue-400', text: 'text-blue-700', bg: 'bg-blue-50' },
  Fair: { ring: 'ring-amber-400', text: 'text-amber-700', bg: 'bg-amber-50' },
  'Needs Attention': { ring: 'ring-red-400', text: 'text-red-700', bg: 'bg-red-50' },
};

export default function HealthScoreCard({ healthScore }) {
  if (!healthScore?.score && healthScore?.score !== 0) return null;

  const { score, category, explanation, score_reducers = [] } = healthScore;
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.Fair;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Health Score</h2>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={style.text}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${style.text}`}>{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text} ring-1 ${style.ring}`}>
            {category}
          </span>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">{explanation}</p>
          {score_reducers.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Primary factors:</p>
              <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {score_reducers.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
