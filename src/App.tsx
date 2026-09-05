import { useState, useEffect } from 'react';
import type { Page } from './types';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportIssue from './pages/ReportIssue';
import AIAnalysisPage from './pages/AIAnalysisPage';
import GeneratedComplaint from './pages/GeneratedComplaint';
import SuccessPage from './pages/SuccessPage';
import CaseTracking from './pages/CaseTracking';
import ComplaintHistory from './pages/ComplaintHistory';
import AdminDashboard from './pages/AdminDashboard';
import AdminComplaintDetails from './pages/AdminComplaintDetails';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [complaintId, setComplaintId] = useState<string>('CL-10482');

  const navigate = (p: Page, opts?: { complaintId?: string }) => {
    if (opts?.complaintId) setComplaintId(opts.complaintId);
    setPage(p);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="min-h-screen">
      {page === 'landing' && <LandingPage navigate={navigate} />}
      {page === 'dashboard' && <CitizenDashboard navigate={navigate} />}
      {page === 'report' && <ReportIssue navigate={navigate} />}
      {page === 'ai-analysis' && <AIAnalysisPage navigate={navigate} />}
      {page === 'generated-complaint' && <GeneratedComplaint navigate={navigate} />}
      {page === 'success' && <SuccessPage navigate={navigate} />}
      {page === 'case-tracking' && <CaseTracking navigate={navigate} complaintId={complaintId} />}
      {page === 'complaint-history' && <ComplaintHistory navigate={navigate} />}
      {page === 'admin' && <AdminDashboard navigate={navigate} />}
      {page === 'admin-complaint-details' && <AdminComplaintDetails navigate={navigate} complaintId={complaintId} />}
    </div>
  );
}
