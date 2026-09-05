import type { Page } from '../types';

interface Props {
  navigate: (page: Page) => void;
  currentPage: Page;
  variant?: 'landing' | 'app';
}

export default function Navbar({ navigate, currentPage, variant = 'app' }: Props) {
  const isLanding = variant === 'landing';

  return (
    <nav className={`sticky top-0 z-50 ${isLanding ? 'bg-[#1B3A6B]' : 'bg-white border-b border-[#D1DCE8]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shadow-sm">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 14a6 6 0 110-12 6 6 0 010 12z" opacity={0.3} />
                <path d="M10 4a6 6 0 100 12A6 6 0 0010 4zm0 10a4 4 0 110-8 4 4 0 010 8z" opacity={0.6} />
                <circle cx="10" cy="10" r="2" />
              </svg>
            </div>
            <span className={`font-display font-bold text-xl ${isLanding ? 'text-white' : 'text-[#1B3A6B]'}`}>
              CivicLens
            </span>
          </button>

          {isLanding ? (
            <div className="hidden md:flex items-center gap-6">
              {['Home', 'How It Works', 'Features', 'About'].map((item) => (
                <button key={item} className="text-sm text-white/75 hover:text-white transition-colors font-medium">
                  {item}
                </button>
              ))}
              <button
                onClick={() => navigate('dashboard')}
                className="text-sm text-white/75 hover:text-white transition-colors font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('report')}
                className="text-sm bg-white text-[#1B3A6B] font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                Report an Issue
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('dashboard')}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentPage === 'dashboard' ? 'bg-[#EBF0F8] text-[#1B3A6B]' : 'text-[#5A7090] hover:text-[#1B3A6B] hover:bg-[#F0F4F8]'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('complaint-history')}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentPage === 'complaint-history' ? 'bg-[#EBF0F8] text-[#1B3A6B]' : 'text-[#5A7090] hover:text-[#1B3A6B] hover:bg-[#F0F4F8]'
                }`}
              >
                History
              </button>
              <button
                onClick={() => navigate('admin')}
                className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  currentPage === 'admin' ? 'bg-[#EBF0F8] text-[#1B3A6B]' : 'text-[#5A7090] hover:text-[#1B3A6B] hover:bg-[#F0F4F8]'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => navigate('report')}
                className="text-sm bg-[#1B3A6B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#142E57] transition-colors shadow-sm ml-2"
              >
                + Report Issue
              </button>
              <div className="w-8 h-8 rounded-full bg-[#EBF0F8] flex items-center justify-center ml-1 border border-[#D1DCE8]">
                <span className="text-xs font-semibold text-[#1B3A6B]">A</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
