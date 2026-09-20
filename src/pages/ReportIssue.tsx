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
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ desc?: string; location?: string; files?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<any>(null);

  const startVoiceRecording = () => {
    setSpeechError('');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your complaint below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang =
        language === 'Telugu' ? 'te-IN' :
        language === 'Hindi' ? 'hi-IN' :
        language === 'Tamil' ? 'ta-IN' :
        language === 'Kannada' ? 'kn-IN' :
        language === 'Malayalam' ? 'ml-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        const trimmed = currentTranscript.trim();
        if (trimmed) {
          setVoiceTranscript(trimmed);
          setDescription(trimmed);
          setErrors((p) => ({ ...p, desc: undefined }));
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice input notice: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition error:', err);
      setIsRecording(false);
      setSpeechError('Could not access microphone. Please check your browser permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrors((p) => ({ ...p, location: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setDetectingLocation(true);
    setErrors((p) => ({ ...p, location: undefined }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            const road = addr?.road || addr?.suburb || addr?.neighbourhood || '';
            const city = addr?.city || addr?.town || addr?.county || '';
            const state = addr?.state || '';
            const postcode = addr?.postcode || '';
            const readable = [road, city, state, postcode].filter(Boolean).join(', ') || data.display_name;
            setLocation(readable || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          } else {
            setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          }
        } catch {
          setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        } finally {
          setLocationDetected(true);
          setDetectingLocation(false);
        }
      },
      (err) => {
        setDetectingLocation(false);
        setErrors((p) => ({
          ...p,
          location: err.code === 1
            ? 'Location permission was denied. Please type your location.'
            : 'Unable to retrieve your location. Please type your address manually.',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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
            <div className="flex flex-col items-center py-6 gap-4 bg-[#F8FAFC] rounded-2xl p-6 border border-[#D1DCE8]">
              <div className="relative">
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all shadow-md ${
                    isRecording
                      ? 'bg-red-500 border-red-200 text-white animate-pulse scale-105'
                      : 'bg-[#1B3A6B] border-blue-200 text-white hover:scale-105 hover:bg-[#142E57]'
                  }`}
                  title={isRecording ? 'Click to stop recording' : 'Click to start speaking'}
                >
                  <span className="text-4xl">{isRecording ? '⏹️' : '🎤'}</span>
                </button>
                {isRecording && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                  </span>
                )}
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-[#0F1C2E]">
                  {isRecording ? 'Listening... Speak your civic complaint' : 'Tap microphone to speak'}
                </h3>
                <p className="text-xs text-[#5A7090]">
                  {isRecording
                    ? 'Transcribing in real-time. Speak clearly in English or Indian regional languages.'
                    : 'We will transcribe your voice note directly into the complaint text.'}
                </p>
              </div>

              {speechError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl max-w-md text-center">
                  ⚠️ {speechError}
                </div>
              )}

              {/* Live transcript preview */}
              {description && (
                <div className="w-full bg-white border border-[#D1DCE8] rounded-xl p-4 mt-2 shadow-sm text-left">
                  <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-[#D1DCE8]">
                    <span className="text-xs font-bold text-[#1B3A6B] flex items-center gap-1.5">
                      <span>📝</span> Transcribed Complaint Text
                    </span>
                    <button
                      type="button"
                      onClick={() => setInputMode('text')}
                      className="text-xs text-[#2563EB] hover:underline font-semibold"
                    >
                      Edit in Text Mode →
                    </button>
                  </div>
                  <p className="text-sm text-[#0F1C2E] leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
              )}

              <div className="flex items-center gap-3 mt-1">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="px-5 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Done Speaking (Stop)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInputMode('text')}
                    className="text-xs text-[#5A7090] hover:text-[#1B3A6B] font-medium"
                  >
                    Prefer typing? Switch to text input →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Photo mode */}
          {inputMode === 'photo' && (
            <div className="flex flex-col items-center py-4 gap-4">
              <div
                className="w-full border-2 border-dashed border-[#D1DCE8] rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-[#2563EB] transition-colors bg-[#F8FAFC]"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-4xl">📷</span>
                <p className="text-[#5A7090] text-sm text-center">
                  Upload photo evidence from your gallery or take a picture.<br />
                  CivicLens AI will inspect the photo and classify the civic hazard.
                </p>
                <button
                  type="button"
                  className="text-sm bg-[#1B3A6B] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#142E57] transition-colors shadow-sm"
                >
                  Choose Photos ({selectedFiles.length}/{MAX_FILES})
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
                placeholder="Describe what you observed, where it is, and how long it has been a problem..."
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
                placeholder="Enter address or area (e.g. 5th Main, Sector 12, Bengaluru)"
                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-[#D1DCE8]'
                }`}
              />
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="flex items-center gap-2 bg-[#EBF0F8] text-[#1B3A6B] text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-[#D1DCE8] transition-colors border border-[#D1DCE8] whitespace-nowrap"
              >
                {detectingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
                    <span>Detecting GPS...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Use My Location</span>
                  </>
                )}
              </button>
            </div>
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
            {locationDetected && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                Live GPS location resolved: {location}
              </p>
            )}

            {/* Interactive Map placeholder */}
            <div
              onClick={() => {
                if (!location) setLocation('Main Road, Sector 14');
              }}
              className="mt-3 bg-[#E8EFF7] rounded-xl h-24 flex items-center justify-center border border-[#D1DCE8] relative overflow-hidden cursor-pointer hover:border-[#2563EB] transition-colors"
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#D1DCE8 1px, transparent 1px), linear-gradient(90deg, #D1DCE8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <svg className="w-5 h-5 text-[#2563EB] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span className="text-xs text-[#1B3A6B] font-medium">{location || 'Click to set pinned location'}</span>
              </div>
            </div>
          </div>

          {/* Photo Upload & Evidence — Images appear DIRECTLY INSIDE this box */}
          <div>
            <label className="block text-sm font-semibold text-[#0F1C2E] mb-2">
              Upload Evidence <span className="text-[#8BA3BC] font-normal">(optional, max {MAX_FILES} photos)</span>
            </label>
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
              className={`border-2 border-dashed rounded-2xl p-5 transition-all ${
                isDragging ? 'border-[#2563EB] bg-blue-50' : 'border-[#D1DCE8] bg-[#F8FAFC]'
              }`}
            >
              {selectedFiles.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 cursor-pointer py-4"
                >
                  <svg className="w-9 h-9 text-[#8BA3BC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-[#0F1C2E] text-center font-medium">
                    <span className="text-[#2563EB] hover:underline">Click to upload photos</span> or drag & drop here
                  </p>
                  <p className="text-xs text-[#8BA3BC]">PNG, JPG, WebP up to 5MB · Up to {MAX_FILES} photos</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D1DCE8]">
                    <span className="text-xs font-bold text-[#0F1C2E]">
                      Attached Photos ({selectedFiles.length}/{MAX_FILES})
                    </span>
                    {selectedFiles.length < MAX_FILES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs bg-[#1B3A6B] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#142E57] transition-colors"
                      >
                        + Add More
                      </button>
                    )}
                  </div>
                  {/* Previews render right inside this box */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedFiles.map((file, idx) => (
                      <div key={`${file.name}-${idx}`} className="relative group rounded-xl overflow-hidden border border-[#D1DCE8] bg-white shadow-sm">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-24 object-cover"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleRemoveFile(idx, e)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                          title="Remove photo"
                        >
                          ✕
                        </button>
                        <div className="p-1.5 bg-white">
                          <p className="text-[10px] text-[#5A7090] font-medium truncate">{file.name}</p>
                          <p className="text-[9px] text-[#8BA3BC]">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                    ))}
                    {selectedFiles.length < MAX_FILES && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-32 border-2 border-dashed border-[#D1DCE8] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#2563EB] hover:bg-white transition-all text-[#5A7090]"
                      >
                        <span className="text-2xl">+</span>
                        <span className="text-[11px] font-semibold">Add Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.files && <p className="text-xs text-red-600 mt-1">{errors.files}</p>}
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
