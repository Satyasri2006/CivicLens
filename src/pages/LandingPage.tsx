import type { Page } from '../types';
import Navbar from '../components/Navbar';

interface Props {
  navigate: (page: Page) => void;
}

const features = [
  { icon: '🌐', title: 'Multilingual Reporting', desc: 'Report civic issues in regional languages including Telugu, Hindi, Tamil, Kannada, and Malayalam.' },
  { icon: '🧠', title: 'AI Issue Classification', desc: 'Automatically identify the type, category, and severity of your complaint with precision.' },
  { icon: '🏛️', title: 'Smart Department Routing', desc: 'Intelligently suggests the responsible government department for every reported issue.' },
  { icon: '📷', title: 'Image Evidence Analysis', desc: 'Upload photos and let AI detect visible civic problems and validate your complaint.' },
  { icon: '⚡', title: 'Priority Detection', desc: 'Determine whether an issue is LOW, MEDIUM, HIGH, or URGENT with clear reasoning.' },
  { icon: '📄', title: 'Complaint Generation', desc: 'Transform informal descriptions into structured, formal government complaint documents.' },
  { icon: '📍', title: 'Case Tracking', desc: 'Get a unique case ID and track your complaint through every stage of resolution.' },
  { icon: '🔥', title: 'Civic Hotspot Detection', desc: 'Help administrators identify recurring problem clusters across the city.' },
];

const steps = [
  { num: '01', title: 'Describe the Problem', desc: 'Use text, voice, or upload a photo. Describe the issue in any language.' },
  { num: '02', title: 'AI Understands It', desc: 'CivicLens identifies the issue type, category, severity, and relevant details.' },
  { num: '03', title: 'AI Routes It', desc: 'The system identifies the appropriate government department and assigns priority.' },
  { num: '04', title: 'Submit & Track', desc: 'Generate a formal complaint and track its status with a unique case ID.' },
];

export default function LandingPage({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar navigate={navigate} currentPage="landing" variant="landing" />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#1B3A6B] to-[#0F2442] pt-20 pb-24 px-4 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                AI-Powered Civic Technology
              </div>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.25rem] text-white leading-tight mb-5">
                Report a problem.<br />
                <span className="text-[#60A5FA]">Let AI figure out</span><br />
                the rest.
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
                CivicLens transforms everyday civic complaints into structured, actionable government service requests — automatically classified, routed, and tracked.
              </p>

              {/* Input modes */}
              <div className="flex gap-3 mb-8 flex-wrap">
                {[
                  { icon: '🎤', label: 'Speak', desc: 'Describe in your language' },
                  { icon: '📷', label: 'Snap', desc: 'Upload a photo' },
                  { icon: '✍️', label: 'Type', desc: 'Write your complaint' },
                ].map((m) => (
                  <div key={m.label} className="bg-white/10 border border-white/20 rounded-xl p-3.5 flex items-center gap-3 min-w-[150px] hover:bg-white/15 transition-colors cursor-pointer">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{m.label}</p>
                      <p className="text-white/50 text-xs">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate('report')}
                  className="bg-white text-[#1B3A6B] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  Report a Civic Issue →
                </button>
                <button className="text-white/80 border border-white/30 font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-all text-sm">
                  See How It Works
                </button>
              </div>
            </div>

            {/* Right - mock analysis card */}
            <div className="relative animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#D1DCE8]">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs font-mono text-[#5A7090] font-medium">AI Analysis Complete</span>
                  <span className="ml-auto text-xs font-mono text-[#5A7090]">CL-10482</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Issue', value: 'Garbage accumulation', bold: true },
                    { label: 'Category', value: 'Sanitation', bold: false },
                    { label: 'Priority', value: 'HIGH', badge: true, color: 'text-red-700 bg-red-50 border-red-200' },
                    { label: 'Department', value: 'Municipal Sanitation', bold: false },
                    { label: 'Status', value: 'Ready to submit', badge: true, color: 'text-green-700 bg-green-50 border-green-200' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-[#5A7090] font-medium">{row.label}</span>
                      {row.badge ? (
                        <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${row.color}`}>{row.value}</span>
                      ) : (
                        <span className={`text-sm ${row.bold ? 'font-semibold text-[#0F1C2E]' : 'text-[#3A4F6A]'}`}>{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#D1DCE8] bg-[#F0F4F8] rounded-xl p-3">
                  <p className="text-xs text-[#5A7090] mb-1 font-medium">AI Priority Reasoning</p>
                  <p className="text-xs text-[#3A4F6A] leading-relaxed">"Waste uncollected for 5 days in a public area creates hygiene and public-health risks."</p>
                </div>
                <button
                  onClick={() => navigate('report')}
                  className="w-full mt-4 bg-[#1B3A6B] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#142E57] transition-colors"
                >
                  Submit Complaint →
                </button>
              </div>

              {/* floating badge */}
              <div className="absolute -top-3 -right-3 bg-[#2563EB] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                AI-Powered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[#F0F4F8] border-b border-[#D1DCE8] py-5">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '1,248', label: 'Issues Reported' },
            { n: '888', label: 'Resolved' },
            { n: '42', label: 'Urgent Cases' },
            { n: '6', label: 'Languages Supported' },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display font-bold text-2xl text-[#1B3A6B]">{s.n}</p>
              <p className="text-xs text-[#5A7090] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-[#2563EB] font-semibold uppercase tracking-widest mb-2">Process</p>
            <h2 className="font-display font-bold text-3xl text-[#0F1C2E]">How CivicLens Works</h2>
            <p className="text-[#5A7090] mt-2 max-w-md mx-auto">Four steps from problem to resolution.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-0 relative">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#D1DCE8]" />
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center px-6 pb-8 animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 rounded-full border-2 border-[#1B3A6B] bg-white flex items-center justify-center mb-4 relative z-10">
                  <span className="font-display font-bold text-[#1B3A6B] text-sm">{step.num}</span>
                </div>
                <h3 className="font-display font-semibold text-[#0F1C2E] text-base mb-2">{step.title}</h3>
                <p className="text-sm text-[#5A7090] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[#F0F4F8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-[#2563EB] font-semibold uppercase tracking-widest mb-2">Capabilities</p>
            <h2 className="font-display font-bold text-3xl text-[#0F1C2E]">Everything you need to be heard</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={f.title} className="bg-white rounded-xl border border-[#D1DCE8] p-5 hover:shadow-md hover:border-[#2563EB]/30 transition-all animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <h3 className="font-display font-semibold text-[#0F1C2E] text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-[#5A7090] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-[#1B3A6B]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl text-white mb-4">Your city, your voice.</h2>
          <p className="text-white/70 mb-8">Report civic problems quickly and confidently. CivicLens does the rest.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('report')}
              className="bg-white text-[#1B3A6B] font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-sm"
            >
              Report an Issue Now
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="text-white/80 border border-white/30 font-medium px-6 py-3 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F2442] py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-white">
                <circle cx="10" cy="10" r="8" opacity={0.4} />
                <circle cx="10" cy="10" r="3" />
              </svg>
            </div>
            <span className="font-display font-bold text-white">CivicLens</span>
          </div>
          <p className="text-white/40 text-xs">© 2026 CivicLens. AI-Powered Citizen Grievance Platform.</p>
        </div>
      </footer>
    </div>
  );
}
