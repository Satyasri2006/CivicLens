import type { Page, Complaint } from '../types';
import type { User } from '../App';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
  complaintId?: string;
  complaint?: Complaint;
}

export default function SuccessPage({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  complaintId = 'CL-10482',
  complaint,
}: Props) {
  const displayIssue = complaint?.issue || 'Garbage accumulation';
  const displayDept = complaint?.department || 'Municipal Sanitation';
  const displayLoc = complaint?.location || 'Block B, XYZ Road';
  const displayEvidence = complaint?.evidence ? `${complaint.evidence} photo(s)` : '1 photo';

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar
        navigate={navigate}
        currentPage="report"
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <div className="max-w-xl mx-auto px-4 py-12 text-center animate-fadeInUp">
        {/* Success icon */}
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-9 h-9 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="absolute -inset-2 rounded-full border-4 border-green-200 opacity-50" />
        </div>

        <h1 className="font-display font-bold text-2xl text-[#0F1C2E] mb-2">Complaint Submitted Successfully</h1>
        <p className="text-[#5A7090] text-sm mb-6">Your civic issue has been recorded. The responsible department will be notified.</p>

        {/* Case ID */}
        <div className="inline-flex items-center gap-3 bg-[#1B3A6B] text-white px-6 py-3 rounded-xl mb-6 shadow-lg">
          <span className="text-sm font-medium text-white/70">Case ID</span>
          <span className="font-mono font-bold text-xl"># {complaintId}</span>
        </div>

        {/* Summary card */}
        <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5 text-left mb-6">
          <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">Submission Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5A7090]">Issue</span>
              <span className="font-medium text-[#0F1C2E] truncate max-w-[200px]">{displayIssue}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5A7090]">Department</span>
              <span className="font-medium text-[#0F1C2E]">{displayDept}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5A7090]">Priority</span>
              <PriorityBadge priority={complaint?.priority || 'HIGH'} />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5A7090]">Location</span>
              <span className="font-medium text-[#0F1C2E]">{displayLoc}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5A7090]">Evidence</span>
              <span className="font-medium text-[#0F1C2E]">{displayEvidence}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-[#D1DCE8] pt-3">
              <span className="text-[#5A7090]">Status</span>
              <StatusBadge status={complaint?.status || 'Submitted'} size="md" />
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">What happens next?</p>
          <ul className="space-y-1.5 text-xs text-blue-700">
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />{displayDept} will review your complaint</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />A field team will be assigned for inspection</li>
            <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />You'll be notified when the status changes</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('case-tracking', { complaintId })}
            className="flex-1 bg-[#1B3A6B] text-white font-semibold py-3 rounded-xl hover:bg-[#142E57] transition-colors text-sm shadow-sm"
          >
            Track Complaint →
          </button>
          <button
            onClick={() => navigate('dashboard')}
            className="flex-1 border border-[#D1DCE8] text-[#3A4F6A] font-medium py-3 rounded-xl hover:bg-white transition-colors text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
