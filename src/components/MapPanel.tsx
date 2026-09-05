import { useState } from 'react';
import type { MapMarker, Priority } from '../types';

const priorityColors: Record<Priority, { fill: string; stroke: string; label: string }> = {
  URGENT: { fill: '#FEF2F2', stroke: '#DC2626', label: 'Critical' },
  HIGH: { fill: '#FFF7ED', stroke: '#EA580C', label: 'High' },
  MEDIUM: { fill: '#FEFCE8', stroke: '#CA8A04', label: 'Medium' },
  LOW: { fill: '#F0FDF4', stroke: '#16A34A', label: 'Resolved' },
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
  markers: MapMarker[];
  filter?: Priority | 'ALL';
}

export default function MapPanel({ markers, filter = 'ALL' }: Props) {
  const [popup, setPopup] = useState<MapMarker | null>(null);

  const visible = filter === 'ALL' ? markers : markers.filter((m) => m.priority === filter);

  return (
    <div className="relative w-full bg-[#E8EFF7] rounded-xl overflow-hidden border border-[#D1DCE8]" style={{ paddingBottom: '55%' }}>
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
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#F0F4F8" strokeWidth="0.4" />
        ))}

        {/* park areas */}
        <rect x="40" y="47" width="20" height="21" fill="#C8E0C8" rx="0.5" opacity={0.6} />
        <rect x="64" y="72" width="16" height="14" fill="#C8E0C8" rx="0.5" opacity={0.4} />

        {/* water body */}
        <ellipse cx="8" cy="10" rx="7" ry="6" fill="#AFC8E0" opacity={0.7} />

        {/* markers */}
        {visible.map((m) => {
          const { fill, stroke } = priorityColors[m.priority];
          const r = m.isCluster ? 3.2 : 2.2;
          return (
            <g
              key={m.id}
              onClick={(e) => {
                e.stopPropagation();
                setPopup(popup?.id === m.id ? null : m);
              }}
              className="cursor-pointer"
              style={{ transform: `translate(${m.x}%, ${m.y}%)` }}
            >
              {/* pulse ring for urgent */}
              {m.priority === 'URGENT' && (
                <circle cx="0" cy="0" r={r + 1.5} fill={stroke} opacity={0.2} />
              )}
              <circle cx="0" cy="0" r={r} fill={fill} stroke={stroke} strokeWidth="0.8" />
              {m.isCluster && m.count ? (
                <text x="0" y="0" textAnchor="middle" dominantBaseline="central" fontSize="1.8" fontWeight="700" fill={stroke} fontFamily="JetBrains Mono, monospace">
                  {m.count}
                </text>
              ) : (
                <circle cx="0" cy="0" r="0.8" fill={stroke} />
              )}
            </g>
          );
        })}
      </svg>

      {/* popup */}
      {popup && (
        <div
          className="absolute bg-white rounded-lg shadow-lg border border-[#D1DCE8] p-3 text-xs z-10 w-44 animate-fadeIn"
          style={{
            left: `${Math.min(popup.x, 70)}%`,
            top: `${Math.max(popup.y - 18, 2)}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: priorityColors[popup.priority].stroke }}
            />
            <span className="font-semibold text-[#0F1C2E]">{popup.issue}</span>
          </div>
          {popup.count && (
            <p className="text-[#5A7090]">
              <span className="font-mono font-semibold text-[#0F1C2E]">{popup.count}</span> complaints in this area
            </p>
          )}
          <p className="text-[#5A7090] mt-0.5">Within 500m · Last 7 days</p>
          <div className="mt-1.5 pt-1.5 border-t border-[#D1DCE8]">
            <span className="font-mono text-[10px] font-semibold" style={{ color: priorityColors[popup.priority].stroke }}>
              {popup.priority}
            </span>
          </div>
        </div>
      )}

      {/* legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg border border-[#D1DCE8] px-3 py-2 flex flex-col gap-1.5">
        {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((p) => (
          <div key={p} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: priorityColors[p].stroke, background: priorityColors[p].fill }} />
            <span className="text-[#5A7090] font-medium">{priorityColors[p].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
