import type { Page } from '../types';
import Navbar from '../components/Navbar';
import ComplaintCard from '../components/ComplaintCard';
import { complaints } from '../data/mockData';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
}

const stats = [
  { label: 'Total Reports', value: 8, icon: '📋', color: 'bg-[#EBF0F8] text-[#1B3A6B]' },
  { label: 'Pending', value: 3, icon: '⏳', color: 'bg-amber-50 text-amber-700' },
  { label: 'In Progress', value: 2, icon: '🔄', color: 'bg-orange-50 text-orange-700' },
  { label: 'Resolved', value: 3, icon: '✅', color: 'bg-green-50 text-green-700' },
];

export default function CitizenDashboard({ navigate }: Props) {
  const recentComplaints = complaints.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar navigate={navigate} currentPage="dashboard" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#0F1C2E]">Good morning, Citizen 👋</h1>
            <p className="text-[#5A7090] text-sm mt-0.5">Keep track of your civic reports and their progress.</p>
          </div>
          <button
            onClick={() => navigate('report')}
            className="inline-flex items-center gap-2 bg-[#1B3A6B] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#142E57] transition-colors shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Report New Issue
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#D1DCE8] p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
              </div>
              <p className="font-display font-bold text-3xl text-[#0F1C2E]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent complaints */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[#0F1C2E] text-lg">Recent Complaints</h2>
              <button
                onClick={() => navigate('complaint-history')}
                className="text-sm text-[#2563EB] font-medium hover:underline"
              >
                View all →
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {recentComplaints.map((c) => (
                <ComplaintCard key={c.id} complaint={c} navigate={navigate} />
              ))}
            </div>
          </div>

          {/* Quick actions + activity */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: 'Report an Issue', icon: '📝', page: 'report' as Page, primary: true },
                  { label: 'Track a Case', icon: '🔍', page: 'case-tracking' as Page, primary: false },
                  { label: 'Complaint History', icon: '📚', page: 'complaint-history' as Page, primary: false },
                  { label: 'Admin Dashboard', icon: '🏛️', page: 'admin' as Page, primary: false },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.page)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      action.primary
                        ? 'bg-[#1B3A6B] text-white hover:bg-[#142E57]'
                        : 'text-[#3A4F6A] hover:bg-[#F0F4F8]'
                    }`}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                    <svg className="w-4 h-4 ml-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity summary */}
            <div className="bg-white rounded-xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] mb-4">Activity This Month</h3>
              <div className="space-y-3">
                {[
                  { label: 'Resolved quickly', desc: 'CL-10398 resolved in 6 hours', icon: '✅' },
                  { label: 'Department assigned', desc: 'CL-10482 — Municipal Sanitation', icon: '🏢' },
                  { label: 'New report filed', desc: 'CL-10471 — Pothole reported', icon: '📝' },
                ].map((a) => (
                  <div key={a.label} className="flex items-start gap-2.5 text-xs">
                    <span className="text-base mt-0.5">{a.icon}</span>
                    <div>
                      <p className="font-medium text-[#0F1C2E]">{a.label}</p>
                      <p className="text-[#5A7090]">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
