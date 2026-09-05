import { useState } from 'react';
import type { Page, Status } from '../types';
import AdminSidebar from '../components/AdminSidebar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { PriorityIndicator } from '../components/PriorityBadge';
import { complaints } from '../data/mockData';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
  complaintId?: string;
}

const activityLog = [
  { time: '2 Sep 2026, 10:34 AM', actor: 'CivicLens AI', action: 'Complaint submitted and forwarded to Municipal Sanitation Department.' },
  { time: '2 Sep 2026, 11:00 AM', actor: 'System', action: 'Priority set to HIGH based on AI analysis.' },
  { time: '2 Sep 2026, 2:15 PM', actor: 'Admin Ravi Kumar', action: 'Complaint acknowledged. Field team assigned for inspection.' },
];

const statusOptions: Status[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

export default function AdminComplaintDetails({ navigate, complaintId = 'CL-10482' }: Props) {
  const complaint = complaints.find((c) => c.id === complaintId) ?? complaints[0];
  const [status, setStatus] = useState<Status>(complaint.status);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdateStatus = (newStatus: Status) => {
    setStatus(newStatus);
    setShowStatusDropdown(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <AdminSidebar activeView="complaints" onViewChange={() => {}} navigate={navigate} />

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-[#D1DCE8] px-6 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button
            onClick={() => navigate('admin')}
            className="text-[#5A7090] hover:text-[#1B3A6B] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-lg text-[#0F1C2E]">Complaint Details</h1>
              <span className="font-mono text-sm text-[#5A7090]">{complaint.id}</span>
            </div>
            <p className="text-xs text-[#5A7090]">{complaint.issue} · Filed {complaint.date}</p>
          </div>
          <div className="flex gap-2 items-center">
            {saved && (
              <span className="text-xs text-green-600 font-medium animate-fadeIn">Status updated ✓</span>
            )}
            <PriorityBadge priority={complaint.priority} size="md" />
            <StatusBadge status={status} size="md" />
          </div>
        </div>

        <div className="p-6 grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Complaint info */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h2 className="font-display font-semibold text-[#0F1C2E] mb-4 pb-3 border-b border-[#D1DCE8]">Complaint Information</h2>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Case ID', value: complaint.id, mono: true },
                  { label: 'Issue', value: complaint.issue },
                  { label: 'Category', value: complaint.category },
                  { label: 'Severity', value: complaint.severity ?? 'High' },
                  { label: 'Department', value: complaint.department },
                  { label: 'Location', value: complaint.location },
                  { label: 'Duration', value: complaint.duration ?? 'N/A' },
                  { label: 'Safety Risk', value: complaint.safetyRisk ?? 'N/A' },
                ].map((row) => (
                  <div key={row.label}>
                    <span className="text-xs text-[#8BA3BC] font-medium uppercase tracking-wide">{row.label}</span>
                    <p className={`font-medium text-[#0F1C2E] mt-0.5 ${row.mono ? 'font-mono' : ''}`}>{row.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen description */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h2 className="font-display font-semibold text-[#0F1C2E] mb-3">Citizen Description</h2>
              <p className="text-sm text-[#3A4F6A] leading-relaxed bg-[#F8FAFC] rounded-xl p-4 border border-[#D1DCE8]">
                "{complaint.description}"
              </p>
            </div>

            {/* AI Analysis */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#EBF0F8] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#1B3A6B]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="font-display font-semibold text-[#0F1C2E]">AI Summary</h2>
              </div>
              <p className="text-sm text-[#3A4F6A] leading-relaxed mb-4">{complaint.aiSummary}</p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">AI Priority Justification</p>
                <p className="text-sm text-amber-800 leading-relaxed mb-3">
                  "The waste has remained uncollected for five days in a public area near an educational institution, which may create hygiene and public-health risks for students and residents."
                </p>
                <PriorityIndicator current={complaint.priority} />
              </div>
            </div>

            {/* Generated complaint */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h2 className="font-display font-semibold text-[#0F1C2E] mb-3">Generated Complaint</h2>
              <div className="bg-[#F8FAFC] border border-[#D1DCE8] rounded-xl p-4">
                <p className="text-xs text-[#5A7090] font-medium mb-2">Subject: Urgent Garbage Accumulation Complaint</p>
                <p className="text-sm text-[#3A4F6A] leading-relaxed">
                  Garbage has remained uncollected near Block B on XYZ Road for approximately five days. The accumulated waste is creating an unhygienic environment and may pose a public-health concern to residents and students in the area. Immediate action is requested from the Municipal Sanitation Department to address this issue.
                </p>
              </div>
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h2 className="font-display font-semibold text-[#0F1C2E] mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {activityLog.map((entry, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[#EBF0F8] flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-[#1B3A6B]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#3A4F6A]">{entry.action}</p>
                      <p className="text-xs text-[#8BA3BC] mt-0.5">
                        <span className="font-medium text-[#5A7090]">{entry.actor}</span> · {entry.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Admin actions sidebar */}
          <div className="space-y-4">
            {/* Evidence */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-3">Evidence</h3>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-[#F0F4F8] rounded-xl aspect-square flex items-center justify-center border border-[#D1DCE8]">
                    <span className="text-3xl">🗑️</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#5A7090] mt-2 text-center">{complaint.evidence} photo(s) attached</p>
            </div>

            {/* Update Status */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-3">Admin Actions</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[#5A7090] font-medium mb-1.5">Update Status</p>
                  <div className="relative">
                    <button
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full flex items-center justify-between border border-[#D1DCE8] rounded-xl px-3 py-2.5 text-sm text-[#0F1C2E] hover:border-[#2563EB] transition-colors"
                    >
                      <StatusBadge status={status} />
                      <svg className="w-4 h-4 text-[#5A7090]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute top-full mt-1 w-full bg-white border border-[#D1DCE8] rounded-xl shadow-lg z-20 overflow-hidden">
                        {statusOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleUpdateStatus(opt)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-[#F0F4F8] transition-colors"
                          >
                            <StatusBadge status={opt} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-[#5A7090] font-medium mb-1.5">Assign Department</p>
                  <select className="w-full border border-[#D1DCE8] rounded-xl px-3 py-2.5 text-sm text-[#0F1C2E] focus:outline-none focus:border-[#2563EB] bg-white">
                    <option>Municipal Sanitation</option>
                    <option>Public Works Department</option>
                    <option>City Electricity Board</option>
                    <option>Water Supply Board</option>
                    <option>Drainage & Sewage Dept</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs text-[#5A7090] font-medium mb-1.5">Change Priority</p>
                  <div className="grid grid-cols-4 gap-1">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
                      <button
                        key={p}
                        className={`text-xs py-1.5 rounded-lg border font-mono font-semibold transition-all ${
                          p === complaint.priority ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="w-full bg-[#1B3A6B] text-white font-semibold py-2.5 rounded-xl hover:bg-[#142E57] transition-colors text-sm mt-2">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-3">Admin Notes</h3>
              <textarea
                placeholder="Add internal notes here..."
                rows={4}
                className="w-full border border-[#D1DCE8] rounded-xl p-3 text-sm text-[#0F1C2E] resize-none focus:outline-none focus:border-[#2563EB] placeholder:text-[#8BA3BC]"
              />
              <button className="w-full border border-[#D1DCE8] text-[#5A7090] font-medium py-2 rounded-xl hover:bg-[#F0F4F8] transition-colors text-sm mt-2">
                Add Note
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
