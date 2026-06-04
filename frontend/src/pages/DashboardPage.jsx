import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import HealthScoreHero from '../components/HealthScoreHero';
import HealthPriorities from '../components/HealthPriorities';
import KeyInsights from '../components/KeyInsights';
import NextSteps from '../components/NextSteps';
import DoctorQuestions from '../components/DoctorQuestions';
import ChatAssistant from '../components/ChatAssistant';
import DashboardSkeleton from '../components/DashboardSkeleton';
import Disclaimer from '../components/Disclaimer';
import { getReport } from '../services/api';

export default function DashboardPage() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setReport(await getReport(reportId));
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    })();
  }, [reportId]);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-red-600 mb-6">{error}</p>
        <Link to="/" className="btn-primary">Upload New Report</Link>
      </div>
    );
  }

  const analysis = report.analysis || {};

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-medium text-health-accent mb-1">Health Priority Engine</p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              What matters most
            </h1>
            <p className="text-slate-500 mt-2 text-sm">{report.filename}</p>
          </div>
          <Link to="/" className="btn-ghost self-start sm:self-auto">
            New report →
          </Link>
        </header>

        <div className="space-y-10 lg:space-y-12">
          <HealthScoreHero
            healthScore={report.health_score || analysis.health_score}
            amIOkay={report.am_i_okay || analysis.am_i_okay || analysis.summary}
          />

          <HealthPriorities
            priorities={report.priority_rankings || analysis.priority_rankings}
          />

          <KeyInsights insights={report.insights || analysis.insights} />

          <NextSteps actions={report.recommended_actions || analysis.recommended_actions} />

          <DoctorQuestions questions={report.doctor_questions || analysis.doctor_questions} />

          <ChatAssistant reportId={reportId} initialHistory={report.chat_history || []} />

          <Disclaimer />
        </div>
      </div>
    </div>
  );
}
