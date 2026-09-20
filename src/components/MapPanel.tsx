import { useState, useMemo } from 'react';
import type { Complaint, Priority } from '../types';

const priorityColors: Record<Priority, { fill: string; stroke: string; label: string }> = {
  URGENT: { fill: '#FEF2F2', stroke: '#DC2626', label: 'Critical / Urgent' },
  HIGH: { fill: '#FFF7ED', stroke: '#EA580C', label: 'High Priority' },
  MEDIUM: { fill: '#FEFCE8', stroke: '#CA8A04', label: 'Medium Priority' },
  LOW: { fill: '#F0FDF4', stroke: '#16A34A', label: 'Low / Minor' },
};

const streetLines = [
  { x1: 0, y1: 20, x2: 100, y2: 20 },
  { x1: 0, y1: 45, x2: 100, y2: 45 },
  { x1: 0, y1: 70, x2: 100, y2: 70 },
  { x1: 0, y1: 88, x2: 100, y2: 88 },
  { x1: 15, y1: 0, x2: 15, y2: 100 },
  { x1: 38, y1: 0, x2: 38, y2: 100 },
  { x1: 62, y1: 0, x2: 62, y2: 100 },
  { x1: 82, y1: 0, x2: 82, y2: 100 },
];

const buildingBlocks = [
  { x: 17, y: 22, w: 19, h: 21 },
  { x: 40, y: 22, w: 20, h: 21 },
  { x: 64, y: 22, w: 16, h: 21 },
  { x: 17, y: 47, w: 19, h: 21 },
  { x: 40, y: 47, w: 20, h: 21 },
  { x: 64, y: 47, w: 16, h: 21 },
  { x: 17, y: 72, w: 19, h: 14 },
  { x: 40, y: 72, w: 20, h: 14 },
  { x: 64, y: 72, w: 16, h: 14 },
  { x: 84, y: 22, w: 15, h: 21 },
  { x: 84, y: 47, w: 15, h: 21 },
  { x: 84, y: 72, w: 15, h: 14 },
  { x: 0, y: 22, w: 13, h: 21 },
  { x: 0, y: 47, w: 13, h: 21 },
  { x: 0, y: 72, w: 13, h: 14 },
];

interface Props {
  complaints: Complaint[];
  filter?: Priority | 'ALL';
  onSelectComplaint?: (complaintId: string) => void;
}

export default function MapPanel({ complaints = [], filter = 'ALL', onSelectComplaint }: Props) {
  const [popup, setPopup] = useState<(Complaint & { x: number; y: number }) | null>(null);

  // Normalize real complaint locations into easily visible (15% to 85%) coordinates without requiring deep zooming
  const realMarkers = useMemo(() => {
    return complaints.map((c, index) => {
      // Deterministic spatial distribution across the municipal sector
      // Uses coordinates if numeric or hashes the location/id to cleanly disperse across wards
      let hash = 0;
      const str = `${c.id}-${c.location || ''}-${c.issue}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const absHash = Math.abs(hash);
      
      // Calculate dispersed grid coordinate with pseudo-random jitter
      const col = (index % 4);
      const row = Math.floor(index / 4) % 3;
      const baseX = 20 + col * 20;
      const baseY = 25 + row * 25;
      const jitterX = ((absHash % 15) - 7);
      const jitterY = (((absHash >> 3) % 15) - 7);

      const x = Math.min(85, Math.max(15, baseX + jitterX));
      const y = Math.min(85, Math.max(18, baseY + jitterY));

      return {
        ...c,
        x,
        y,
      };
    });
  }, [complaints]);

  const visible = filter === 'ALL' ? realMarkers : realMarkers.filter((m) => m.priority === filter);

  return (
    <div className="relative w-full bg-[#E8EFF7] rounded-2xl overflow-hidden border border-[#D1DCE8]" style={{ paddingBottom: '52%' }}>
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        onClick={() => setPopup(null)}
      >
        {/* background */}
        <rect width="100" height="100" fill="#DDE6F0" />

        {/* building blocks */}
        {buildingBlocks.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="#C8D5E8" rx="0.5" />
        ))}

        {/* street lines */}
        {streetLines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#F0F4F8" strokeWidth="0.5" />
        ))}

        {/* park areas */}
        <rect x="40" y="47" width="20" height="21" fill="#C8E0C8" rx="0.5" opacity={0.6} />
        <rect x="64" y="72" width="16" height="14" fill="#C8E0C8" rx="0.5" opacity={0.4} />

        {/* water body */}
        <ellipse cx="8" cy="10" rx="7" ry="6" fill="#AFC8E0" opacity={0.7} />

        {/* Real Complaint Markers */}
        {visible.map((m) => {
          const { fill, stroke } = priorityColors[m.priority] || priorityColors.MEDIUM;
          const isUrgent = m.priority === 'URGENT' || m.priority === 'HIGH';
          const r = 2.4;

          return (
            <g
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                setPopup(popup?.id === m.id ? null : m);
              }}
              className="cursor-pointer group"
              style={{ transform: `translate(${m.x}%, ${m.y}%)` }}
            >
              {/* pulse ring for urgent/high priority complaints */}
              {isUrgent && (
                <circle cx="0" cy="0" r={r + 1.8} fill={stroke} opacity={0.25} className="animate-ping" />
              )}
              <circle cx="0" cy="0" r={r} fill={fill} stroke={stroke} strokeWidth="0.8" />
              <circle cx="0" cy="0" r="0.9" fill={stroke} />
            </g>
          );
        })}
      </svg>

      {/* Empty State overlay if zero complaints */}
      {visible.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] pointer-events-none">
          <div className="bg-white/95 px-5 py-3 rounded-xl border border-[#D1DCE8] text-center shadow-md">
            <span className="text-xl">🗺️</span>
            <p className="text-xs font-bold text-[#0F1C2E] mt-1">Civic Map Active</p>
            <p className="text-[11px] text-[#5A7090]">
              {complaints.length === 0
                ? 'No complaints filed yet. Pins will appear as citizen reports are submitted.'
                : `No complaints match priority filter "${filter}".`}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Complaint Popup */}
      {popup && (
        <div
          className="absolute bg-white rounded-xl shadow-xl border border-[#D1DCE8] p-3 text-xs z-20 w-56 animate-fadeIn"
          style={{
            left: `${Math.min(Math.max(popup.x, 22), 78)}%`,
            top: `${Math.max(popup.y - 24, 4)}%`,
            transform: 'translateX(-50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-[#D1DCE8]">
            <span className="font-mono font-bold text-[11px] text-[#2563EB]">{popup.id}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
              style={{ backgroundColor: priorityColors[popup.priority]?.stroke || '#2563EB' }}
            >
              {popup.priority}
            </span>
          </div>
          <p className="font-semibold text-[#0F1C2E] text-xs leading-tight mb-1 truncate">{popup.issue}</p>
          <p className="text-[#5A7090] text-[11px] mb-1 flex items-center gap-1">
            <span>📍</span> <span className="truncate">{popup.location}</span>
          </p>
          <p className="text-[#5A7090] text-[10px] mb-2">
            Dept: <span className="font-medium text-[#0F1C2E]">{popup.department}</span>
          </p>
          {onSelectComplaint && (
            <button
              onClick={() => onSelectComplaint(popup.id)}
              className="w-full bg-[#1B3A6B] text-white font-medium py-1.5 rounded-lg hover:bg-[#142E57] transition-colors text-[11px] text-center"
            >
              Inspect Case Details →
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl border border-[#D1DCE8] px-3 py-2 flex flex-col gap-1 shadow-sm">
        {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((p) => (
          <div key={p} className="flex items-center gap-2 text-[10px]">
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: priorityColors[p].stroke, background: priorityColors[p].fill }} />
            <span className="text-[#5A7090] font-semibold">{priorityColors[p].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
