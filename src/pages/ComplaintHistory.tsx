import { useState } from 'react';
import type { Page, Status, Priority, Complaint } from '../types';
import type { User } from '../App';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
  complaints: Complaint[];
}

const statusFilters: (Status | 'All')[] = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved'];
const priorityFilters: (Priority | 'All')[] = ['All', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function ComplaintHistory({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  complaints,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [search, setSearch] = useState('');

  const filtered = complaints.filter((c) => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && c.priority !== priorityFilter) return false;
    if (search && !c.issue.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar
        navigate={navigate}
        currentPage="complaint-history"
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-[#0F1C2E]">Complaint History</h1>
            <p className="text-[#5A7090] text-sm">{filtered.length} complaints found</p>
          </div>
          <button
            onClick={() => navigate('report')}
            className="inline-flex items-center gap-2 bg-[#1B3A6B] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#142E57] transition-colors text-sm"
          >
            + Report New Issue
          </button>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl border border-[#D1DCE8] p-4 mb-5 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by issue or case ID..."
            className="w-full border border-[#D1DCE8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] text-[#0F1C2E] placeholder:text-[#8BA3BC]"
          />
          <div className="flex flex-wrap gap-3">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-[#5A7090] font-medium mr-1">Status:</span>
              {statusFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    statusFilter === f
                      ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                      : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-[#5A7090] font-medium mr-1">Priority:</span>
              {priorityFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setPriorityFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-mono font-semibold transition-all ${
                    priorityFilter === f
                      ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                      : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table View for Desktop / Card View for Mobile */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D1DCE8] p-16 flex flex-col items-center text-center">
            <span className="text-4xl mb-3">🔍</span>
            <h3 className="font-display font-semibold text-[#0F1C2E] mb-1">No complaints found</h3>
            <p className="text-[#5A7090] text-sm">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block bg-white rounded-xl border border-[#D1DCE8] overflow-hidden">
              <div className="grid grid-cols-[1fr,1.5fr,1fr,1.2fr,1fr,1fr,1fr] gap-4 px-5 py-3 bg-[#F8FAFC] border-b border-[#D1DCE8] text-xs font-semibold text-[#5A7090] uppercase tracking-wider">
                <span>Case ID</span>
                <span>Issue</span>
                <span>Category</span>
                <span>Department</span>
                <span>Priority</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              <div className="divide-y divide-[#F0F4F8]">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate('case-tracking', { complaintId: c.id })}
                    className="w-full grid grid-cols-[1fr,1.5fr,1fr,1.2fr,1fr,1fr,1fr] gap-4 px-5 py-4 text-left hover:bg-[#F8FAFC] transition-colors group items-center"
                  >
                    <span className="font-mono text-xs text-[#2563EB] font-semibold group-hover:underline">{c.id}</span>
                    <span className="text-sm font-medium text-[#0F1C2E] truncate">{c.issue}</span>
                    <span className="text-sm text-[#5A7090]">{c.category}</span>
                    <span className="text-xs text-[#5A7090] truncate">{c.department}</span>
                    <div><PriorityBadge priority={c.priority} /></div>
                    <span className="text-xs text-[#5A7090]">{c.date}</span>
                    <div><StatusBadge status={c.status} /></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Card View (< 768px) */}
            <div className="md:hidden space-y-3">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('case-tracking', { complaintId: c.id })}
                  className="bg-white rounded-xl border border-[#D1DCE8] p-4 space-y-3 cursor-pointer hover:border-[#2563EB] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-[#2563EB] font-semibold">{c.id}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h4 className="font-display font-semibold text-[#0F1C2E] text-sm">{c.issue}</h4>
                  <div className="flex items-center justify-between text-xs text-[#5A7090]">
                    <span>{c.category} · {c.date}</span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
