import React, { useState } from 'react';
import {
  Shield,
  BookOpen,
  Layers,
  HelpCircle,
  FileCheck,
  Headphones,
  Video,
  LogOut,
  ArrowLeft,
  Upload,
  Database,
  BarChart,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { ManageSubjects } from './ManageSubjects';
import { ManageChapters } from './ManageChapters';
import { ManageQuestions } from './ManageQuestions';
import { BulkImportExport } from './BulkImportExport';
import { DatabaseSettings } from './DatabaseSettings';

interface AdminDashboardProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { subjects, chapters, questions, logoutAdmin } = useStudy();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'subjects' | 'chapters' | 'questions' | 'import-export' | 'database'
  >('overview');

  const totalSubjects = subjects.length;
  const totalChapters = chapters.length;
  const totalQuestions = questions.length;
  const withAnswers = questions.filter((q) => q.answer_content && q.answer_content.trim().length > 0).length;
  const withAudio = questions.filter((q) => q.audio_url && q.audio_url.trim().length > 0).length;
  const withVideo = questions.filter((q) => q.video_url && q.video_url.trim().length > 0).length;

  const handleLogout = () => {
    logoutAdmin();
    onNavigate('home');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart },
    { id: 'subjects', label: `Subjects (${totalSubjects})`, icon: BookOpen },
    { id: 'chapters', label: `Chapters (${totalChapters})`, icon: Layers },
    { id: 'questions', label: `Questions (${totalQuestions})`, icon: HelpCircle },
    { id: 'import-export', label: 'Bulk Import / Export', icon: Upload },
    { id: 'database', label: 'Database & Supabase', icon: Database },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/30">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-400/20 text-violet-300 border border-violet-400/30">
                Admin Console
              </span>
              <span className="text-xs text-slate-400">• Full CRUD Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
              StudyNest 12 Content Manager
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Add unlimited subjects, chapters, model answers, audio walkthroughs, and video lectures dynamically.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview Dashboard Metrics */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Key Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Subjects</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalSubjects}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Physics, Chem, CS...</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Chapters</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalChapters}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Syllabus modules</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-400">Questions</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalQuestions}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Active bank</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600">With Answers</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{withAnswers}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {totalQuestions > 0 ? Math.round((withAnswers / totalQuestions) * 100) : 0}% covered
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-indigo-600">With Audio</span>
              <div className="text-2xl font-extrabold text-indigo-700 mt-1">{withAudio}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Audio walk-throughs</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-rose-600">With Video</span>
              <div className="text-2xl font-extrabold text-rose-700 mt-1">{withVideo}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">YouTube / direct links</p>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              onClick={() => setActiveTab('questions')}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                Add Questions Fast
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add model solutions, formulas, audio tracks, and YouTube videos. Use "Save & Add Another" for rapid data entry.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('import-export')}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                Bulk CSV / JSON Import
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Import 100 or 500 questions in seconds from existing Excel spreadsheets or JSON question files.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('database')}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                Supabase & Cloud Sync
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View SQL schema, configure connection keys, and sync local questions to persistent PostgreSQL.
              </p>
            </div>
          </div>

          {/* Recent Content Log */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-600" />
              <h3 className="text-sm font-bold text-slate-900">Recently Updated Questions</h3>
            </div>

            <div className="space-y-2">
              {questions.slice(0, 5).map((q) => {
                const parentChap = chapters.find((c) => c.id === q.chapter_id);
                const parentSub = parentChap ? subjects.find((s) => s.id === parentChap.subject_id) : null;
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-3">
                      <span className="font-bold text-slate-800 truncate block">{q.question_text}</span>
                      <span className="text-[11px] text-slate-400">
                        {parentSub?.name || 'Subject'} &gt; {parentChap?.title || 'Chapter'} •{' '}
                        {q.question_type}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                        q.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Subjects */}
      {activeTab === 'subjects' && <ManageSubjects />}

      {/* Tab 3: Manage Chapters */}
      {activeTab === 'chapters' && <ManageChapters />}

      {/* Tab 4: Manage Questions */}
      {activeTab === 'questions' && <ManageQuestions />}

      {/* Tab 5: Bulk Import / Export */}
      {activeTab === 'import-export' && <BulkImportExport />}

      {/* Tab 6: Database & Supabase */}
      {activeTab === 'database' && <DatabaseSettings />}
    </div>
  );
};
