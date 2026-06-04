const STATUS_COLORS = {
  Excellent: { stroke: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  Good: { stroke: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-700' },
  Fair: { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700' },
  'Needs Attention': { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-700' },
};

export default function HealthScoreHero({ healthScore, amIOkay }) {
  if (!healthScore?.score && healthScore?.score !== 0) return null;

  const { score, status, category, reasons = [] } = healthScore;
  const label = status || category || 'Fair';
  const colors = STATUS_COLORS[label] || STATUS_COLORS.Fair;
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;

  return (
    <section className="dashboard-card animate-fade-in">
      <p className="section-label mb-6">Am I okay?</p>
      <div className="flex flex-col lg:flex-row lg:items-center gap-10">
        <div className="relative w-44 h-44 mx-auto lg:mx-0 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={colors.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold tracking-tight text-slate-900">{score}</span>
            <span className="text-sm text-slate-400 font-medium">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left space-y-4">
          <div>
            <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
              {label}
            </span>
          </div>
          {amIOkay && (
            <p className="text-lg text-slate-700 leading-relaxed max-w-xl">{amIOkay}</p>
          )}
          {reasons.length > 0 && (
            <ul className="space-y-1.5 text-left inline-block">
              {reasons.map((reason, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-attention flex-shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
