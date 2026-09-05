import { useState, useEffect } from 'react';
import type { Page, Complaint } from './types';
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
import AuthModal from './components/AuthModal';
import { complaints as initialComplaints } from './data/mockData';
import { api } from './services/api';

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin';
}

export interface ReportData {
  inputMode: 'text' | 'voice' | 'photo';
  description: string;
  language: string;
  location: string;
  uploadedFiles: string[];
  generatedText?: string;
  aiAnalysis?: any;
}

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [complaintId, setComplaintId] = useState<string>('CL-10482');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [intendedPage, setIntendedPage] = useState<Page | null>(null);

  // Dynamic complaint management
  const [complaintList, setComplaintList] = useState<Complaint[]>(initialComplaints);
  const [activeReportData, setActiveReportData] = useState<ReportData | null>(null);

  // Restore user session on mount from API
  useEffect(() => {
    async function restoreSession() {
      try {
        const meRes = await api.auth.getMe();
        if (meRes?.user) {
          setUser(meRes.user);
          const list = await api.complaints.getMyComplaints().catch(() => []);
          if (list && list.length > 0) {
            setComplaintList(list);
          }
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
      }
    }
    restoreSession();
  }, []);

  const fetchUserComplaints = async () => {
    try {
      const list = await api.complaints.getMyComplaints();
      if (list && list.length > 0) {
        setComplaintList(list);
      }
    } catch (err) {
      console.warn('Error fetching complaints from API:', err);
    }
  };

  const navigate = (p: Page, opts?: { complaintId?: string; reportData?: ReportData }) => {
    // Protected route check for reporting an issue
    if (p === 'report' && !user) {
      setIntendedPage('report');
      setIsAuthModalOpen(true);
      return;
    }

    if (opts?.complaintId) setComplaintId(opts.complaintId);
    if (opts?.reportData) setActiveReportData(opts.reportData);
    setPage(p);
  };

  const handleOpenAuth = (targetPage?: Page) => {
    if (targetPage) setIntendedPage(targetPage);
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setPage('landing');
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    await fetchUserComplaints();

    if (intendedPage) {
      setPage(intendedPage);
      setIntendedPage(null);
    } else if (loggedInUser.role === 'admin') {
      setPage('admin');
    } else {
      setPage('dashboard');
    }
  };

  const handleNewComplaintSubmitted = (newComplaint: Complaint) => {
    setComplaintList((prev) => [newComplaint, ...prev]);
    setComplaintId(newComplaint.id || (newComplaint as any).caseId);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <div className="min-h-screen">
      {page === 'landing' && (
        <LandingPage
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />
      )}
      {page === 'dashboard' && (
        <CitizenDashboard
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          complaints={complaintList}
        />
      )}
      {page === 'report' && (
        <ReportIssue
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />
      )}
      {page === 'ai-analysis' && (
        <AIAnalysisPage
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          reportData={activeReportData}
        />
      )}
      {page === 'generated-complaint' && (
        <GeneratedComplaint
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          reportData={activeReportData}
          onComplaintSubmitted={handleNewComplaintSubmitted}
        />
      )}
      {page === 'success' && (
        <SuccessPage
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          complaintId={complaintId}
          complaint={complaintList.find((c) => c.id === complaintId || (c as any).caseId === complaintId)}
        />
      )}
      {page === 'case-tracking' && (
        <CaseTracking
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          complaintId={complaintId}
          complaints={complaintList}
        />
      )}
      {page === 'complaint-history' && (
        <ComplaintHistory
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          complaints={complaintList}
        />
      )}
      {page === 'admin' && (
        <AdminDashboard
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          complaints={complaintList}
        />
      )}
      {page === 'admin-complaint-details' && (
        <AdminComplaintDetails
          navigate={navigate}
          user={user}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          complaintId={complaintId}
          complaints={complaintList}
          setComplaints={setComplaintList}
        />
      )}

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        intendedAction={
          intendedPage === 'report'
            ? 'Please sign in or register to submit a civic issue report.'
            : undefined
        }
      />
    </div>
  );
}
