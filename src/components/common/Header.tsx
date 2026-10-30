import React, { useState } from 'react';
import {
  GraduationCap,
  Bookmark,
  BarChart3,
  Search,
  Shield,
  Menu,
  X,
  BookOpen,
  Home,
  CheckCircle,
  User,
  LogOut,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
  onOpenSearch: () => void;
  onReturnToLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenSearch, onReturnToLogin }) => {
  const {
    bookmarks,
    getTotalCompletedCount,
    isAdmin,
    currentStudent,
    isStudentAuthenticated,
    openAuthModal,
    openProfileModal,
  } = useStudy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const completedCount = getTotalCompletedCount();
  const bookmarkCount = bookmarks.length;

  const navLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'bookmarks', label: 'My Bookmarks', icon: Bookmark, badge: bookmarkCount },
    { id: 'progress', label: 'Progress', icon: BarChart3, badge: completedCount > 0 ? completedCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  StudyNest<span className="text-indigo-600"> 12</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  CBSE / State
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Class 12 Board Prep Space</p>
            </div>
          </div>

          {/* Quick Search Bar (Desktop Trigger) */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 text-sm max-w-sm w-full transition-all cursor-pointer shadow-2xs"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 font-normal">Search subjects, chapters, questions...</span>
            <kbd className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-400">
              Ctrl+K
            </kbd>
          </button>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="h-5 w-px bg-slate-200 mx-2" />

            {/* Student Account / Sign In Button */}
            {isStudentAuthenticated && currentStudent ? (
              <button
                onClick={openProfileModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="View student profile and learning records"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black">
                  {currentStudent.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{currentStudent.full_name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Student Login</span>
              </button>
            )}

            {/* Admin Portal Button */}
            <button
              onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isAdmin || currentView.startsWith('admin')
                  ? 'bg-violet-100 text-violet-800 border border-violet-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-violet-600" />
              <span>{isAdmin ? 'Admin Console' : 'Admin Login'}</span>
            </button>

            {/* Exit / Return to Login Screen */}
            {onReturnToLogin && (
              <button
                onClick={onReturnToLogin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                title="Switch role or return to Login Screen"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xl:inline">Switch / Exit</span>
              </button>
            )}
          </nav>

          {/* Mobile Right Action Icons */}
          <div className="flex items-center gap-2 lg:hidden">
            {isStudentAuthenticated && currentStudent ? (
              <button
                onClick={openProfileModal}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs"
                title="Student Profile"
              >
                {currentStudent.full_name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Student Sign In"
              >
                <User className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {isStudentAuthenticated && currentStudent ? (
            <div
              onClick={() => {
                openProfileModal();
                setMobileMenuOpen(false);
              }}
              className="p-3 mb-2 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                {currentStudent.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate">{currentStudent.full_name}</div>
                <div className="text-[11px] text-indigo-700 font-semibold">{currentStudent.email}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                openAuthModal('login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 cursor-pointer"
            >
              <User className="w-5 h-5 text-indigo-600" />
              <span>Student Sign In / Register</span>
            </button>
          )}

          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-indigo-600" />
                  <span>{item.label}</span>
                </div>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onNavigate(isAdmin ? 'admin-dashboard' : 'admin-login');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-violet-800 bg-violet-50 hover:bg-violet-100 transition-colors"
            >
              <Shield className="w-5 h-5 text-violet-600" />
              <span>{isAdmin ? 'Admin Console' : 'Admin Login'}</span>
            </button>

            {onReturnToLogin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReturnToLogin();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors mt-2"
              >
                <LogOut className="w-5 h-5 text-rose-600" />
                <span>Return to Login Screen</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
