import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import Disclaimer from '../components/Disclaimer';
import { uploadReport, analyzeReport } from '../services/api';

export default function UploadPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  const handleUpload = async (file) => {
    setLoading(true);
    setError('');
    setStep('Uploading report...');

    try {
      const uploadData = await uploadReport(file);
      setStep('Identifying what matters most...');

      await analyzeReport(uploadData.report_id);
      navigate(`/dashboard/${uploadData.report_id}`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Something went wrong. Please try again with a different file.'
      );
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="text-center mb-14">
        <p className="text-sm font-semibold text-health-accent uppercase tracking-widest mb-4">
          AI Health Priority Engine
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4">
          We tell you what<br />matters most
        </h1>
        <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
          Upload your blood test. In seconds, see your health score, top priorities, and next steps.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { n: '1', title: 'Am I okay?', desc: 'Health score at a glance' },
          { n: '2', title: 'What first?', desc: 'Ranked priorities' },
          { n: '3', title: 'What next?', desc: 'Clear action steps' },
        ].map((item) => (
          <div key={item.n} className="dashboard-card text-center py-6 !p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold mb-3">
              {item.n}
            </span>
            <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      <FileUpload onUpload={handleUpload} loading={loading} />

      {step && (
        <p className="text-center text-sm text-slate-500 mt-6 animate-pulse">{step}</p>
      )}

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 text-center">
          {error}
        </div>
      )}

      <div className="mt-12">
        <Disclaimer />
      </div>
    </div>
  );
}
