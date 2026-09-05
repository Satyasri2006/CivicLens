import type { Priority } from '../types';

const config: Record<Priority, { className: string }> = {
  LOW: { className: 'bg-gray-100 text-gray-600 border-gray-200' },
  MEDIUM: { className: 'bg-amber-50 text-amber-700 border-amber-300' },
  HIGH: { className: 'bg-red-50 text-red-700 border-red-200' },
  URGENT: { className: 'bg-purple-50 text-purple-700 border-purple-200' },
};

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, size = 'sm' }: Props) {
  const { className } = config[priority] ?? config['LOW'];
  const textSize = size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5';
  return (
    <span className={`inline-flex items-center rounded-full font-mono font-semibold border ${className} ${textSize}`}>
      {priority}
    </span>
  );
}

export function PriorityIndicator({ current }: { current: Priority }) {
  const levels: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const colors: Record<Priority, string> = {
    LOW: 'bg-gray-300',
    MEDIUM: 'bg-amber-400',
    HIGH: 'bg-red-500',
    URGENT: 'bg-purple-600',
  };
  const activeColors: Record<Priority, string> = {
    LOW: 'bg-gray-500 text-white',
    MEDIUM: 'bg-amber-500 text-white',
    HIGH: 'bg-red-600 text-white',
    URGENT: 'bg-purple-700 text-white',
  };

  return (
    <div className="flex items-center gap-0">
      {levels.map((level, i) => {
        const isActive = level === current;
        const isPast = levels.indexOf(current) >= i;
        return (
          <div key={level} className="flex items-center">
            <div
              className={`px-3 py-1 text-xs font-mono font-semibold rounded-sm transition-all ${
                isActive ? activeColors[current] : isPast ? `${colors[level]} text-white opacity-60` : 'bg-gray-100 text-gray-400'
              } ${isActive ? 'scale-105 shadow-sm' : ''}`}
            >
              {level}
            </div>
            {i < levels.length - 1 && (
              <div className={`w-4 h-0.5 ${isPast && levels.indexOf(current) > i ? colors[levels[i + 1]] : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
