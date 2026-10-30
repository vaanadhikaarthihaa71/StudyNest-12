import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  ArrowRight,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Code2,
  Lock,
  Mail,
  User,
  AlertCircle,
  KeyRound,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface GatewayScreenProps {
  onLoginSuccess: (role: 'student' | 'admin') => void;
}

export const GatewayScreen: React.FC<GatewayScreenProps> = ({ onLoginSuccess }) => {
  const {
    loginAdminWithCredentials,
    loginStudent,
    openAuthModal,
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('vaanadhikaarthihaa71@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Student Form State
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [isStudentSubmitting, setIsStudentSubmitting] = useState(false);
  const [studentError, setStudentError] = useState('');

  const subjects = [
    { name: 'Physics', icon: Atom, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { name: 'Chemistry', icon: FlaskConical, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { name: 'Biology', icon: Dna, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { name: 'Mathematics', icon: Calculator, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { name: 'Computer Science', icon: Code2, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  // Handle Admin Submission
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    if (!adminPassword.trim()) {
      setAdminError('Please enter your administrator password.');
      return;
    }

    setIsAdminLoading(true);
    const res = await loginAdminWithCredentials(adminEmail, adminPassword);
    setIsAdminLoading(false);

    if (res.success) {
      onLoginSuccess('admin');
    } else {
      setAdminError(res.error || 'Invalid administrator credentials. Access denied.');
    }
  };

  // Handle Student Submission
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError('');

    if (!studentEmail.trim()) {
      setStudentError('Please enter your student email address.');
      return;
    }
    if (!studentPassword) {
      setStudentError('Please enter your password.');
      return;
    }

    setIsStudentSubmitting(true);
    const res = await loginStudent(studentEmail, studentPassword);
    setIsStudentSubmitting(false);

    if (res.success) {
      onLoginSuccess('student');
    } else {
      setStudentError(res.error || 'Failed to sign in.');
    }
  };

  // Quick Guest Student Access
  const handleQuickStudentAccess = async () => {
    setIsStudentSubmitting(true);
    const res = await loginStudent('guest.student@studynest.org', 'student123');
    setIsStudentSubmitting(false);
    if (res.success) {
      onLoginSuccess('student');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40 flex flex-col justify-between text-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Brand Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">StudyNest 12</h2>
            <p className="text-[11px] text-slate-500 font-medium">Class 12 Board Exam Learning Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>CBSE & State Board 2026</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full py-8 sm:py-10 space-y-8">
        {/* Hero Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Class 12 Learning Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome to <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">StudyNest 12</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-medium">
            Your Class 12 learning space
          </p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Please log in to continue. Choose Student Login to practice syllabus questions or Admin Login to manage course content.
          </p>
        </div>

        {/* Five Subjects Pill Strip */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {subjects.map((sub) => {
            const Icon = sub.icon;
            return (
              <div
                key={sub.name}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold ${sub.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sub.name}</span>
              </div>
            );
          })}
        </div>

        {/* Unified Interactive Login Card */}
        <div className="max-w-md mx-auto w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in">
          {/* Tab Switcher */}
          <div className="p-2 bg-slate-100/70 border-b border-slate-200/80 grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setStudentError('');
                setAdminError('');
              }}
              className={`py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Login</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setStudentError('');
                setAdminError('');
              }}
              className={`py-2.5 px-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-white text-violet-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* 1. STUDENT LOGIN FORM */}
            {activeTab === 'student' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center shadow-2xs">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Student Sign In</h2>
                  <p className="text-xs text-slate-500">
                    Access Class 12 board questions, model answers, and track progress.
                  </p>
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Student Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={studentEmail}
                        onChange={(e) => {
                          setStudentEmail(e.target.value);
                          setStudentError('');
                        }}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-600 text-xs font-medium text-slate-900 transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => openAuthModal('forgot')}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={studentPassword}
                        onChange={(e) => {
                          setStudentPassword(e.target.value);
                          setStudentError('');
                        }}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-600 text-xs font-medium text-slate-900 transition-colors"
                      />
                    </div>
                  </div>

                  {studentError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span>{studentError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isStudentSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isStudentSubmitting ? 'Signing In...' : 'Sign In as Student'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Don't have an account?</span>
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer underline underline-offset-2"
                  >
                    Create Account
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleQuickStudentAccess}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quick Guest Student Entry</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. ADMIN LOGIN FORM */}
            {activeTab === 'admin' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 mx-auto flex items-center justify-center shadow-2xs">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Admin Console Sign In</h2>
                  <p className="text-xs text-slate-500">
                    Manage subjects, chapters, questions, media uploads & student tracking.
                  </p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          setAdminError('');
                        }}
                        placeholder="admin@studynest.org"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-violet-600 text-xs font-medium text-slate-900 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setAdminError('');
                        }}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-violet-600 text-xs font-medium text-slate-900 transition-colors"
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  {adminError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <span className="leading-snug">{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAdminLoading}
                    className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span>{isAdminLoading ? 'Unlocking Admin Console...' : 'Unlock Admin Console'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-[11px] text-slate-400 text-center">
                  Protected administrator console. Enter your admin password to sign in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Information */}
      <div className="max-w-6xl mx-auto w-full pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© 2026 StudyNest 12. Class 12 Board Exam Preparation (Physics, Chemistry, Biology, Mathematics, Computer Science).</p>
      </div>
    </div>
  );
};
