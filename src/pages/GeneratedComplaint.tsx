import { useState } from 'react';
import type { Page, Complaint } from '../types';
import { formatComplaint } from '../types';
import type { User, ReportData } from '../App';
import Navbar from '../components/Navbar';
import PriorityBadge from '../components/PriorityBadge';
import { api } from '../services/api';

interface Props {
  navigate: (page: Page, opts?: { complaintId?: string }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
  reportData?: ReportData | null;
  onComplaintSubmitted?: (complaint: Complaint) => void;
}

const languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];

export default function GeneratedComplaint({
  navigate,
  user,
  onOpenAuth,
  onLogout,
  reportData,
  onComplaintSubmitted,
}: Props) {
  const aiAnalysis = reportData?.aiAnalysis || {};
  const initialLocation = reportData?.location || 'Block B, XYZ Road';
  const initialDesc = reportData?.description || 'Garbage has remained uncollected near Block B on XYZ Road for approximately five days. The accumulated waste is creating an unhygienic environment.';

  const department = aiAnalysis.department || 'Municipal Sanitation Department';
  const category = aiAnalysis.category || 'Sanitation';
  const issueType = aiAnalysis.issueType || 'Civic Grievance';
  const priority = aiAnalysis.priority || 'HIGH';
  const severity = aiAnalysis.severity || 'High';

  const [language, setLanguage] = useState(reportData?.language || 'English');
  const [isEditing, setIsEditing] = useState(false);
  const [complaintText, setComplaintText] = useState(initialDesc);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (lang === 'English') {
      setComplaintText(initialDesc);
    } else if (lang === 'Telugu') {
      setComplaintText(`${initialLocation} వద్ద మున్సిపల్ సమస్యను వెంటనే పరిష్కరించాలి.`);
    } else if (lang === 'Hindi') {
      setComplaintText(`${initialLocation} के पास समस्या बनी हुई है। तत्काल कार्रवाई की आवश्यकता है।`);
    } else if (lang === 'Tamil') {
      setComplaintText(`${initialLocation} பகுதியில் பிரச்சனை உடனடியாக சரி செய்யப்பட வேண்டும்.`);
    } else if (lang === 'Kannada') {
      setComplaintText(`${initialLocation} ಹತ್ತಿರ ಸಮಸ್ಯೆಯನ್ನು ತಕ್ಷಣವೇ ಬಗೆಹರಿಸಬೇಕು.`);
    } else if (lang === 'Malayalam') {
      setComplaintText(`${initialLocation} സമീപം പരാതി ഉടൻ പരിഹരിക്കണം.`);
    }
  };

  const handleSubmitComplaint = async () => {
    setLoading(true);

    try {
      const subject = `Urgent Notice: ${issueType} at ${initialLocation}`;
      const aiPayload = {
        summary: aiAnalysis.summary || complaintText,
        safetyRisk: aiAnalysis.safetyRisk || 'Moderate',
        justification: aiAnalysis.justification || 'Analyzed by CivicLens AI.',
        requiredEvidence: aiAnalysis.requiredEvidence || ['Photo', 'Location'],
      };
      const genComplaint = {
        subject,
        body: complaintText,
      };

      let savedComplaint;
      const fileObjects = reportData?.uploadedFileObjects || [];

      if (fileObjects.length > 0) {
        // Use FormData for multipart/form-data upload with real image files
        const formData = new FormData();
        formData.append('description', complaintText);
        formData.append('language', language);
        formData.append('category', category);
        formData.append('issueType', issueType);
        formData.append('severity', severity);
        formData.append('priority', priority);
        formData.append('department', department);
        formData.append('duration', aiAnalysis.duration || 'Recent');
        formData.append('location', JSON.stringify({ address: initialLocation }));
        formData.append('aiAnalysis', JSON.stringify(aiPayload));
        formData.append('generatedComplaint', JSON.stringify(genComplaint));
        for (const file of fileObjects) {
          formData.append('evidence', file);
        }
        savedComplaint = await api.complaints.createWithFiles(formData);
      } else {
        // Fallback: JSON request without files
        const payload = {
          description: complaintText,
          language,
          category,
          issueType,
          severity,
          priority,
          department,
          duration: aiAnalysis.duration || 'Recent',
          location: { address: initialLocation },
          evidence: reportData?.uploadedFiles || [],
          aiAnalysis: aiPayload,
          generatedComplaint: genComplaint,
        };
        savedComplaint = await api.complaints.create(payload);
      }

      const formattedComplaint = formatComplaint({
        ...savedComplaint,
        issueType,
        category,
        department,
        priority,
        location: initialLocation,
        status: 'Submitted',
        description: complaintText,
        aiAnalysis: {
          summary: aiAnalysis.summary || complaintText,
          safetyRisk: aiAnalysis.safetyRisk || 'Moderate',
          duration: aiAnalysis.duration || 'Recent',
        },
        evidence: savedComplaint.evidence || (reportData?.uploadedFiles ? reportData.uploadedFiles : []),
      });

      onComplaintSubmitted?.(formattedComplaint);
      navigate('success', { complaintId: formattedComplaint.id });
    } catch (err: any) {
      // Fallback local creation if backend offline
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const fallbackId = `CL-${randomNum}`;
      const fallbackComplaint = formatComplaint({
        caseId: fallbackId,
        issueType,
        category,
        department,
        priority,
        location: initialLocation,
        status: 'Submitted',
        description: complaintText,
        aiAnalysis: {
          summary: complaintText,
          safetyRisk: 'Moderate',
          duration: 'Recent',
        },
        evidence: reportData?.uploadedFiles || [],
      });
      onComplaintSubmitted?.(fallbackComplaint);
      navigate('success', { complaintId: fallbackId });
    } finally {
      setLoading(false);
    }
  };

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
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h1 className="font-display font-bold text-xl text-[#0F1C2E]">Your Complaint is Ready</h1>
          </div>
          <p className="text-[#5A7090] text-sm">CivicLens converted your description into a structured government complaint.</p>
        </div>

        {/* Complaint document */}
        <div className="bg-white rounded-2xl border border-[#D1DCE8] overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-[#1B3A6B] px-6 py-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/15 flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                    <circle cx="10" cy="10" r="7" opacity={0.4} />
                    <circle cx="10" cy="10" r="3" />
                  </svg>
                </div>
                <span className="font-display font-bold text-sm">CivicLens</span>
              </div>
              <span className="font-mono text-xs text-white/60">Draft · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <h2 className="font-display font-bold text-lg">{issueType} Notice</h2>
            <p className="text-white/60 text-sm mt-0.5">To: {department}</p>
          </div>

          {/* Meta info */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#D1DCE8]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Status', value: 'Ready to Submit', mono: true },
                { label: 'Priority', value: null, badge: true },
                { label: 'Location', value: initialLocation },
                { label: 'Evidence', value: `${reportData?.uploadedFiles?.length || 1} photo(s)` },
              ].map((row) => (
                <div key={row.label}>
                  <span className="text-[#8BA3BC] font-medium uppercase tracking-wide block mb-0.5">{row.label}</span>
                  {row.badge ? (
                    <PriorityBadge priority={priority} />
                  ) : (
                    <span className={`font-medium text-[#0F1C2E] ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Language selector */}
          <div className="px-6 py-3 border-b border-[#D1DCE8] flex items-center gap-3">
            <span className="text-xs text-[#5A7090] font-medium">Language:</span>
            <div className="flex gap-1 flex-wrap">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                    language === lang
                      ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                      : 'border-[#D1DCE8] text-[#5A7090] hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Complaint body */}
          <div className="px-6 py-5">
            <label className="block text-xs text-[#5A7090] font-medium uppercase tracking-wide mb-2">Complaint Text</label>
            {isEditing ? (
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                rows={5}
                className="w-full border border-[#D1DCE8] rounded-xl p-4 text-sm text-[#0F1C2E] leading-relaxed focus:outline-none focus:border-[#2563EB] resize-none"
              />
            ) : (
              <p className="text-sm text-[#3A4F6A] leading-relaxed bg-[#F8FAFC] rounded-xl p-4 border border-[#D1DCE8]">
                {complaintText}
              </p>
            )}
          </div>

          {/* AI note */}
          <div className="mx-6 mb-5 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2.5 text-xs">
            <svg className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-700">This complaint was generated by CivicLens Gemini AI based on your description and official routing rules. You may edit it before submitting.</p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex-1 border border-[#D1DCE8] text-[#3A4F6A] font-medium py-3 rounded-xl hover:bg-[#F0F4F8] transition-colors text-sm"
            >
              {isEditing ? '✓ Done Editing' : '✏️ Edit Complaint'}
            </button>
            <button
              onClick={handleSubmitComplaint}
              disabled={loading}
              className="flex-1 bg-[#1B3A6B] text-white font-semibold py-3 rounded-xl hover:bg-[#142E57] transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                'Submit Complaint →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
