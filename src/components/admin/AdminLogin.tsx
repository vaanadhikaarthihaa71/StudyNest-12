import React, { useState } from 'react';
import { Shield, KeyRound, ArrowRight, Lock, Info, CheckCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const { loginAdmin } = useStudy();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!pin.trim()) {
      setErrorMsg('Please enter an access pin');
      return;
    }
    const success = loginAdmin(pin);
    if (success) {
      onSuccess();
    } else {
      setErrorMsg('Invalid access code. Please try again.');
    }
  };

  const handleQuickDemoAccess = () => {
    setPin('1234');
    const success = loginAdmin('1234');
    if (success) onSuccess();
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-700 mx-auto flex items-center justify-center shadow-xs">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin & Content Manager</h1>
        <p className="text-xs text-slate-500">
          Sign in to add unlimited subjects, chapters, questions, audio, and video lessons.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Admin Access PIN
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErrorMsg('');
              }}
              placeholder="Enter PIN (e.g. 1234)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-violet-600 text-sm font-mono tracking-widest text-slate-900"
              autoFocus
            />
          </div>
          {errorMsg && <p className="text-xs text-rose-600 font-medium mt-1.5">{errorMsg}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-violet-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Access Content Manager</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Demo Credentials Hint */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-violet-600" />
          <span>Quick Demo Access:</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Default administrative access code is set to <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-300 font-bold text-violet-700">1234</code>.
        </p>
        <button
          type="button"
          onClick={handleQuickDemoAccess}
          className="w-full py-1.5 rounded-lg bg-white border border-slate-200 hover:border-violet-300 text-violet-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          1-Click Login with Demo PIN (1234)
        </button>
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Cancel and return to Student Portal
        </button>
      </div>
    </div>
  );
};
