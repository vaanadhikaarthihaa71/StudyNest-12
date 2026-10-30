import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { loginAdminWithCredentials, loginAdmin } = useStudy();

  const [email, setEmail] = useState('vaanadhikaarthihaa71@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);
    const res = await loginAdminWithCredentials(email, password);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMsg(res.error || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-6">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Role Selection</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 mx-auto flex items-center justify-center shadow-xs">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Console Sign In</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          Authorized personnel only. Access syllabus content management, media uploads, and student learning analytics.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Admin Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg('');
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg('');
              }}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-violet-600 text-xs font-medium text-slate-900 transition-colors"
              required
              autoFocus
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span>{isLoading ? 'Unlocking Admin Console...' : 'Unlock Admin Console'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Security Note */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <KeyRound className="w-4 h-4 text-violet-600" />
          <span>Administrator Protected Area</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The Admin Console is restricted to authorized educators and administrators. Sign in with your administrator password to edit subjects, chapters, questions, and media.
        </p>
      </div>
    </div>
  );
};
