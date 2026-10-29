import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Bookmark,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { getSubjectIcon } from '../../lib/icons';

interface ProgressPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate }) => {
  const {
    subjects,
    chapters,
    questions,
    bookmarks,
    isCompleted,
    getSubjectChapters,
    getSubjectQuestionCount,
    getTotalCompletedCount,
    getOverallProgressPercentage,
  } = useStudy();

  const totalPublishedQuestions = questions.filter((q) => q.status === 'published').length;
  const totalCompleted = getTotalCompletedCount();
  const overallPercentage = getOverallProgressPercentage();

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => onNavigate('home') },
          { label: 'Study Progress', active: true },
        ]}
        onBack={() => onNavigate('home')}
        backLabel="Back to Home"
      />

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Study Progress & Metrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Accurate tracking based on questions you have marked as solved across all 5 subjects.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>{totalCompleted} Solved</span>
          </div>
        </div>
      </div>

      {/* Overall Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Overall Completion</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{overallPercentage}%</span>
            <span className="text-xs text-slate-400">
              ({totalCompleted} of {totalPublishedQuestions} questions)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Bookmarked for Revision</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{bookmarks.length}</span>
            <span className="text-xs text-slate-400">high-yield questions</span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Revising bookmarked formulas and derivations significantly improves memory retention.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Total Chapters</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{chapters.length}</span>
            <span className="text-xs text-slate-400">across {subjects.length} subjects</span>
          </div>
          <p className="text-xs text-slate-500 pt-1">
            Complete each chapter sequentially to ensure comprehensive board coverage.
          </p>
        </div>
      </div>

      {/* Subject-by-Subject Progress Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Subject-wise Completion Breakdown</h2>

        <div className="space-y-4">
          {subjects.map((sub) => {
            const subChapters = getSubjectChapters(sub.id);
            const subChapIds = subChapters.map((c) => c.id);
            const subQuestions = questions.filter(
              (q) => subChapIds.includes(q.chapter_id) && q.status === 'published'
            );
            const solvedCount = subQuestions.filter((q) => isCompleted(q.id)).length;
            const percent =
              subQuestions.length > 0 ? Math.round((solvedCount / subQuestions.length) * 100) : 0;

            return (
              <div
                key={sub.id}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      {getSubjectIcon(sub.icon, 'w-5 h-5')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{sub.name}</h3>
                      <p className="text-xs text-slate-400">
                        {subChapters.length} chapters • {subQuestions.length} questions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700">
                        {solvedCount} / {subQuestions.length} ({percent}%)
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('subject', { subjectId: sub.id })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
