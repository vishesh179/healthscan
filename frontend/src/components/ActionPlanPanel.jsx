function ActionGroup({ title, items, icon }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-slate-600">
            <span className="text-health-teal mt-0.5">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ActionPlanPanel({ actions }) {
  if (!actions) return null;

  const { this_week = [], this_month = [], medical_followup = [] } = actions;
  const hasContent = this_week.length || this_month.length || medical_followup.length;
  if (!hasContent) return null;

  return (
    <div className="card space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">Recommended Next Steps</h2>
        <p className="text-xs text-slate-500 mt-1">Educational suggestions — not medical prescriptions</p>
      </div>
      <ActionGroup title="This Week" items={this_week} icon="📅" />
      <ActionGroup title="This Month" items={this_month} icon="🗓️" />
      <ActionGroup title="Medical Follow-up" items={medical_followup} icon="🏥" />
    </div>
  );
}
