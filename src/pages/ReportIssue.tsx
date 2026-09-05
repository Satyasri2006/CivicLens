import { useState } from 'react';
import type { Page, InputMode } from '../types';
import Navbar from '../components/Navbar';

interface Props {
  navigate: (page: Page) => void;
}

const languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];

export default function ReportIssue({ navigate }: Props) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [location, setLocation] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ desc?: string; location?: string }>({});

  const handleDetectLocation = () => {
    setTimeout(() => {
      setLocation('Block B, XYZ Road, Sector 14, City');
      setLocationDetected(true);
    }, 800);
  };

  const handleFileUpload = () => {
    setUploadedFiles(['garbage_photo_1.jpg', 'garbage_area.jpg']);
  };

  const handleSubmit = () => {
    const newErrors: { desc?: string; location?: string } = {};
    if (!description.trim()) newErrors.desc = 'Please describe the issue.';
    if (!location.trim()) newErrors.location = 'Please provide a location.';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    navigate('ai-analysis');
  };

  const tabs: { mode: InputMode; icon: string; label: string }[] = [
    { mode: 'voice', icon: '🎤', label: 'Voice' },
    { mode: 'photo', icon: '📷', label: 'Photo' },
    { mode: 'text', icon: '✍️', label: 'Text' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar navigate={navigate} currentPage="report" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-[#0F1C2E] mb-1">Report a Civic Issue</h1>
          <p className="text-[#5A7090] text-sm">Tell us what happened. CivicLens will organize the rest.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#D1DCE8] p-6 space-y-6">
          {/* Input mode tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#5A7090] uppercase tracking-wider mb-3">How would you like to report?</label>
            <div className="flex gap-2 p-1 bg-[#F0F4F8] rounded-xl">
              {tabs.map((t) => (
                <button
                  key={t.mode}
                  onClick={() => setInputMode(t.mode)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputMode === t.mode
                      ? 'bg-white text-[#1B3A6B] shadow-sm border border-[#D1DCE8]'
                      : 'text-[#5A7090] hover:text-[#1B3A6B]'
                  }`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice mode */}
          {inputMode === 'voice' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#EBF0F8] flex items-center justify-center border-2 border-[#D1DCE8] cursor-pointer hover:border-[#1B3A6B] transition-colors">
                  <span className="text-3xl">🎤</span>
                </div>
              </div>
              <p className="text-[#5A7090] text-sm text-center">Tap the microphone and describe your issue<br />in your preferred language.</p>
              <button className="text-sm text-[#2563EB] font-medium">Or switch to text input →</button>
            </div>
          )}

          {/* Photo mode */}
          {inputMode === 'photo' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-full border-2 border-dashed border-[#D1DCE8] rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-[#2563EB] transition-colors" onClick={handleFileUpload}>
                <span className="text-4xl">📷</span>
                <p className="text-[#5A7090] text-sm text-center">Take a photo or upload from your gallery.<br />CivicLens will analyze the image.</p>
                <button className="text-sm bg-[#1B3A6B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#142E57] transition-colors">
                  Upload Photo
                </button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="w-full flex gap-3">
                  {uploadedFiles.map((f) => (
                    <div key={f} className="flex-1 bg-[#F0F4F8] border border-[#D1DCE8] rounded-lg p-3 flex items-center gap-2 text-xs text-[#5A7090]">
                      <span>📎</span>
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text mode */}
          {inputMode === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#0F1C2E]">Describe your problem</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs border border-[#D1DCE8] rounded-lg px-2 py-1.5 text-[#5A7090] bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  {languages.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value) setErrors((p) => ({ ...p, desc: undefined }));
                }}
                placeholder="Example: There has been garbage piling up outside my college for the last five days. The smell is unbearable and residents are suffering..."
                rows={5}
                className={`w-full border rounded-xl p-4 text-sm text-[#0F1C2E] resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all placeholder:text-[#8BA3BC] ${
                  errors.desc ? 'border-red-300 bg-red-50' : 'border-[#D1DCE8]'
                }`}
              />
              {errors.desc && <p className="text-xs text-red-600 mt-1">{errors.desc}</p>}
              <p className="text-xs text-[#8BA3BC] mt-1.5 text-right">{description.length} characters</p>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-[#0F1C2E] mb-2">Issue Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (e.target.value) setErrors((p) => ({ ...p, location: undefined }));
                }}
                placeholder="Enter address or area"
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-[#D1DCE8]'
                }`}
              />
              <button
                onClick={handleDetectLocation}
                className="flex items-center gap-2 bg-[#EBF0F8] text-[#1B3A6B] text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#D1DCE8] transition-colors border border-[#D1DCE8] whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Location
              </button>
            </div>
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
            {locationDetected && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Location detected
              </p>
            )}

            {/* Map placeholder */}
            <div className="mt-3 bg-[#E8EFF7] rounded-xl h-28 flex items-center justify-center border border-[#D1DCE8] relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#D1DCE8 1px, transparent 1px), linear-gradient(90deg, #D1DCE8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <svg className="w-6 h-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-xs text-[#5A7090]">{location || 'Select location on map'}</span>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-[#0F1C2E] mb-2">Upload Evidence <span className="text-[#8BA3BC] font-normal">(optional)</span></label>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(); }}
              onClick={handleFileUpload}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                isDragging ? 'border-[#2563EB] bg-blue-50' : 'border-[#D1DCE8] hover:border-[#2563EB]/50 hover:bg-[#F0F4F8]'
              }`}
            >
              <svg className="w-8 h-8 text-[#8BA3BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-[#5A7090] text-center">
                <span className="text-[#2563EB] font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-[#8BA3BC]">PNG, JPG up to 10MB · Multiple files allowed</p>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {uploadedFiles.map((f) => (
                  <div key={f} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-700">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-[#D1DCE8]">
            <button
              onClick={handleSubmit}
              className="w-full bg-[#1B3A6B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#142E57] transition-all shadow-sm text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Analyze Issue with AI →
            </button>
            <p className="text-xs text-[#8BA3BC] text-center mt-2">Your report will be analyzed by CivicLens AI in seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
