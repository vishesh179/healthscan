export default function DoctorQuestionsPanel({ questions }) {
  if (!questions?.length) return null;

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">Questions to Ask Your Doctor</h2>
      <p className="text-xs text-slate-500 mb-4">Bring these to your next appointment</p>
      <ol className="space-y-3">
        {questions.map((q, index) => (
          <li key={index} className="flex gap-3 text-sm">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-health-blue text-white text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <span className="text-slate-700 leading-relaxed pt-0.5">{q}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
