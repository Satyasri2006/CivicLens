import type { AiInsight } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  sanitation: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  roads: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  water: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1M4.22 4.22l.707.707M18.364 18.364l.707.707M1 12h1m20 0h1M4.22 19.778l.707-.707M18.364 5.636l.707-.707M12 7a5 5 0 000 10" />
    </svg>
  ),
};

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  HIGH: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

interface Props {
  insight: AiInsight;
}

export default function InsightCard({ insight }: Props) {
  const sev = severityColors[insight.severity] ?? severityColors.LOW;
  const iconBg = insight.type === 'sanitation' ? 'bg-orange-100 text-orange-600' : insight.type === 'roads' ? 'bg-blue-100 text-blue-600' : 'bg-cyan-100 text-cyan-600';

  return (
    <div className="bg-white rounded-xl border border-[#D1DCE8] p-5 hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          {iconMap[insight.type] ?? iconMap.sanitation}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-display font-semibold text-[#0F1C2E] text-sm leading-tight">{insight.title}</h4>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${sev.bg} ${sev.text} ${sev.border} shrink-0`}>
              {insight.severity}
            </span>
          </div>
          <p className="text-[#5A7090] text-xs">{insight.area} · {insight.count} reports</p>
        </div>
      </div>

      <p className="text-sm text-[#3A4F6A] leading-relaxed mb-3">{insight.description}</p>

      <div className="bg-[#F0F4F8] rounded-lg p-3 space-y-2">
        <div>
          <span className="text-xs text-[#5A7090] font-medium uppercase tracking-wide">Primary Issue</span>
          <p className="text-sm font-medium text-[#0F1C2E] mt-0.5">{insight.primaryIssue}</p>
        </div>
        <div className="border-t border-[#D1DCE8] pt-2">
          <span className="text-xs text-[#5A7090] font-medium uppercase tracking-wide">Recommended Action</span>
          <p className="text-sm text-[#2563EB] font-medium mt-0.5">{insight.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
