import { useState } from 'react';
import type { Page } from '../types';
import Navbar from '../components/Navbar';
import PriorityBadge from '../components/PriorityBadge';

interface Props {
  navigate: (page: Page) => void;
}

const languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];

const complaintTexts: Record<string, string> = {
  English: 'Garbage has remained uncollected near Block B on XYZ Road for approximately five days. The accumulated waste is creating an unhygienic environment and may pose a public-health concern to residents and students in the area. Immediate action is requested from the Municipal Sanitation Department to address this issue.',
  Telugu: 'XYZ రోడ్డులో బ్లాక్ B దగ్గర సుమారు ఐదు రోజులుగా చెత్త సేకరించలేదు. పేరుకుపోయిన వ్యర్థాలు అపరిశుభ్రమైన వాతావరణాన్ని సృష్టిస్తున్నాయి.',
  Hindi: 'XYZ रोड पर ब्लॉक B के पास लगभग पाँच दिनों से कचरा नहीं उठाया गया है। जमा हुआ कचरा अस्वच्छ वातावरण पैदा कर रहा है।',
  Tamil: 'XYZ ரோட்டில் பிளாக் B அருகில் சுமார் ஐந்து நாட்களாக குப்பை சேகரிக்கப்படவில்லை.',
  Kannada: 'XYZ ರಸ್ತೆಯ ಬ್ಲಾಕ್ B ಬಳಿ ಸುಮಾರು ಐದು ದಿನಗಳಿಂದ ಕಸ ಸಂಗ್ರಹಿಸಲಾಗಿಲ್ಲ.',
  Malayalam: 'XYZ റോഡിലെ ബ്ലോക്ക് B-ക്ക് സമീപം ഏകദേശം അഞ്ച് ദിവസമായി മാലിന്യം ശേഖരിക്കാൻ വന്നിട്ടില്ല.',
};

export default function GeneratedComplaint({ navigate }: Props) {
  const [language, setLanguage] = useState('English');
  const [isEditing, setIsEditing] = useState(false);
  const [complaintText, setComplaintText] = useState(complaintTexts['English']);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setComplaintText(complaintTexts[lang] ?? complaintTexts['English']);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar navigate={navigate} currentPage="report" />
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
              <span className="font-mono text-xs text-white/60">CL-10482 · 2 Sep 2026</span>
            </div>
            <h2 className="font-display font-bold text-lg">Urgent Garbage Accumulation Complaint</h2>
            <p className="text-white/60 text-sm mt-0.5">To: Municipal Sanitation Department</p>
          </div>

          {/* Meta info */}
          <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#D1DCE8]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              {[
                { label: 'Case ID', value: 'CL-10482', mono: true },
                { label: 'Priority', value: null, badge: true },
                { label: 'Location', value: 'Block B, XYZ Road' },
                { label: 'Duration', value: '5 days' },
              ].map((row) => (
                <div key={row.label}>
                  <span className="text-[#8BA3BC] font-medium uppercase tracking-wide block mb-0.5">{row.label}</span>
                  {row.badge ? (
                    <PriorityBadge priority="HIGH" />
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
            <p className="text-blue-700">This complaint was generated by CivicLens AI based on your description. You may edit it before submitting.</p>
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
              onClick={() => navigate('success')}
              className="flex-1 bg-[#1B3A6B] text-white font-semibold py-3 rounded-xl hover:bg-[#142E57] transition-colors text-sm shadow-sm"
            >
              Submit Complaint →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
