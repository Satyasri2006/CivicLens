export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type Status = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';
export type Category = 'Sanitation' | 'Roads' | 'Electricity' | 'Water' | 'Drainage' | 'Infrastructure' | 'Other';
export type InputMode = 'text' | 'voice' | 'photo';
export type AdminView = 'overview' | 'complaints' | 'map' | 'hotspots' | 'analytics' | 'settings';

export interface Complaint {
  id: string;
  issue: string;
  category: Category;
  department: string;
  priority: Priority;
  location: string;
  status: Status;
  date: string;
  description: string;
  aiSummary?: string;
  severity?: string;
  duration?: string;
  safetyRisk?: string;
  evidence?: number;
  evidenceFiles?: string[];
}

export function formatComplaint(c: any): Complaint {
  if (!c) return c;

  const statusMap: Record<string, Status> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected',
  };

  const rawStatus = typeof c.status === 'string' ? c.status.toLowerCase() : '';
  const status: Status = statusMap[rawStatus] || c.status || 'Submitted';

  let locationStr = 'Specified Area';
  if (typeof c.location === 'string') {
    locationStr = c.location;
  } else if (c.location && typeof c.location.address === 'string') {
    locationStr = c.location.address;
  }

  let dateStr = 'Today';
  if (c.date) {
    dateStr = c.date;
  } else if (c.createdAt) {
    dateStr = new Date(c.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const evidenceList = Array.isArray(c.evidence) ? c.evidence : [];

  return {
    id: c.caseId || c.id || c._id || 'CL-00000',
    issue: c.issueType || c.issue || (c.description ? c.description.substring(0, 35) : 'Civic Issue'),
    category: (c.category as Category) || 'Sanitation',
    department: c.department || 'Municipal Sanitation Department',
    priority: (c.priority as Priority) || 'HIGH',
    location: locationStr,
    status,
    date: dateStr,
    description: c.description || '',
    aiSummary: c.aiAnalysis?.summary || c.aiSummary || c.description || '',
    severity: c.severity || 'High',
    duration: c.duration || 'Recent',
    safetyRisk: c.aiAnalysis?.safetyRisk || c.safetyRisk || 'Moderate',
    evidence: typeof c.evidence === 'number' ? c.evidence : evidenceList.length,
    evidenceFiles: evidenceList,
  };
}

export interface AiInsight {
  id: number;
  type: string;
  title: string;
  description: string;
  primaryIssue: string;
  recommendation: string;
  count: number;
  area: string;
  severity: string;
}

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  priority: Priority;
  issue: string;
  count?: number;
  isCluster?: boolean;
}

export type Page =
  | 'landing'
  | 'dashboard'
  | 'report'
  | 'ai-analysis'
  | 'generated-complaint'
  | 'success'
  | 'case-tracking'
  | 'complaint-history'
  | 'admin'
  | 'admin-complaint-details';

export interface NavigateOptions {
  complaintId?: string;
}
