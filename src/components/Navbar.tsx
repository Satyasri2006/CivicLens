import { useState } from 'react';
import type { Page } from '../types';
import type { User } from '../App';

interface Props {
  navigate: (page: Page) => void;
  currentPage: Page;
  variant?: 'landing' | 'app';
  user?: User | null;
  onOpenAuth?: (targetPage?: Page) => void;
  onLogout?: () => void;
}

export default function Navbar({
  navigate,
  currentPage,
  variant = 'app',
  user,
  onOpenAuth,
  onLogout,
}: Props) {
  const isLanding = variant === 'landing';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'landing') {
      navigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <nav className={`sticky top-0 z-50 ${isLanding ? 'bg-[#1B3A6B]' : 'bg-white border-b border-[#D1DCE8]'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
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

          {/* Desktop Navigation - Landing */}
          {isLanding ? (
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-sm text-white/75 hover:text-white transition-colors font-medium">
                Home
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm text-white/75 hover:text-white transition-colors font-medium">
                How It Works
              </button>
              <button onClick={() => scrollToSection('features')} className="text-sm text-white/75 hover:text-white transition-colors font-medium">
                Features
              </button>
              <button onClick={() => scrollToSection('footer')} className="text-sm text-white/75 hover:text-white transition-colors font-medium">
                About
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-white bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/20 transition-all font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold">
                      {getInitials(user.name)}
                    </div>
                    <span>{user.name}</span>
                    <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#D1DCE8] py-1 text-xs z-50">
                      <div className="px-3 py-2 border-b border-[#D1DCE8]">
                        <p className="font-semibold text-[#0F1C2E] truncate">{user.name}</p>
                        <p className="text-[#5A7090] truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); navigate('dashboard'); }}
                        className="w-full text-left px-3 py-2 text-[#0F1C2E] hover:bg-[#F0F4F8] transition-colors"
                      >
                        Dashboard
                      </button>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => { setProfileDropdownOpen(false); navigate('admin'); }}
                          className="w-full text-left px-3 py-2 text-[#0F1C2E] hover:bg-[#F0F4F8] transition-colors"
                        >
                          Admin Panel
                        </button>
                      )}
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onLogout?.(); }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors border-t border-[#D1DCE8]"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuth?.('dashboard')}
                  className="text-sm text-white/75 hover:text-white transition-colors font-medium"
                >
                  Login
                </button>
              )}

              <button
                onClick={() => navigate('report')}
                className="text-sm bg-white text-[#1B3A6B] font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
              >
                Report an Issue
              </button>
            </div>
          ) : (
            /* Desktop Navigation - App */
            <div className="hidden md:flex items-center gap-2">
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
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('admin')}
                  className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    currentPage === 'admin' ? 'bg-[#EBF0F8] text-[#1B3A6B]' : 'text-[#5A7090] hover:text-[#1B3A6B] hover:bg-[#F0F4F8]'
                  }`}
                >
                  Admin Portal
                </button>
              )}

              <button
                onClick={() => navigate('report')}
                className="text-sm bg-[#1B3A6B] text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#142E57] transition-colors shadow-sm ml-2"
              >
                + Report Issue
              </button>

              {user ? (
                <div className="relative ml-2">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-[#EBF0F8] flex items-center justify-center border border-[#D1DCE8] hover:border-[#1B3A6B] transition-colors"
                  >
                    <span className="text-xs font-semibold text-[#1B3A6B]">
                      {getInitials(user.name)}
                    </span>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#D1DCE8] py-1 text-xs z-50">
                      <div className="px-3 py-2 border-b border-[#D1DCE8]">
                        <p className="font-semibold text-[#0F1C2E] truncate">{user.name}</p>
                        <p className="text-[#5A7090] truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setProfileDropdownOpen(false); onLogout?.(); }}
                        className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onOpenAuth?.()}
                  className="text-sm text-[#1B3A6B] font-medium hover:bg-[#F0F4F8] px-3 py-1.5 rounded-lg transition-colors ml-1"
                >
                  Sign In
                </button>
              )}
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${isLanding ? 'text-white hover:bg-white/10' : 'text-[#1B3A6B] hover:bg-[#F0F4F8]'}`}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-4 pt-2 pb-4 border-t ${isLanding ? 'bg-[#142E57] border-white/10 text-white' : 'bg-white border-[#D1DCE8] text-[#0F1C2E]'}`}>
          <div className="flex flex-col space-y-2 mt-2">
            {isLanding ? (
              <>
                <button onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-left py-2 text-sm font-medium opacity-80 hover:opacity-100">
                  Home
                </button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 text-sm font-medium opacity-80 hover:opacity-100">
                  How It Works
                </button>
                <button onClick={() => scrollToSection('features')} className="text-left py-2 text-sm font-medium opacity-80 hover:opacity-100">
                  Features
                </button>
                {user ? (
                  <button onClick={() => { setMobileMenuOpen(false); onLogout?.(); }} className="text-left py-2 text-sm font-medium text-red-400">
                    Sign Out ({user.name})
                  </button>
                ) : (
                  <button onClick={() => { setMobileMenuOpen(false); onOpenAuth?.('dashboard'); }} className="text-left py-2 text-sm font-medium opacity-80 hover:opacity-100">
                    Login
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={() => { setMobileMenuOpen(false); navigate('dashboard'); }} className="text-left py-2 text-sm font-medium">
                  Dashboard
                </button>
                <button onClick={() => { setMobileMenuOpen(false); navigate('complaint-history'); }} className="text-left py-2 text-sm font-medium">
                  Complaint History
                </button>
                {user?.role === 'admin' && (
                  <button onClick={() => { setMobileMenuOpen(false); navigate('admin'); }} className="text-left py-2 text-sm font-medium text-[#1B3A6B]">
                    Admin Portal
                  </button>
                )}
                {user ? (
                  <button onClick={() => { setMobileMenuOpen(false); onLogout?.(); }} className="text-left py-2 text-sm font-medium text-red-600">
                    Sign Out ({user.name})
                  </button>
                ) : (
                  <button onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }} className="text-left py-2 text-sm font-medium text-[#2563EB]">
                    Sign In
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('report'); }}
              className={`w-full text-center font-semibold py-2.5 rounded-lg text-sm mt-2 shadow-sm ${
                isLanding ? 'bg-white text-[#1B3A6B]' : 'bg-[#1B3A6B] text-white'
              }`}
            >
              + Report an Issue
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
