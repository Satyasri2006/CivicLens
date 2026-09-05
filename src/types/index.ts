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
