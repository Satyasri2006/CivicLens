import { useState } from 'react';
import type { Page, AdminView, Priority, Complaint } from '../types';
import type { User } from '../App';
import AdminSidebar from '../components/AdminSidebar';
import MapPanel from '../components/MapPanel';
import InsightCard from '../components/InsightCard';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { adminStats, aiInsights, mapMarkers } from '../data/mockData';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
  complaints: Complaint[];
}

const trendData = [
  { dept: 'Municipal Sanitation', count: 387, pct: 31 },
  { dept: 'Public Works', count: 264, pct: 21 },
  { dept: 'City Electricity Board', count: 189, pct: 15 },
  { dept: 'Water Supply Board', count: 156, pct: 12.5 },
  { dept: 'Drainage & Sewage', count: 134, pct: 10.7 },
  { dept: 'Others', count: 118, pct: 9.8 },
];

export default function AdminDashboard({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  complaints,
}: Props) {
  const [view, setView] = useState<AdminView>('overview');
  const [mapFilter, setMapFilter] = useState<Priority | 'ALL'>('ALL');
  const [exportMessage, setExportMessage] = useState(false);

  const statCards = [
    { label: 'Total Complaints', value: (adminStats.total + complaints.length - 8).toLocaleString(), trend: adminStats.trends.total, trendUp: true, icon: '📋', color: 'border-l-4 border-l-[#1B3A6B]' },
    { label: 'Critical', value: adminStats.critical, trend: adminStats.trends.critical, trendUp: false, icon: '🚨', color: 'border-l-4 border-l-red-500' },
    { label: 'Pending', value: adminStats.pending, trend: adminStats.trends.pending, trendUp: true, icon: '⏳', color: 'border-l-4 border-l-amber-500' },
    { label: 'Resolved', value: adminStats.resolved, trend: adminStats.trends.resolved, trendUp: true, icon: '✅', color: 'border-l-4 border-l-green-500' },
  ];

  const handleExportReport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(complaints, null, 2));
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
            <p className="text-xs text-[#5A7090]">AI-assisted civic issue monitoring · Connected as {user?.name || 'Administrator'}</p>
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
            <button
              onClick={() => navigate('admin-complaint-details', { complaintId: complaints[0]?.id || 'CL-10482' })}
              className="text-xs bg-[#1B3A6B] text-white px-3 py-1.5 rounded-lg hover:bg-[#142E57] font-medium transition-colors"
            >
              View Details
            </button>
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
              <div className="divide-y divide-[#F0F4F8]">
                {complaints.map((c) => (
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
                  <span>Automatic Department Routing</span>
                  <span className="text-green-600 font-semibold">Enabled</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#D1DCE8]">
                  <span>Civic Hotspot Alerts</span>
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
                    {complaints.slice(0, 5).map((c) => (
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
                    ))}
                  </div>
                </div>

                {/* Department breakdown */}
                <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
                  <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-4">By Department</h3>
                  <div className="space-y-3">
                    {trendData.map((d) => (
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
                    {[
                      { status: 'Resolved' as const, count: 888, pct: 71 },
                      { status: 'In Progress' as const, count: 234, pct: 19 },
                      { status: 'Submitted' as const, count: 84, pct: 7 },
                      { status: 'Under Review' as const, count: 42, pct: 3 },
                    ].map((s) => (
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
