import { Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import Disclaimer from './components/Disclaimer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-900 tracking-tight">HealthScan</span>
              <span className="hidden sm:inline text-slate-400 text-sm ml-2">Priority Engine</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/dashboard/:reportId" element={<DashboardPage />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-100 py-6 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Disclaimer compact />
        </div>
      </footer>
    </div>
  );
}
