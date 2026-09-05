import { useState, useEffect } from 'react';
import type { Page } from '../types';
import type { User, ReportData } from '../App';
import Navbar from '../components/Navbar';
import PriorityBadge, { PriorityIndicator } from '../components/PriorityBadge';

interface Props {
  navigate: (page: Page, opts?: { reportData?: ReportData }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
  reportData?: ReportData | null;
}

const analysisSteps = [
  'Understanding your complaint',
  'Identifying the issue type',
  'Analyzing evidence & photo',
  'Determining severity & priority',
  'Identifying responsible department',
  'Preparing your complaint',
];

export default function AIAnalysisPage({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  reportData,
}: Props) {
  const [phase, setPhase] = useState<'loading' | 'result'>('loading');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const aiAnalysis = reportData?.aiAnalysis || {};
  const desc = reportData?.description || 'Garbage accumulation near college campus causing severe odor and public risk.';
  const loc = reportData?.location || 'Block B, XYZ Road';
  const fileCount = reportData?.uploadedFiles?.length ?? 2;

  const category = aiAnalysis.category || 'Sanitation';
  const issueType = aiAnalysis.issueType || 'Garbage accumulation';
  const severity = aiAnalysis.severity || 'High';
  const priority = aiAnalysis.priority || 'HIGH';
  const department = aiAnalysis.department || 'Municipal Sanitation Department';
  const duration = aiAnalysis.duration || '5 days';
  const safetyRisk = aiAnalysis.safetyRisk || 'Moderate';
  const justification = aiAnalysis.justification || 'The waste has remained uncollected for five days in a public area, which may create hygiene and public-health risks.';

  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, step]);
      step++;
      if (step >= analysisSteps.length) {
        clearInterval(interval);
        setTimeout(() => setPhase('result'), 300);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#F0F4F8]">
        <Navbar
          navigate={navigate}
          currentPage="report"
          user={user}
          onOpenAuth={onOpenAuth}
          onLogout={onLogout}
        />
        <div className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full border-4 border-[#EBF0F8] border-t-[#1B3A6B] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-7 h-7 text-[#1B3A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h2 className="font-display font-bold text-xl text-[#0F1C2E] mb-2 text-center">CivicLens Gemini AI is analyzing your report...</h2>
          <p className="text-[#5A7090] text-sm text-center mb-10">Our AI is processing your complaint and applying controlled routing rules.</p>

          <div className="w-full space-y-3">
            {analysisSteps.map((step, i) => {
              const isDone = completedSteps.includes(i);
              const isActive = !isDone && completedSteps.length === i;
              return (
                <div key={step} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isDone ? 'bg-green-50 border-green-200' : isActive ? 'bg-[#EBF0F8] border-[#D1DCE8]' : 'bg-white border-[#D1DCE8] opacity-40'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isDone ? 'bg-green-500' : isActive ? 'bg-[#1B3A6B]' : 'bg-gray-200'
                  }`}>
                    {isDone ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    ) : null}
                  </div>
                  <span className={`text-sm font-medium ${isDone ? 'text-green-700' : isActive ? 'text-[#1B3A6B]' : 'text-[#8BA3BC]'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar
        navigate={navigate}
        currentPage="report"
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-[#0F1C2E]">Issue Analysis Complete</h1>
            <p className="text-[#5A7090] text-sm">Here's what CivicLens AI understood from your report.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Main analysis card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#D1DCE8] p-5">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#D1DCE8]">
              <span className="font-mono text-xs text-[#5A7090]">Analysis · Gemini Verified</span>
              <PriorityBadge priority={priority} size="md" />
            </div>
            <div className="space-y-3.5">
              {[
                { label: 'Issue Type', value: issueType, large: true },
                { label: 'Category', value: category },
                { label: 'Severity', value: severity },
                { label: 'Duration', value: duration },
                { label: 'Location', value: loc },
                { label: 'Department', value: department },
                { label: 'Safety Risk', value: safetyRisk },
                { label: 'Evidence', value: fileCount > 0 ? `✓ ${fileCount} photo(s) attached` : 'Location verified' },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-start gap-4">
                  <span className="text-xs text-[#5A7090] font-medium shrink-0 w-24">{row.label}</span>
                  <span className={`text-sm text-right ${row.large ? 'font-semibold text-[#0F1C2E]' : 'text-[#3A4F6A]'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority + Evidence */}
          <div className="space-y-4">
            {/* Priority explanation */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-3">Why is this marked {priority} Priority?</h3>
              <blockquote className="text-sm text-[#3A4F6A] leading-relaxed bg-[#F0F4F8] rounded-xl p-3 border-l-2 border-[#1B3A6B] mb-4">
                "{justification}"
              </blockquote>
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Location Area', value: loc },
                  { label: 'Assigned Dept', value: department },
                  { label: 'Safety Risk', value: safetyRisk },
                  { label: 'Evidence Required', value: (aiAnalysis.requiredEvidence || ['Photo', 'Location']).join(', ') },
                ].map((f) => (
                  <div key={f.label} className="flex justify-between text-xs">
                    <span className="text-[#5A7090]">{f.label}</span>
                    <span className="font-medium text-[#0F1C2E] truncate max-w-[150px]">{f.value}</span>
                  </div>
                ))}
              </div>
              <PriorityIndicator current={priority} />
            </div>

            {/* Evidence detection */}
            <div className="bg-white rounded-2xl border border-[#D1DCE8] p-5">
              <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-3">AI Detection & Validation</h3>
              <div className="relative bg-gray-100 rounded-xl overflow-hidden h-28 mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-4xl opacity-50">🏛️</span>
                </div>
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-mono">{issueType}</div>
                <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-mono">{department}</div>
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded font-mono">{priority}</div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5A7090]">Analysis confidence</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 rounded-full bg-[#EBF0F8] overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500 rounded-full" />
                  </div>
                  <span className="font-semibold text-green-600">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => navigate('report')}
            className="flex-1 border border-[#D1DCE8] text-[#5A7090] font-medium py-3 rounded-xl hover:bg-[#F0F4F8] transition-colors text-sm"
          >
            ← Edit Report
          </button>
          <button
            onClick={() =>
              navigate('generated-complaint', {
                reportData: {
                  inputMode: reportData?.inputMode || 'text',
                  description: desc,
                  language: reportData?.language || 'English',
                  location: loc,
                  uploadedFiles: reportData?.uploadedFiles || [],
                  aiAnalysis: {
                    category,
                    issueType,
                    severity,
                    priority,
                    department,
                    duration,
                    safetyRisk,
                    justification,
                    summary: aiAnalysis.summary || desc,
                  },
                },
              })
            }
            className="flex-1 bg-[#1B3A6B] text-white font-semibold py-3 rounded-xl hover:bg-[#142E57] transition-colors text-sm shadow-sm"
          >
            Generate Complaint →
          </button>
        </div>
      </div>
    </div>
  );
}
