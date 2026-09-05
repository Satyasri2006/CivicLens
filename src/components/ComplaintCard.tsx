import type { Complaint, Page } from '../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

interface Props {
  complaint: Complaint;
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
}

export default function ComplaintCard({ complaint, navigate }: Props) {
  return (
    <div
      onClick={() => navigate('case-tracking', { complaintId: complaint.id })}
      className="bg-white rounded-xl border border-[#D1DCE8] p-4 hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <span className="font-mono text-xs text-[#5A7090] block mb-1">{complaint.id}</span>
          <h4 className="font-display font-semibold text-[#0F1C2E] text-sm leading-tight group-hover:text-[#1B3A6B] transition-colors">
            {complaint.issue}
          </h4>
        </div>
        <PriorityBadge priority={complaint.priority} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <StatusBadge status={complaint.status} />
        <span className="inline-flex items-center gap-1 text-xs text-[#5A7090] bg-[#F0F4F8] px-2.5 py-0.5 rounded-full">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {complaint.department}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-[#5A7090]">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {complaint.location}
        </span>
        <span>{complaint.date}</span>
      </div>
    </div>
  );
}
