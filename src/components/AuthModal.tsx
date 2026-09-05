import { useState } from 'react';
import { api } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { id?: string; name: string; email: string; role: 'citizen' | 'admin' }) => void;
  initialMode?: 'login' | 'signup';
  intendedAction?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  intendedAction,
}: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const res = await api.auth.register({ name, email, password });
        onLoginSuccess(res.user);
      } else {
        const res = await api.auth.login({ email, password });
        onLoginSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'citizen' | 'admin') => {
    setLoading(true);
    setError('');
    const demoEmail = role === 'admin' ? 'admin@civiclens.gov.in' : 'ananya@citizen.org';
    const demoPassword = 'password';

    try {
      const res = await api.auth.login({ email: demoEmail, password: demoPassword });
      onLoginSuccess(res.user);
    } catch (err: any) {
      // Fallback local state if server fails
      onLoginSuccess({
        id: role === 'admin' ? 'demo_admin' : 'demo_citizen',
        name: role === 'admin' ? 'Ravi Kumar' : 'Ananya Sharma',
        email: demoEmail,
        role,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl border border-[#D1DCE8] shadow-2xl w-full max-w-md overflow-hidden relative animate-fadeInUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5A7090] hover:text-[#0F1C2E] p-1 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="bg-[#1B3A6B] p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-7 h-7 text-white" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="10" cy="10" r="8" opacity={0.3} />
              <circle cx="10" cy="10" r="5" opacity={0.6} />
              <circle cx="10" cy="10" r="2" />
            </svg>
          </div>
          <h3 className="font-display font-bold text-xl">
            {mode === 'login' ? 'Welcome Back to CivicLens' : 'Create CivicLens Account'}
          </h3>
          <p className="text-white/70 text-xs mt-1">
            {intendedAction
              ? intendedAction
              : mode === 'login'
              ? 'Sign in to report civic issues and track resolutions.'
              : 'Join CivicLens to report and track civic complaints in your city.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Mode Switcher */}
          <div className="flex bg-[#F0F4F8] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-[#1B3A6B] shadow-sm' : 'text-[#5A7090] hover:text-[#1B3A6B]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'signup' ? 'bg-white text-[#1B3A6B] shadow-sm' : 'text-[#5A7090] hover:text-[#1B3A6B]'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#0F1C2E] mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full border border-[#D1DCE8] rounded-xl px-3.5 py-2 text-sm text-[#0F1C2E] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F1C2E] mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full border border-[#D1DCE8] rounded-xl px-3.5 py-2 text-sm text-[#0F1C2E] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#0F1C2E] mb-1">Phone Number <span className="text-[#8BA3BC] font-normal">(optional)</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-[#D1DCE8] rounded-xl px-3.5 py-2 text-sm text-[#0F1C2E] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F1C2E] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#D1DCE8] rounded-xl px-3.5 py-2 text-sm text-[#0F1C2E] focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3A6B] text-white font-semibold py-2.5 rounded-xl hover:bg-[#142E57] transition-colors text-sm shadow-sm mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : mode === 'login' ? (
                'Sign In →'
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          {/* Quick Demo Login Shortcut */}
          <div className="pt-3 border-t border-[#D1DCE8] text-center">
            <p className="text-xs text-[#5A7090] mb-2 font-medium">Quick Demo Login</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('citizen')}
                className="flex-1 bg-[#EBF0F8] text-[#1B3A6B] border border-[#D1DCE8] text-xs font-medium py-2 rounded-xl hover:bg-[#D1DCE8] transition-colors"
              >
                👤 Demo Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex-1 bg-[#EBF0F8] text-[#1B3A6B] border border-[#D1DCE8] text-xs font-medium py-2 rounded-xl hover:bg-[#D1DCE8] transition-colors"
              >
                🏛️ Demo Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
