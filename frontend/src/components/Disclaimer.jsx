const DISCLAIMER_TEXT =
  'This analysis is for educational purposes only and should not be considered medical advice. Please consult a qualified healthcare professional.';

export default function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-center text-slate-500 leading-relaxed">
        {DISCLAIMER_TEXT}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <svg
          className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-sm text-amber-800 leading-relaxed">{DISCLAIMER_TEXT}</p>
      </div>
    </div>
  );
}
