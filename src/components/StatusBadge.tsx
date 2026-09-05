import type { Status } from '../types';

const config: Record<Status, { dot: string; className: string }> = {
  Submitted: { dot: 'bg-blue-400', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Under Review': { dot: 'bg-amber-400', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  'In Progress': { dot: 'bg-orange-400', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  Resolved: { dot: 'bg-green-500', className: 'bg-green-50 text-green-700 border-green-200' },
  Rejected: { dot: 'bg-red-500', className: 'bg-red-50 text-red-700 border-red-200' },
};

interface Props {
  status: Status;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const { dot, className } = config[status] ?? config['Submitted'];
  const textSize = size === 'md' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${className} ${textSize}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
