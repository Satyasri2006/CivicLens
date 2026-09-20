import { useState, useEffect } from 'react';
import type { Page, Complaint } from './types';
import { formatComplaint } from './types';
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
  uploadedFileObjects?: File[];
  generatedText?: string;
  aiAnalysis?: any;
}

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [complaintId, setComplaintId] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [intendedPage, setIntendedPage] = useState<Page | null>(null);

  // Dynamic complaint management (strictly isolated per user)
  const [complaintList, setComplaintList] = useState<Complaint[]>([]);
  const [activeReportData, setActiveReportData] = useState<ReportData | null>(null);

  // Restore user session on mount from API
  useEffect(() => {
    async function restoreSession() {
      try {
        const meRes = await api.auth.getMe();
        if (meRes?.user) {
          setUser(meRes.user);
          const rawList = await (meRes.user.role === 'admin'
            ? api.admin.getAllComplaints()
            : api.complaints.getMyComplaints()
          ).catch(() => []);
          setComplaintList(rawList ? rawList.map(formatComplaint) : []);
        } else {
          setComplaintList([]);
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
        setComplaintList([]);
      }
    }
    restoreSession();
  }, []);

  const fetchUserComplaints = async (currentUser?: User | null) => {
    try {
      const activeUser = currentUser !== undefined ? currentUser : user;
      if (!activeUser) {
        setComplaintList([]);
        return;
      }
      const rawList = await (activeUser.role === 'admin'
        ? api.admin.getAllComplaints()
        : api.complaints.getMyComplaints()
      ).catch(() => []);
      setComplaintList(rawList ? rawList.map(formatComplaint) : []);
    } catch (err) {
      console.warn('Error fetching complaints from API:', err);
      setComplaintList([]);
    }
  };

  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const navigate = (p: Page, opts?: { complaintId?: string; reportData?: ReportData }) => {
    // Protected route check for reporting an issue
    if (p === 'report' && !user) {
      setIntendedPage('report');
      setIsAuthModalOpen(true);
      return;
    }

    // Access control: A civilian should not have access to admin dashboard
    if ((p === 'admin' || p === 'admin-complaint-details') && user?.role !== 'admin') {
      if (!user) {
        setIntendedPage(p);
        setIsAuthModalOpen(true);
      } else {
        setAccessDeniedMessage('Access Restricted: Civilian accounts cannot access the City Official Admin Portal.');
        setTimeout(() => setAccessDeniedMessage(null), 4000);
      }
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
    setComplaintList([]);
    setComplaintId('');
    setPage('landing');
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    await fetchUserComplaints(loggedInUser);

    if (loggedInUser.role === 'admin') {
      setPage(intendedPage === 'admin-complaint-details' ? 'admin-complaint-details' : 'admin');
    } else {
      setPage(intendedPage && intendedPage !== 'admin' && intendedPage !== 'admin-complaint-details' ? intendedPage : 'dashboard');
    }
    setIntendedPage(null);
  };

  const handleNewComplaintSubmitted = (newComplaint: Complaint) => {
    const formatted = formatComplaint(newComplaint);
    setComplaintList((prev) => [formatted, ...prev]);
    setComplaintId(formatted.id);
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

      {/* Access Denied Toast */}
      {accessDeniedMessage && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fadeInUp">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-xs font-semibold">{accessDeniedMessage}</span>
          <button onClick={() => setAccessDeniedMessage(null)} className="text-white/80 hover:text-white text-sm font-bold ml-2">✕</button>
        </div>
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
