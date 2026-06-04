export default function DoctorQuestions({ questions }) {
  if (!questions?.length) return null;

  return (
    <section className="animate-slide-up">
      <div className="px-1 mb-4">
        <p className="section-label mb-1">Before your visit</p>
        <h2 className="text-xl font-semibold text-slate-900">Questions for Your Doctor</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {questions.slice(0, 5).map((q, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-5 shadow-soft hover:shadow-lift transition-shadow duration-300 border border-slate-100/80"
          >
            <span className="text-xs font-bold text-health-accent mb-2 block">Q{i + 1}</span>
            <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
