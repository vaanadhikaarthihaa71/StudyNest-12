import React, { useState } from 'react';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  Cloud,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import {
  testSupabaseConnection,
  syncLocalToSupabase,
} from '../../lib/storage';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
} from '../../lib/supabase';

export const DatabaseSettings: React.FC = () => {
  const { isSupabaseConfigured, resetData, reloadFromStorage, showToast } = useStudy();

  const [url, setUrl] = useState(() => getStoredSupabaseConfig().supabaseUrl);
  const [anonKey, setAnonKey] = useState(() => getStoredSupabaseConfig().supabaseAnonKey);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveConfig = () => {
    saveStoredSupabaseConfig(url, anonKey);
    reloadFromStorage();
    showToast('Database configuration credentials updated', 'success');
  };

  const handleTestConnection = async () => {
    handleSaveConfig();
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    const res = await syncLocalToSupabase();
    if (res.success) {
      showToast(`Successfully synced ${res.count} items to Supabase!`, 'success');
    } else {
      showToast(`Sync failed: ${res.error}`, 'error');
    }
    setIsSyncing(false);
  };

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSchema(true);
    showToast('Supabase PostgreSQL SQL schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Database & Cloud Persistence Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Supabase PostgreSQL connection, manage database schema, and sync content.
        </p>
      </div>

      {/* Persistence Status Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isSupabaseConfigured
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {isSupabaseConfigured ? <Cloud className="w-6 h-6" /> : <Server className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {isSupabaseConfigured
                  ? 'Cloud Database (Supabase PostgreSQL)'
                  : 'Local Persistent Preview Engine (Active)'}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isSupabaseConfigured ? 'Connected' : 'Offline / LocalStorage'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {isSupabaseConfigured
                ? 'Your website is connected to Supabase for multi-device sync, row-level security, and permanent cloud persistence.'
                : 'All changes (subjects, chapters, questions, answers, bookmarks) are automatically saved to your browser localStorage with zero downtime. Connect Supabase below whenever you wish to enable cloud multi-user sync.'}
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Credentials Setup Form */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Database className="w-4 h-4 text-violet-600" />
          <span>Supabase PostgreSQL Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-violet-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-violet-600"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Save Credentials
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isTesting || !url || !anonKey}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {isSupabaseConfigured && (
            <button
              onClick={handleSyncToSupabase}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Local Content to Supabase'}</span>
            </button>
          )}
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* SQL Migration Script Viewer */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Supabase SQL Schema (Tables, Indexes, RLS Policies)
            </h3>
          </div>
          <button
            onClick={handleCopySchema}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            {copiedSchema ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Schema!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy SQL Schema</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Run this SQL script inside your Supabase project (SQL Editor → New Query) to provision all tables: <code className="font-mono text-indigo-600">subjects</code>, <code className="font-mono text-indigo-600">chapters</code>, <code className="font-mono text-indigo-600">questions</code>, <code className="font-mono text-indigo-600">bookmarks</code>, and <code className="font-mono text-indigo-600">study_progress</code> with Row-Level Security, along with dedicated storage buckets: <code className="font-mono text-violet-700">studynest-audio</code>, <code className="font-mono text-rose-700">studynest-video</code>, and <code className="font-mono text-emerald-700">studynest-assets</code> for direct file uploads.
        </p>
        <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed max-h-52 overflow-y-auto">
          <code>{SUPABASE_SQL_SCHEMA}</code>
        </pre>
      </div>

      {/* Reset Demo Data Card */}
      <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>Reset Sample Content</span>
        </div>
        <p className="text-xs text-rose-700">
          Want to restore the original Class 12 demonstration content? This will reset questions, chapters, and sample data to factory demo values.
        </p>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
        >
          Reset All Data to Demo Content
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Confirm Factory Reset</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will restore the initial demonstration subjects, chapters, and questions for Class 12. Any custom questions you added will be replaced by the defaults.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
