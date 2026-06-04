const STATUS_STYLES = {
  Normal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Low: 'bg-amber-100 text-amber-800 border-amber-200',
  High: 'bg-red-100 text-red-800 border-red-200',
};

const SEVERITY_STYLES = {
  Normal: 'text-emerald-600',
  Borderline: 'text-yellow-600',
  Mild: 'text-amber-600',
  Moderate: 'text-orange-600',
  Severe: 'text-red-600',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {status}
    </span>
  );
}

function SeverityBadge({ severity }) {
  if (!severity || severity === 'Normal') return null;
  return (
    <span className={`text-xs font-medium ${SEVERITY_STYLES[severity] || 'text-slate-500'}`}>
      {severity}
    </span>
  );
}

export default function ParametersTable({ parameters }) {
  const entries = Object.entries(parameters || {});

  if (entries.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Parameters</h2>
        <p className="text-slate-500 text-sm">No parameters extracted from this report.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="p-6 pb-0">
        <h2 className="text-lg font-semibold text-slate-800">Parameters</h2>
      </div>
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Parameter</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Value</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-600 hidden md:table-cell">Range</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-600">Status</th>
              <th className="text-left px-6 py-3 font-semibold text-slate-600 hidden sm:table-cell">Severity</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, data]) => (
              <tr key={name} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                <td className="px-6 py-3.5 font-medium text-slate-800">
                  {name}
                  {data.is_critical && (
                    <span className="ml-1 text-[10px] text-health-blue font-normal">★</span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-slate-600">
                  {data.value}
                  {data.unit && <span className="text-slate-400 ml-1 text-xs">{data.unit}</span>}
                  {data.deviation_percent > 0 && (
                    <span className="block text-[10px] text-slate-400">
                      {data.deviation_percent}% off range
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-slate-500 hidden md:table-cell">{data.range || '—'}</td>
                <td className="px-6 py-3.5">
                  <StatusBadge status={data.status} />
                </td>
                <td className="px-6 py-3.5 hidden sm:table-cell">
                  <SeverityBadge severity={data.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
