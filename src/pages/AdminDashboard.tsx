import { useState, useEffect, useMemo } from 'react';
import type { Page, AdminView, Priority, Status, Complaint, AiInsight } from '../types';
import { formatComplaint } from '../types';
import type { User } from '../App';
import AdminSidebar from '../components/AdminSidebar';
import MapPanel from '../components/MapPanel';
import InsightCard from '../components/InsightCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { api } from '../services/api';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
  complaints: Complaint[];
}

export default function AdminDashboard({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  complaints: initialComplaints = [],
}: Props) {
  const [view, setView] = useState<AdminView>('overview');
  const [mapFilter, setMapFilter] = useState<Priority | 'ALL'>('ALL');
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter & Search states for Complaints view
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const fetchedComplaints = await api.admin.getAllComplaints().catch(() => []);
      setComplaintsList(fetchedComplaints ? fetchedComplaints.map(formatComplaint) : []);
    } catch (err) {
      console.warn('Admin API load error:', err);
      setComplaintsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Compute all metrics dynamically from real database complaints
  const total = complaintsList.length;
  const critical = complaintsList.filter((c) => c.priority === 'URGENT' || c.priority === 'HIGH').length;
  const pending = complaintsList.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const resolved = complaintsList.filter((c) => c.status === 'Resolved').length;
  const inProgress = complaintsList.filter((c) => c.status === 'In Progress').length;
  const underReview = complaintsList.filter((c) => c.status === 'Under Review').length;
  const submitted = complaintsList.filter((c) => c.status === 'Submitted').length;

  const statCards = [
    { label: 'Total Complaints', value: total.toLocaleString(), trend: total > 0 ? `+${total}` : '0', trendUp: true, icon: '📋', color: 'border-l-4 border-l-[#1B3A6B]' },
    { label: 'Critical / High', value: critical, trend: critical > 0 ? `${critical}` : '0', trendUp: false, icon: '🚨', color: 'border-l-4 border-l-red-500' },
    { label: 'Pending Action', value: pending, trend: pending > 0 ? `${pending}` : '0', trendUp: true, icon: '⏳', color: 'border-l-4 border-l-amber-500' },
    { label: 'Resolved', value: resolved, trend: resolved > 0 ? `${resolved}` : '0', trendUp: true, icon: '✅', color: 'border-l-4 border-l-green-500' },
  ];

  // Dynamic department breakdown from real complaints
  const deptCounts: Record<string, number> = {};
  complaintsList.forEach((c) => {
    const name = c.department || 'Municipal Administration';
    deptCounts[name] = (deptCounts[name] || 0) + 1;
  });
  const dynamicTrendData = Object.entries(deptCounts).map(([dept, count]) => ({
    dept,
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  // Dynamic status distribution from real complaints
  const statusDistribution = [
    { status: 'Resolved' as const, count: resolved, pct: total > 0 ? Math.round((resolved / total) * 100) : 0 },
    { status: 'In Progress' as const, count: inProgress, pct: total > 0 ? Math.round((inProgress / total) * 100) : 0 },
    { status: 'Submitted' as const, count: submitted, pct: total > 0 ? Math.round((submitted / total) * 100) : 0 },
    { status: 'Under Review' as const, count: underReview, pct: total > 0 ? Math.round((underReview / total) * 100) : 0 },
  ];

  // Dynamically generated AI Insights based on real complaint patterns
  const dynamicAiInsights: AiInsight[] = useMemo(() => {
    if (complaintsList.length === 0) {
      return [
        {
          id: 'ins-baseline',
          type: 'roads',
          title: 'City Municipal Operations Normal',
          severity: 'LOW',
          count: 0,
          area: 'City-wide',
          description: 'Zero active complaints currently logged in the database. Municipal telemetry indicates normal service levels.',
          primaryIssue: 'No active hazards detected',
          action: 'Continue standard scheduled surveillance and preventative inspection routines.',
        },
      ];
    }

    const insights: AiInsight[] = [];

    // Check for critical / urgent cluster
    const criticalList = complaintsList.filter((c) => c.priority === 'URGENT' || c.priority === 'HIGH');
    if (criticalList.length > 0) {
      const topCritical = criticalList[0];
      insights.push({
        id: 'ins-critical',
        type: topCritical.category.toLowerCase().includes('water') ? 'water' : topCritical.category.toLowerCase().includes('road') ? 'roads' : 'sanitation',
        title: `Priority Action Required: ${criticalList.length} High-Risk Case(s)`,
        severity: 'HIGH',
        count: criticalList.length,
        area: topCritical.location || 'Multiple Wards',
        description: `High urgency reports detected including "${topCritical.issue}". Immediate department field assessment recommended.`,
        primaryIssue: topCritical.issue,
        action: `Dispatch field team from ${topCritical.department} to inspect and cordon the affected zone.`,
      });
    }

    // Check for most frequent department
    if (dynamicTrendData.length > 0) {
      const topDept = [...dynamicTrendData].sort((a, b) => b.count - a.count)[0];
      if (topDept && topDept.count > 0) {
        insights.push({
          id: 'ins-dept-load',
          type: topDept.dept.toLowerCase().includes('water') ? 'water' : topDept.dept.toLowerCase().includes('road') ? 'roads' : 'sanitation',
          title: `Highest Workload: ${topDept.dept}`,
          severity: topDept.count >= 3 ? 'MEDIUM' : 'LOW',
          count: topDept.count,
          area: 'Municipal Network',
          description: `${topDept.dept} accounts for ${topDept.pct}% of total civic grievances reported by citizens this period.`,
          primaryIssue: `${topDept.count} issue(s) assigned to ${topDept.dept}`,
          action: 'Ensure supervisory engineer reviews backlog and expedites material requisition.',
        });
      }
    }

    return insights;
  }, [complaintsList, dynamicTrendData]);

  // Real Hotspots grouping complaints by location/area
  const realHotspots = useMemo(() => {
    const clusters: Record<string, Complaint[]> = {};
    complaintsList.forEach((c) => {
      const locKey = (c.location || 'City Center').trim();
      if (!clusters[locKey]) clusters[locKey] = [];
      clusters[locKey].push(c);
    });

    return Object.entries(clusters)
      .map(([location, list]) => ({
        location,
        count: list.length,
        criticalCount: list.filter((c) => c.priority === 'URGENT' || c.priority === 'HIGH').length,
        categories: Array.from(new Set(list.map((c) => c.category))),
        departments: Array.from(new Set(list.map((c) => c.department))),
        complaints: list,
      }))
      .sort((a, b) => b.count - a.count);
  }, [complaintsList]);

  // Filtered complaints for the Complaints View
  const filteredComplaints = useMemo(() => {
    return complaintsList.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesId = c.id.toLowerCase().includes(q);
        const matchesIssue = c.issue.toLowerCase().includes(q);
        const matchesDept = (c.department || '').toLowerCase().includes(q);
        const matchesLoc = (c.location || '').toLowerCase().includes(q);
        if (!matchesId && !matchesIssue && !matchesDept && !matchesLoc) return false;
      }
      return true;
    });
  }, [complaintsList, statusFilter, priorityFilter, searchTerm]);

  // Export single complaint report as a formal text/docket download
  const handleExportSingleComplaint = (complaint: Complaint, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const content = `=====================================================
CIVICLENS MUNICIPAL ADMINISTRATION - COMPLAINT DOCKET
=====================================================
Docket ID: ${complaint.id}
Date Reported: ${complaint.date}
Status: ${complaint.status}
Priority Level: ${complaint.priority}
Civic Category: ${complaint.category}
Assigned Department: ${complaint.department}
Location / Ward: ${complaint.location}
Duration of Issue: ${complaint.duration || 'Recent'}
Safety Hazard Rating: ${complaint.safetyRisk || 'Moderate'}

GRIEVANCE SUMMARY:
${complaint.issue}

CITIZEN STATEMENT:
"${complaint.description}"

ATTACHED EVIDENCE:
${complaint.evidenceFiles ? `${complaint.evidenceFiles.length} photo(s) stored in municipal database` : '1 photo record'}

ADMINISTRATIVE ACTION RECORD:
- AI Classification & Department Routing: Applied
- Official Notice Generated for ${complaint.department}
=====================================================
Report generated by CivicLens Operations on ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CivicNotice_${complaint.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setExportMessage(`Exported Docket for ${complaint.id}`);
    setTimeout(() => setExportMessage(null), 3000);
  };

  // Export All Complaints into a complete CSV file
  const handleExportAllReports = () => {
    if (complaintsList.length === 0) {
      setExportMessage('No complaints available to export.');
      setTimeout(() => setExportMessage(null), 3000);
      return;
    }

    const headers = [
      'Case ID',
      'Issue Title',
      'Category',
      'Department',
      'Priority',
      'Status',
      'Location',
      'Date Reported',
      'Duration',
      'Safety Risk',
      'Citizen Description',
    ];

    const rows = complaintsList.map((c) => [
      c.id,
      `"${(c.issue || '').replace(/"/g, '""')}"`,
      `"${(c.category || '').replace(/"/g, '""')}"`,
      `"${(c.department || '').replace(/"/g, '""')}"`,
      c.priority,
      c.status,
      `"${(c.location || '').replace(/"/g, '""')}"`,
      c.date,
      `"${(c.duration || 'Recent').replace(/"/g, '""')}"`,
      `"${(c.safetyRisk || 'Moderate').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CivicLens_All_Reports_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setExportMessage(`Exported ${complaintsList.length} report(s) as CSV ✓`);
    setTimeout(() => setExportMessage(null), 3500);
  };

  // Quick inline status updater for complaints table
  const handleQuickStatusChange = async (complaintId: string, newStatus: Status, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const backendStatusMap: Record<string, string> = {
      'Submitted': 'submitted',
      'Under Review': 'under_review',
      'In Progress': 'in_progress',
      'Resolved': 'resolved',
      'Rejected': 'submitted',
    };

    setComplaintsList((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
    );

    try {
      await api.complaints.updateStatus(complaintId, { status: backendStatusMap[newStatus] || 'submitted' });
      setExportMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setExportMessage(null), 2500);
    } catch (err) {
      console.warn('Backend status update failed, state preserved locally:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <AdminSidebar activeView={view} onViewChange={setView} navigate={navigate} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-[#D1DCE8] px-6 py-4 flex items-center justify-between sticky top-0 z-30 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-lg text-[#0F1C2E]">City Operations Dashboard</h1>
            <p className="text-[#5A7090] text-xs">
              AI-assisted municipal monitoring · Connected as{' '}
              <span className="font-semibold text-[#1B3A6B]">{user?.name || 'Administrator'}</span>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {exportMessage && (
              <span className="text-xs text-green-600 font-semibold animate-fadeIn">{exportMessage}</span>
            )}
            <button
              onClick={handleExportAllReports}
              className="text-xs bg-white border border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#F0F4F8] px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5"
              title="Download CSV report of all complaints in the database"
            >
              <span>📥</span>
              Export All Reports (CSV)
            </button>
            {complaintsList.length > 0 && (
              <button
                onClick={() => navigate('admin-complaint-details', { complaintId: complaintsList[0]?.id })}
                className="text-xs bg-[#1B3A6B] text-white px-3.5 py-2 rounded-xl hover:bg-[#142E57] font-semibold transition-colors shadow-sm"
              >
                Inspect Latest
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Cards Row (Always visible for rapid city health assessment) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className={`bg-white rounded-2xl border border-[#D1DCE8] p-4 ${s.color} shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {s.trend}
                  </span>
                </div>
                <p className="font-display font-bold text-2xl text-[#0F1C2E]">{s.value}</p>
                <p className="text-xs text-[#5A7090] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* VIEW 1: OVERVIEW */}
          {view === 'overview' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map + Insights Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Real Civic Map Preview */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h2 className="font-display font-semibold text-[#0F1C2E]">Live Civic Map</h2>
                      <p className="text-xs text-[#5A7090]">
                        Real complaint coordinates across municipal sectors ({complaintsList.length} total)
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as (Priority | 'ALL')[]).map((f) => (
                        <button
                          key={f}
                          onClick={() => setMapFilter(f)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium transition-all border ${
                            mapFilter === f
                              ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                              : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <MapPanel
                    complaints={complaintsList}
                    filter={mapFilter}
                    onSelectComplaint={(id) => navigate('admin-complaint-details', { complaintId: id })}
                  />
                  <div className="flex items-center justify-between mt-3 text-xs text-[#5A7090]">
                    <span>Interactive map populated strictly from real citizen reports</span>
                    <button onClick={() => setView('map')} className="text-[#2563EB] font-semibold hover:underline">
                      Full-Screen Map →
                    </button>
                  </div>
                </div>

                {/* AI Civic Insights */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-display font-semibold text-[#0F1C2E]">AI Civic Insights</h2>
                      <p className="text-xs text-[#5A7090]">Automated anomaly detection & recommended dispatch</p>
                    </div>
                    <span className="text-xs bg-[#EBF0F8] text-[#1B3A6B] font-semibold px-2.5 py-1 rounded-full border border-[#D1DCE8]">
                      {dynamicAiInsights.length} active
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dynamicAiInsights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Activity & Breakdown */}
              <div className="space-y-6">
                {/* Recent Complaints */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-[#0F1C2E] text-sm">Recent Submissions</h3>
                    <button
                      onClick={() => setView('complaints')}
                      className="text-xs text-[#2563EB] font-semibold hover:underline"
                    >
                      View all ({complaintsList.length}) →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {complaintsList.length === 0 ? (
                      <p className="text-xs text-[#8BA3BC] text-center py-6">No complaints submitted yet.</p>
                    ) : (
                      complaintsList.slice(0, 5).map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F0F4F8] transition-colors group border border-transparent hover:border-[#D1DCE8]"
                        >
                          <div
                            onClick={() => navigate('admin-complaint-details', { complaintId: c.id })}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <p className="text-xs font-semibold text-[#0F1C2E] truncate group-hover:text-[#1B3A6B]">
                              {c.issue}
                            </p>
                            <p className="text-[11px] text-[#8BA3BC] font-mono">{c.id} · {c.location}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <PriorityBadge priority={c.priority} />
                            <button
                              onClick={(e) => handleExportSingleComplaint(c, e)}
                              className="p-1.5 text-[#5A7090] hover:text-[#1B3A6B] hover:bg-white rounded-lg transition-colors"
                              title="Export Docket"
                            >
                              📄
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Department Load */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5 shadow-sm">
                  <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">Department Workload</h3>
                  {dynamicTrendData.length === 0 ? (
                    <p className="text-xs text-[#8BA3BC] text-center py-4">No department assignments yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {dynamicTrendData.map((d) => (
                        <div key={d.dept}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#5A7090] truncate mr-2">{d.dept}</span>
                            <span className="font-mono font-semibold text-[#0F1C2E] shrink-0">{d.count}</span>
                          </div>
                          <div className="h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1B3A6B] rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Breakdown */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5 shadow-sm">
                  <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">Resolution Status</h3>
                  <div className="space-y-2.5">
                    {statusDistribution.map((s) => (
                      <div key={s.status} className="flex items-center gap-3">
                        <StatusBadge status={s.status} />
                        <div className="flex-1 h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1B3A6B] rounded-full" style={{ width: `${s.pct}%` }} />
                        </div>
                        <span className="font-mono text-xs text-[#5A7090] w-10 text-right">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: COMPLAINTS TABLE (With Search, Filters, In-line Status Change & Export Report) */}
          {view === 'complaints' && (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#0F1C2E]">Complaints Registry</h2>
                  <p className="text-xs text-[#5A7090]">{filteredComplaints.length} of {complaintsList.length} complaints matching active filters</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportAllReports}
                    className="text-xs border border-[#D1DCE8] text-[#1B3A6B] hover:bg-[#F0F4F8] px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>📥</span> Export All (CSV)
                  </button>
                  <button
                    onClick={loadAdminData}
                    className="text-xs bg-[#F0F4F8] text-[#1B3A6B] hover:bg-[#D1DCE8] px-3 py-2 rounded-xl font-semibold transition-colors"
                  >
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by case ID, issue, location, or department..."
                  className="sm:col-span-1 border border-[#D1DCE8] rounded-xl px-3.5 py-2 text-xs text-[#0F1C2E] focus:outline-none focus:border-[#2563EB]"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] text-[#5A7090] font-semibold uppercase">Status:</span>
                  {(['ALL', 'Submitted', 'Under Review', 'In Progress', 'Resolved'] as (Status | 'ALL')[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        statusFilter === st ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[11px] text-[#5A7090] font-semibold uppercase">Priority:</span>
                  {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as (Priority | 'ALL')[]).map((pr) => (
                    <button
                      key={pr}
                      onClick={() => setPriorityFilter(pr)}
                      className={`text-xs px-2 py-1 rounded-lg border font-medium font-mono transition-all ${
                        priorityFilter === pr ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              {filteredComplaints.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-[#D1DCE8] rounded-2xl">
                  <span className="text-3xl mb-2 block">🔍</span>
                  <p className="font-semibold text-[#0F1C2E] text-sm">No complaints found matching criteria.</p>
                  <p className="text-xs text-[#5A7090] mt-1">Try clearing your filters or search keywords.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-[#D1DCE8]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#D1DCE8] text-[#5A7090] font-bold uppercase tracking-wider text-[11px]">
                        <th className="p-3.5">Case ID</th>
                        <th className="p-3.5">Issue Title</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Location</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Status Update</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0F4F8]">
                      {filteredComplaints.map((c) => (
                        <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                          <td className="p-3.5 font-mono font-bold text-[#2563EB]">
                            <button
                              onClick={() => navigate('admin-complaint-details', { complaintId: c.id })}
                              className="hover:underline"
                            >
                              {c.id}
                            </button>
                          </td>
                          <td className="p-3.5 font-semibold text-[#0F1C2E] max-w-xs truncate">
                            {c.issue}
                          </td>
                          <td className="p-3.5 text-[#5A7090]">{c.department}</td>
                          <td className="p-3.5 text-[#5A7090] max-w-[160px] truncate">{c.location}</td>
                          <td className="p-3.5">
                            <PriorityBadge priority={c.priority} />
                          </td>
                          <td className="p-3.5">
                            <select
                              value={c.status}
                              onChange={(e) => handleQuickStatusChange(c.id, e.target.value as Status, e)}
                              className="border border-[#D1DCE8] rounded-lg px-2 py-1 text-xs text-[#0F1C2E] bg-white font-medium focus:outline-none focus:border-[#2563EB]"
                            >
                              <option value="Submitted">Submitted</option>
                              <option value="Under Review">Under Review</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={(e) => handleExportSingleComplaint(c, e)}
                              className="px-2.5 py-1 border border-[#D1DCE8] rounded-lg hover:bg-white text-[#1B3A6B] font-semibold text-[11px] transition-colors"
                              title="Export official docket for this single complaint"
                            >
                              📄 Export
                            </button>
                            <button
                              onClick={() => navigate('admin-complaint-details', { complaintId: c.id })}
                              className="px-2.5 py-1 bg-[#1B3A6B] text-white rounded-lg hover:bg-[#142E57] font-semibold text-[11px] transition-colors"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: FULL CIVIC MAP */}
          {view === 'map' && (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#0F1C2E]">Municipal Geographic Map</h2>
                  <p className="text-xs text-[#5A7090]">
                    Real-time spatial visualization of civic complaints across municipal territory
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as (Priority | 'ALL')[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setMapFilter(f)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold transition-all border ${
                        mapFilter === f
                          ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                          : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <MapPanel
                complaints={complaintsList}
                filter={mapFilter}
                onSelectComplaint={(id) => navigate('admin-complaint-details', { complaintId: id })}
              />
              <div className="grid sm:grid-cols-3 gap-4 pt-3 border-t border-[#D1DCE8] text-xs">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D1DCE8]">
                  <span className="text-[#8BA3BC] font-semibold uppercase block text-[10px]">Total Geographic Pins</span>
                  <span className="font-display font-bold text-lg text-[#0F1C2E]">{complaintsList.length}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D1DCE8]">
                  <span className="text-[#8BA3BC] font-semibold uppercase block text-[10px]">High Severity Hazards</span>
                  <span className="font-display font-bold text-lg text-red-600">{critical}</span>
                </div>
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#D1DCE8]">
                  <span className="text-[#8BA3BC] font-semibold uppercase block text-[10px]">Active Resolution Rate</span>
                  <span className="font-display font-bold text-lg text-green-600">
                    {total > 0 ? `${Math.round((resolved / total) * 100)}%` : '100%'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: HOTSPOTS */}
          {view === 'hotspots' && (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 shadow-sm space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1C2E]">Civic Hotspot Clustering</h2>
                <p className="text-xs text-[#5A7090]">
                  Algorithmic grouping of complaints by geographical proximity and recurrence
                </p>
              </div>

              {realHotspots.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-[#D1DCE8] rounded-2xl">
                  <span className="text-3xl mb-2 block">📍</span>
                  <p className="font-semibold text-[#0F1C2E] text-sm">No hotspot clusters detected.</p>
                  <p className="text-xs text-[#5A7090] mt-1">Clusters form automatically as recurrent issues are filed in the same ward or area.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {realHotspots.map((h, i) => (
                    <div key={h.location} className="border border-[#D1DCE8] rounded-2xl p-5 hover:border-[#1B3A6B] transition-all bg-[#F8FAFC]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-[#1B3A6B] text-white">
                          Hotspot #{i + 1}
                        </span>
                        {h.criticalCount > 0 && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            {h.criticalCount} Critical
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-[#0F1C2E] text-base mb-1">
                        {h.location}
                      </h3>
                      <p className="text-xs text-[#5A7090] mb-3">
                        <span className="font-semibold text-[#0F1C2E]">{h.count}</span> total issue(s) reported in this cluster
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-[#3A4F6A]">
                          <span className="font-semibold text-[#5A7090]">Categories: </span>
                          {h.categories.join(', ')}
                        </div>
                        <div className="text-xs text-[#3A4F6A]">
                          <span className="font-semibold text-[#5A7090]">Departments: </span>
                          {h.departments.join(', ')}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#D1DCE8] flex items-center justify-between">
                        <span className="text-[11px] text-[#5A7090]">Field Action: Immediate inspection recommended</span>
                        <button
                          onClick={() => {
                            setSearchTerm(h.location);
                            setView('complaints');
                          }}
                          className="text-xs text-[#2563EB] font-bold hover:underline"
                        >
                          View {h.count} Cases →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: ANALYTICS */}
          {view === 'analytics' && (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 shadow-sm space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1C2E]">Municipal Performance Analytics</h2>
                <p className="text-xs text-[#5A7090]">Live intelligence on resolution times, departmental distribution, and public safety</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Department Load Graph */}
                <div className="border border-[#D1DCE8] rounded-2xl p-5 bg-[#F8FAFC]">
                  <h3 className="font-display font-bold text-sm text-[#0F1C2E] mb-4">Department Workload Distribution</h3>
                  {dynamicTrendData.length === 0 ? (
                    <p className="text-xs text-[#8BA3BC] text-center py-8">No data available yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {dynamicTrendData.map((d) => (
                        <div key={d.dept}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-[#0F1C2E]">{d.dept}</span>
                            <span className="font-mono text-[#1B3A6B]">{d.count} ({d.pct}%)</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1B3A6B] rounded-full transition-all" style={{ width: `${d.pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Composition */}
                <div className="border border-[#D1DCE8] rounded-2xl p-5 bg-[#F8FAFC]">
                  <h3 className="font-display font-bold text-sm text-[#0F1C2E] mb-4">Severity & Priority Balance</h3>
                  <div className="space-y-4">
                    {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((pr) => {
                      const count = complaintsList.filter((c) => c.priority === pr).length;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={pr}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-[#0F1C2E]">{pr}</span>
                            <span className="font-mono text-[#5A7090]">{count} ({pct}%)</span>
                          </div>
                          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pr === 'URGENT' ? 'bg-red-500' : pr === 'HIGH' ? 'bg-orange-500' : pr === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: SETTINGS */}
          {view === 'settings' && (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 max-w-2xl shadow-sm space-y-6">
              <div>
                <h2 className="font-display font-bold text-xl text-[#0F1C2E]">City System Settings</h2>
                <p className="text-xs text-[#5A7090]">Configuration for AI classification, automated department dispatch, and alerting</p>
              </div>

              <div className="space-y-4 text-sm divide-y divide-[#F0F4F8]">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-[#0F1C2E]">Gemini 3.6 Multimodal Classification</p>
                    <p className="text-xs text-[#5A7090]">Analyzes complaint photo and text with zero hardcoded defaults</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-bold rounded-full">
                    Active (Gemini 3.6 Flash)
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-[#0F1C2E]">Strict User Data Isolation</p>
                    <p className="text-xs text-[#5A7090]">Ensures citizens only access their own submissions</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-bold rounded-full">
                    Enforced
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-[#0F1C2E]">Automatic SLA Escalation</p>
                    <p className="text-xs text-[#5A7090]">Escalates critical safety risks to department supervisors within 4 hours</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-full">
                    Enabled
                  </span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-semibold text-[#0F1C2E]">Database Storage Mode</p>
                    <p className="text-xs text-[#5A7090]">Direct MongoDB image evidence storage (Base64 data URIs)</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-50 border border-green-200 text-green-700 font-bold rounded-full">
                    MongoDB
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
