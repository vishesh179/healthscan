const SEVERITY_STYLES = {
  Normal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Borderline: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Mild: 'bg-amber-100 text-amber-800 border-amber-200',
  Moderate: 'bg-orange-100 text-orange-800 border-orange-200',
  Severe: 'bg-red-100 text-red-800 border-red-200',
};

function SeverityBadge({ severity }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold border ${SEVERITY_STYLES[severity] || SEVERITY_STYLES.Mild}`}>
      {severity}
    </span>
  );
}

function ListSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-slate-600 flex gap-2">
            <span className="text-health-teal">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PersonalizedExplanations({ explanations }) {
  if (!explanations?.length) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Your Results Explained</h2>
        <p className="text-slate-500 text-sm">No personalized explanations available.</p>
      </div>
    );
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Your Results Explained</h2>
      <div className="space-y-5">
        {explanations.map((item, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-100 p-5 space-y-4 hover:border-health-teal/30 transition"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold text-health-blue">{item.parameter}</h3>
              <SeverityBadge severity={item.severity || 'Normal'} />
            </div>

            {item.what_it_measures && (
              <p className="text-xs text-slate-500">{item.what_it_measures}</p>
            )}

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-xs text-slate-500 block">Your Value</span>
                <span className="font-semibold text-slate-800">{item.patient_value || '—'}</span>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <span className="text-xs text-slate-500 block">Normal Range</span>
                <span className="font-semibold text-slate-800">{item.normal_range || '—'}</span>
              </div>
            </div>

            {item.what_it_means && (
              <div className="bg-gradient-to-r from-health-sky/30 to-transparent rounded-lg p-3">
                <h4 className="text-xs font-semibold text-health-blue mb-1">What this means for you</h4>
                <p className="text-sm text-slate-700 leading-relaxed">{item.what_it_means}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <ListSection title="Common Causes" items={item.common_causes} />
              <ListSection title="Possible Symptoms" items={item.possible_symptoms} />
            </div>

            <ListSection title="Recommendations" items={item.recommendations} />

            {item.when_to_see_doctor && (
              <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-3 border border-amber-100">
                <strong>When to see your doctor:</strong> {item.when_to_see_doctor}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
