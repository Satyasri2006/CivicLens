import { useState, useRef } from 'react';
import type { Page, InputMode } from '../types';
import type { User, ReportData } from '../App';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

interface Props {
  navigate: (page: Page, opts?: { reportData?: ReportData }) => void;
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
}

const languages = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam'];
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (stored as base64 in MongoDB)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ReportIssue({ navigate, user, onOpenAuth, onLogout }: Props) {
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [location, setLocation] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ desc?: string; location?: string; files?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDetectLocation = () => {
    setTimeout(() => {
      setLocation('Block B, XYZ Road, Sector 14, City');
      setLocationDetected(true);
    }, 300);
  };

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const valid: File[] = [];
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors((p) => ({ ...p, files: 'Only JPEG, PNG, and WebP images are allowed.' }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrors((p) => ({ ...p, files: 'Each file must be under 5 MB.' }));
        continue;
      }
      valid.push(file);
    }
    setSelectedFiles((prev) => {
      const combined = [...prev, ...valid];
      if (combined.length > MAX_FILES) {
        setErrors((p) => ({ ...p, files: `Maximum ${MAX_FILES} files allowed.` }));
        return combined.slice(0, MAX_FILES);
      }
      setErrors((p) => ({ ...p, files: undefined }));
      return combined;
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ''; // reset so same file can be re-selected
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors((p) => ({ ...p, files: undefined }));
  };

  const handleSubmit = async () => {
    const newErrors: { desc?: string; location?: string } = {};
    if (!description.trim() && inputMode === 'text') {
      newErrors.desc = 'Please describe the civic issue.';
    }
    if (!location.trim()) {
      newErrors.location = 'Please provide or select a location.';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const defaultDesc = description.trim() || 'Civic issue reported via CivicLens AI assistant.';
    const fileNames = selectedFiles.map((f) => f.name);
    setLoading(true);

    try {
      // Send description to backend Gemini analysis endpoint
      const aiAnalysis = await api.complaints.analyze({
        description: defaultDesc,
        language,
        location,
      });

      navigate('ai-analysis', {
        reportData: {
          inputMode,
          description: defaultDesc,
          language,
          location,
          uploadedFiles: fileNames,
          uploadedFileObjects: selectedFiles,
          aiAnalysis,
        },
      });
    } catch (err: any) {
      // Graceful fallback if backend API is unreachable
      navigate('ai-analysis', {
        reportData: {
          inputMode,
          description: defaultDesc,
          language,
          location,
          uploadedFiles: fileNames,
          uploadedFileObjects: selectedFiles,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs: { mode: InputMode; icon: string; label: string }[] = [
    { mode: 'voice', icon: '🎤', label: 'Voice' },
    { mode: 'photo', icon: '📷', label: 'Photo' },
    { mode: 'text', icon: '✍️', label: 'Text' },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8]">
      <Navbar
        navigate={navigate}
        currentPage="report"
        user={user}
        onOpenAuth={onOpenAuth}
        onLogout={onLogout}
      />

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
                <div
                  onClick={() => {
                    setDescription('Garbage has accumulated outside Block B for five days near college campus causing severe odor.');
                    setInputMode('text');
                  }}
                  className="w-20 h-20 rounded-full bg-[#EBF0F8] flex items-center justify-center border-2 border-[#D1DCE8] cursor-pointer hover:border-[#1B3A6B] hover:scale-105 transition-all shadow-sm"
                >
                  <span className="text-3xl">🎤</span>
                </div>
              </div>
              <p className="text-[#5A7090] text-sm text-center">Tap the microphone and speak your report.<br />CivicLens will transcribe and classify it.</p>
              <button
                onClick={() => setInputMode('text')}
                className="text-sm text-[#2563EB] font-medium hover:underline"
              >
                Or switch to text input →
              </button>
            </div>
          )}

          {/* Photo mode */}
          {inputMode === 'photo' && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div
                className="w-full border-2 border-dashed border-[#D1DCE8] rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#2563EB] transition-colors bg-[#F8FAFC]"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-4xl">📷</span>
                <p className="text-[#5A7090] text-sm text-center">Take a photo or upload from your gallery.<br />CivicLens will detect visible civic hazards.</p>
                <button
                  type="button"
                  className="text-sm bg-[#1B3A6B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#142E57] transition-colors shadow-sm"
                >
                  Upload Photo
                </button>
              </div>
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
                placeholder="Example: Garbage has been piling up near Block B for 5 days. The odor is unbearable and residents need immediate cleanup..."
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
                placeholder="Enter address or area (e.g. Block B, XYZ Road)"
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-[#D1DCE8]'
                }`}
              />
              <button
                type="button"
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
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Location detected: Block B, XYZ Road, Sector 14
              </p>
            )}

            {/* Interactive Map placeholder */}
            <div
              onClick={() => {
                if (!location) setLocation('Block B, XYZ Road, Sector 14');
              }}
              className="mt-3 bg-[#E8EFF7] rounded-xl h-28 flex items-center justify-center border border-[#D1DCE8] relative overflow-hidden cursor-pointer hover:border-[#2563EB] transition-colors"
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#D1DCE8 1px, transparent 1px), linear-gradient(90deg, #D1DCE8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <svg className="w-6 h-6 text-[#2563EB] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-xs text-[#1B3A6B] font-medium">{location || 'Click map pin to select location'}</span>
              </div>
            </div>
          </div>

          {/* Photo Upload & Evidence */}
          <div>
            <label className="block text-sm font-semibold text-[#0F1C2E] mb-2">Upload Evidence <span className="text-[#8BA3BC] font-normal">(optional, max {MAX_FILES})</span></label>
            {/* Hidden real file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
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
              <p className="text-xs text-[#8BA3BC]">PNG, JPG, WebP up to 5MB · Max {MAX_FILES} files</p>
            </div>
            {errors.files && <p className="text-xs text-red-600 mt-1">{errors.files}</p>}

            {selectedFiles.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {selectedFiles.map((file, idx) => (
                  <div key={`${file.name}-${idx}`} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded-lg border border-[#D1DCE8]"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFile(idx, e)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Remove file"
                    >
                      ✕
                    </button>
                    <p className="text-[10px] text-[#5A7090] mt-0.5 truncate w-20 text-center">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-[#D1DCE8]">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#1B3A6B] text-white font-semibold py-3.5 rounded-xl hover:bg-[#142E57] transition-all shadow-sm text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Analyze Issue with AI →</span>
                </>
              )}
            </button>
            <p className="text-xs text-[#8BA3BC] text-center mt-2">Your report will be analyzed by CivicLens Gemini AI in seconds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
