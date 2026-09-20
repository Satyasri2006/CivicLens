import { useState, useEffect } from 'react';
import type { Page, AdminView, Priority, Complaint } from '../types';
import { formatComplaint } from '../types';
import type { User } from '../App';
import AdminSidebar from '../components/AdminSidebar';
import MapPanel from '../components/MapPanel';
import InsightCard from '../components/InsightCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { adminStats as defaultAdminStats, aiInsights, mapMarkers } from '../data/mockData';
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
  const [exportMessage, setExportMessage] = useState(false);
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const fetchedComplaints = await api.admin.getAllComplaints().catch(() => []);
        setComplaintsList(fetchedComplaints ? fetchedComplaints.map(formatComplaint) : []);
      } catch (err) {
        console.warn('Admin API load error:', err);
        setComplaintsList([]);
      }
    }
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
    { label: 'Critical', value: critical, trend: critical > 0 ? `${critical}` : '0', trendUp: false, icon: '🚨', color: 'border-l-4 border-l-red-500' },
    { label: 'Pending', value: pending, trend: pending > 0 ? `${pending}` : '0', trendUp: true, icon: '⏳', color: 'border-l-4 border-l-amber-500' },
    { label: 'Resolved', value: resolved, trend: resolved > 0 ? `${resolved}` : '0', trendUp: true, icon: '✅', color: 'border-l-4 border-l-green-500' },
  ];

  // Dynamic department breakdown from real complaints
  const defaultDepts = [
    'Municipal Sanitation',
    'Public Works',
    'City Electricity Board',
    'Water Supply Board',
    'Drainage & Sewage',
  ];
  const deptCounts: Record<string, number> = {};
  defaultDepts.forEach((d) => (deptCounts[d] = 0));
  complaintsList.forEach((c) => {
    const cleanName = (c.department || 'Other').replace(' Department', '');
    deptCounts[cleanName] = (deptCounts[cleanName] || 0) + 1;
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

  const handleExportReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(complaintsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `civiclens_report_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportMessage(true);
    setTimeout(() => setExportMessage(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      <AdminSidebar activeView={view} onViewChange={setView} navigate={navigate} />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="bg-white border-b border-[#D1DCE8] px-6 py-4 flex items-center justify-between sticky top-0 z-30 flex-wrap gap-3">
          <div>
            <h1 className="font-display font-bold text-lg text-[#0F1C2E]">City Operations Dashboard</h1>
            <p className="text-[#5A7090] text-xs">AI-assisted civic issue monitoring · Connected as {user?.name || 'Administrator'}</p>
          </div>
          <div className="flex gap-2 items-center">
            {exportMessage && (
              <span className="text-xs text-green-600 font-medium animate-fadeIn">Report downloaded ✓</span>
            )}
            <button
              onClick={handleExportReport}
              className="text-xs border border-[#D1DCE8] text-[#5A7090] px-3 py-1.5 rounded-lg hover:bg-[#F0F4F8] font-medium transition-colors"
            >
              Export Report
            </button>
            {complaintsList.length > 0 && (
              <button
                onClick={() => navigate('admin-complaint-details', { complaintId: complaintsList[0]?.id })}
                className="text-xs bg-[#1B3A6B] text-white px-3 py-1.5 rounded-lg hover:bg-[#142E57] font-medium transition-colors"
              >
                View Latest Complaint
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className={`bg-white rounded-xl border border-[#D1DCE8] p-4 ${s.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {s.trend}
                  </span>
                </div>
                <p className="font-display font-bold text-2xl text-[#0F1C2E]">{s.value}</p>
                <p className="text-xs text-[#5A7090] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* View Tab Contents */}
          {view === 'complaints' ? (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h2 className="font-display font-semibold text-[#0F1C2E] text-lg mb-4">All System Complaints</h2>
              {complaintsList.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="text-3xl mb-2 block">📋</span>
                  <p className="font-medium text-[#0F1C2E] text-sm">No complaints found in the database.</p>
                  <p className="text-xs text-[#5A7090] mt-1">When citizens report issues, they will appear here for review and assignment.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F0F4F8]">
                  {complaintsList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => navigate('admin-complaint-details', { complaintId: c.id })}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-[#F8FAFC] rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#2563EB] font-semibold">{c.id}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#0F1C2E]">{c.issue}</p>
                          <p className="text-xs text-[#5A7090]">{c.location} · {c.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={c.priority} />
                        <StatusBadge status={c.status} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : view === 'settings' ? (
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 max-w-xl">
              <h2 className="font-display font-semibold text-[#0F1C2E] text-lg mb-4">System Settings</h2>
              <div className="space-y-4 text-sm text-[#0F1C2E]">
                <div className="flex items-center justify-between py-2 border-b border-[#D1DCE8]">
                  <span>AI Auto-Classification</span>
                  <span className="text-green-600 font-semibold">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#D1DCE8]">
                  <span>Controlled Department Routing</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#D1DCE8]">
                  <span>Deterministic Priority Engine</span>
                  <span className="text-green-600 font-semibold">Active</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Map + Insights */}
              <div className="lg:col-span-2 space-y-5">
                {/* Map */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h2 className="font-display font-semibold text-[#0F1C2E]">Civic Issue Map</h2>
                      <p className="text-xs text-[#5A7090]">Real-time issue clusters across the city</p>
                    </div>
                    <div className="flex gap-1">
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
                  <MapPanel markers={mapMarkers} filter={mapFilter} />
                  <p className="text-xs text-[#8BA3BC] mt-2 text-center">Click markers to view cluster details · {mapMarkers.length} active issues</p>
                </div>

                {/* AI Insights */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="font-display font-semibold text-[#0F1C2E]">AI Civic Insights</h2>
                      <p className="text-xs text-[#5A7090]">AI-detected patterns and recommended actions</p>
                    </div>
                    <span className="text-xs bg-[#EBF0F8] text-[#1B3A6B] font-semibold px-2.5 py-1 rounded-full border border-[#D1DCE8]">
                      {aiInsights.length} active
                    </span>
                  </div>
                  <div className="space-y-3">
                    {aiInsights.map((insight) => (
                      <InsightCard key={insight.id} insight={insight} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Recent complaints */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-semibold text-[#0F1C2E] text-sm">Recent Complaints</h3>
                    <button
                      onClick={() => setView('complaints')}
                      className="text-xs text-[#2563EB] font-medium hover:underline"
                    >
                      View all →
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {complaintsList.length === 0 ? (
                      <p className="text-xs text-[#8BA3BC] text-center py-4">No complaints recorded yet.</p>
                    ) : (
                      complaintsList.slice(0, 5).map((c) => (
                        <button
                          key={c.id}
                          onClick={() => navigate('admin-complaint-details', { complaintId: c.id })}
                          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F0F4F8] transition-colors text-left group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#0F1C2E] truncate group-hover:text-[#1B3A6B]">{c.issue}</p>
                            <p className="text-xs text-[#8BA3BC] font-mono">{c.id}</p>
                          </div>
                          <div className="shrink-0">
                            <PriorityBadge priority={c.priority} />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Department breakdown */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
                  <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">By Department</h3>
                  <div className="space-y-3">
                    {dynamicTrendData.map((d) => (
                      <div key={d.dept}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#5A7090] truncate mr-2">{d.dept}</span>
                          <span className="font-mono font-semibold text-[#0F1C2E] shrink-0">{d.count}</span>
                        </div>
                        <div className="h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1B3A6B] rounded-full transition-all"
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status distribution */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
                  <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">Status Breakdown</h3>
                  <div className="space-y-2">
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
        </div>
      </main>
    </div>
  );
}
