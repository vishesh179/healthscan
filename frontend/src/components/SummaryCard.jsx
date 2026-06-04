export default function SummaryCard({ summary, filename, stats }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Report Summary</h2>
          {filename && (
            <p className="text-sm text-slate-500 mt-1">{filename}</p>
          )}
        </div>
        <div className="flex gap-2">
          {stats && (
            <>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-medical-100 text-medical-800">
                {stats.total} parameters
              </span>
              {stats.abnormal > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {stats.abnormal} abnormal
                </span>
              )}
            </>
          )}
        </div>
      </div>
      <p className="text-slate-600 leading-relaxed">{summary}</p>
    </div>
  );
}
