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
  complaints?: Complaint[];
}

export default function CaseTracking({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  complaintId = 'CL-10482',
  complaints = [],
}: Props) {
  const complaint = complaints.find((c) => c.id === complaintId) || complaints[0] || {
    id: complaintId,
    issue: 'Garbage accumulation',
    category: 'Sanitation',
    department: 'Municipal Sanitation Department',
    priority: 'HIGH',
    location: 'Block B, XYZ Road',
    status: 'Submitted',
    date: 'Today',
    description: 'Civic complaint submitted via CivicLens AI.',
  };

  const timelineEvents = [
    { label: 'Complaint Created', time: `${complaint.date}, 10:32 AM`, done: true, desc: 'Citizen submitted report via CivicLens.' },
    { label: 'AI Analysis Completed', time: `${complaint.date}, 10:33 AM`, done: true, desc: `Issue classified as ${complaint.category} · ${complaint.priority} priority.` },
    { label: 'Submitted to Department', time: `${complaint.date}, 10:34 AM`, done: true, desc: `Forwarded to ${complaint.department}.` },
    {
      label: 'Department Review',
      time: complaint.status !== 'Submitted' ? 'Completed' : 'In Progress',
      done: complaint.status !== 'Submitted',
      active: complaint.status === 'Submitted',
      desc: 'Reviewing by department supervisor.',
    },
    {
      label: 'Field Action',
      time: complaint.status === 'In Progress' || complaint.status === 'Resolved' ? 'Active' : 'Pending',
      done: complaint.status === 'Resolved',
      active: complaint.status === 'In Progress',
      desc: 'Field team dispatch and on-site inspection.',
    },
    {
      label: 'Resolved',
      time: complaint.status === 'Resolved' ? 'Closed' : '',
      done: complaint.status === 'Resolved',
      desc: 'Issue resolved and case closed.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar
        navigate={navigate}
        currentPage="dashboard"
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('dashboard')} className="text-[#5A7090] hover:text-[#1B3A6B] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display font-bold text-xl text-[#0F1C2E]">Case {complaint.id}</h1>
            <p className="text-[#5A7090] text-sm">{complaint.issue} · {complaint.date}</p>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <PriorityBadge priority={complaint.priority} size="md" />
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">{complaint.category}</span>
          <StatusBadge status={complaint.status} size="md" />
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Timeline */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-[#D1DCE8] p-5">
            <h2 className="font-display font-semibold text-[#0F1C2E] mb-5">Case Timeline</h2>
            <div className="space-y-0">
              {timelineEvents.map((event, i) => (
                <div key={event.label} className="flex gap-4">
                  {/* Dot + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      event.done
                        ? 'bg-green-500 border-green-500'
                        : event.active
                        ? 'bg-white border-[#1B3A6B]'
                        : 'bg-white border-[#D1DCE8]'
                    }`}>
                      {event.done ? (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : event.active ? (
                        <div className="w-2 h-2 rounded-full bg-[#1B3A6B] animate-pulse" />
                      ) : null}
                    </div>
                    {i < timelineEvents.length - 1 && (
                      <div className={`w-0.5 h-12 mt-1 ${event.done ? 'bg-green-300' : 'bg-[#D1DCE8]'}`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-8 flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-medium ${event.done ? 'text-[#0F1C2E]' : event.active ? 'text-[#1B3A6B]' : 'text-[#8BA3BC]'}`}>
                        {event.label}
                      </span>
                      {event.time && (
                        <span className="font-mono text-xs text-[#8BA3BC]">{event.time}</span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${event.done ? 'text-[#5A7090]' : event.active ? 'text-[#3A4F6A]' : 'text-[#C0CDD9]'}`}>
                      {event.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">Complaint Details</h3>
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Case ID', value: complaint.id, mono: true },
                  { label: 'Issue', value: complaint.issue },
                  { label: 'Category', value: complaint.category },
                  { label: 'Department', value: complaint.department },
                  { label: 'Location', value: complaint.location },
                  { label: 'Duration', value: complaint.duration ?? 'N/A' },
                  { label: 'Safety Risk', value: complaint.safetyRisk ?? 'N/A' },
                  { label: 'Evidence', value: `${complaint.evidence ?? 1} photo(s)` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between gap-3">
                    <span className="text-[#8BA3BC] font-medium shrink-0">{row.label}</span>
                    <span className={`text-[#0F1C2E] text-right truncate max-w-[140px] ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-3">Citizen Description</h3>
              <p className="text-xs text-[#5A7090] leading-relaxed">{complaint.description}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate('complaint-history')}
                className="w-full text-sm border border-[#D1DCE8] text-[#3A4F6A] font-medium py-2.5 rounded-xl hover:bg-white transition-colors"
              >
                View All Complaints
              </button>
              <button
                onClick={() => navigate('report')}
                className="w-full text-sm bg-[#1B3A6B] text-white font-semibold py-2.5 rounded-xl hover:bg-[#142E57] transition-colors"
              >
                + Report Another Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
