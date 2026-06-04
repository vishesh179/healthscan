import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../services/api';

const SUGGESTED = [
  'What should I focus on first?',
  'Why is my top priority high?',
  'Explain my report in detail',
];

export default function ChatAssistant({ reportId, initialHistory = [] }) {
  const [messages, setMessages] = useState(initialHistory);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => setMessages(initialHistory), [initialHistory]);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setError('');
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    try {
      const data = await sendChatMessage(reportId, msg);
      setMessages(data.chat_history);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setError(err.response?.data?.detail || 'Failed to send. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dashboard-card flex flex-col min-h-[520px] p-0 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100">
        <p className="section-label mb-1">Go deeper</p>
        <h2 className="text-xl font-semibold text-slate-900">Health Coach</h2>
        <p className="text-sm text-slate-500 mt-1">
          Detailed explanations live here — ask anything about your report
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-slate-500 mb-5">
              Priorities are on the dashboard. Ask for details here.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="text-xs px-4 py-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-health-accent text-white rounded-br-md'
                  : 'bg-slate-100 text-slate-800 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-1.5 px-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="px-6 text-xs text-red-600">{error}</p>}

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="px-6 py-4 border-t border-slate-100 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your health coach..."
          className="flex-1 rounded-xl border-0 bg-slate-100 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-health-accent/30"
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading} className="btn-primary px-5">
          Send
        </button>
      </form>
    </section>
  );
}
