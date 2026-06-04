export default function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-slate-200 rounded-xl" />
      <div className="dashboard-card h-48 bg-slate-100" />
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="dashboard-card h-28 bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
