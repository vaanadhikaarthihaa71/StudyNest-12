import React from 'react';
import {
  Search,
  BookOpen,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { getSubjectIcon } from '../../lib/icons';
import { Subject } from '../../types';

interface HomePageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenSearch }) => {
  const {
    subjects,
    chapters,
    questions,
    bookmarks,
    progress,
    recentActivity,
    getSubjectChapters,
    getSubjectQuestionCount,
    getOverallProgressPercentage,
    getTotalCompletedCount,
  } = useStudy();

  const totalQuestions = questions.filter((q) => q.status === 'published').length;
  const totalCompleted = getTotalCompletedCount();
  const overallPercentage = getOverallProgressPercentage();

  // Find recent items with full details
  const recentItems = recentActivity
    .map((r) => {
      const q = questions.find((item) => item.id === r.question_id);
      const c = chapters.find((item) => item.id === r.chapter_id);
      const s = subjects.find((item) => item.id === r.subject_id);
      return { recent: r, question: q, chapter: c, subject: s };
    })
    .filter((item) => item.question && item.chapter && item.subject)
    .slice(0, 3);

  // Bookmarked preview
  const bookmarkedQuestions = bookmarks
    .map((b) => {
      const q = questions.find((item) => item.id === b.question_id);
      const c = q ? chapters.find((item) => item.id === q.chapter_id) : undefined;
      const s = c ? subjects.find((item) => item.id === c.subject_id) : undefined;
      return { bookmark: b, question: q, chapter: c, subject: s };
    })
    .filter((item) => item.question && item.chapter && item.subject)
    .slice(0, 3);

  const getThemeClasses = (colorTheme?: string) => {
    switch (colorTheme) {
      case 'blue':
        return {
          bg: 'bg-blue-50/70 hover:bg-blue-50/90',
          border: 'border-blue-200/80',
          iconBg: 'bg-blue-600 text-white',
          badge: 'bg-blue-100 text-blue-700',
          accent: 'text-blue-600',
        };
      case 'violet':
        return {
          bg: 'bg-purple-50/70 hover:bg-purple-50/90',
          border: 'border-purple-200/80',
          iconBg: 'bg-purple-600 text-white',
          badge: 'bg-purple-100 text-purple-700',
          accent: 'text-purple-600',
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50/70 hover:bg-emerald-50/90',
          border: 'border-emerald-200/80',
          iconBg: 'bg-emerald-600 text-white',
          badge: 'bg-emerald-100 text-emerald-700',
          accent: 'text-emerald-600',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/70 hover:bg-amber-50/90',
          border: 'border-amber-200/80',
          iconBg: 'bg-amber-600 text-white',
          badge: 'bg-amber-100 text-amber-700',
          accent: 'text-amber-600',
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-50/70 hover:bg-cyan-50/90',
          border: 'border-cyan-200/80',
          iconBg: 'bg-cyan-600 text-white',
          badge: 'bg-cyan-100 text-cyan-700',
          accent: 'text-cyan-600',
        };
      default:
        return {
          bg: 'bg-indigo-50/70 hover:bg-indigo-50/90',
          border: 'border-indigo-200/80',
          iconBg: 'bg-indigo-600 text-white',
          badge: 'bg-indigo-100 text-indigo-700',
          accent: 'text-indigo-600',
        };
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-10 shadow-xl shadow-indigo-950/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Class 12 Board Examination Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Your Class 12 <span className="text-indigo-300">learning space</span>.
          </h1>

          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed">
            High-yield questions with model answers, audio overview explanations, and video lessons tailored for board exam success.
          </p>

          {/* Prominent Search Bar */}
          <div className="pt-2">
            <div
              onClick={onOpenSearch}
              className="flex items-center gap-3 w-full bg-white text-slate-800 rounded-2xl px-4 py-3.5 shadow-lg shadow-black/10 hover:shadow-xl hover:scale-[1.01] transition-all cursor-pointer border border-white/20 group"
            >
              <Search className="w-5 h-5 text-indigo-600 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-sm text-slate-400 font-normal">
                Search subjects, chapters, or questions...
              </span>
              <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                Explore
              </span>
            </div>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 bottom-0 w-64 h-64 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />
      </section>

      {/* Quick Progress Overview Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions Solved</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{totalCompleted}</span>
              <span className="text-xs text-slate-400">/ {totalQuestions} total</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saved Bookmarks</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold text-slate-900">{bookmarks.length}</span>
              <span className="text-xs text-slate-400">for revision</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="uppercase tracking-wider text-slate-400">Exam Preparedness</span>
              <span className="text-indigo-600 font-bold">{overallPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Five Primary Subjects Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore Subjects</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Select a subject to access its board chapters and structured question bank
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {subjects.length} Subjects Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((subject) => {
            const subChapters = getSubjectChapters(subject.id);
            const questionCount = getSubjectQuestionCount(subject.id);
            const theme = getThemeClasses(subject.color_theme);

            return (
              <div
                key={subject.id}
                onClick={() => onNavigate('subject', { subjectId: subject.id })}
                className={`group relative rounded-2xl border ${theme.border} bg-white hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between cursor-pointer`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${theme.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      {getSubjectIcon(subject.icon, 'w-6 h-6 text-white')}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      {subChapters.length} {subChapters.length === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">
                    <span className="text-slate-900 font-bold">{questionCount}</span> questions
                  </span>
                  <span className="flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Subject</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Continue Learning Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
          </div>
          {recentItems.length > 0 && (
            <span className="text-xs text-slate-400">Recently opened questions</span>
          )}
        </div>

        {recentItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No recent study activity yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Once you start opening chapters and questions, your recent study sessions will automatically appear here for quick resumption.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentItems.map(({ recent, question, chapter, subject }) => (
              <div
                key={recent.question_id}
                onClick={() =>
                  onNavigate('question', {
                    subjectId: subject!.id,
                    chapterId: chapter!.id,
                    questionId: question!.id,
                  })
                }
                className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                    <span className="text-indigo-600">{subject!.name}</span>
                    <span>Ch {chapter!.chapter_number}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {question!.question_text}
                  </h4>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] font-medium">{question!.question_type}</span>
                  <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Resume</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Revision: Bookmarks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">Quick Revision: Bookmarked Questions</h2>
          </div>
          {bookmarkedQuestions.length > 0 && (
            <button
              onClick={() => onNavigate('bookmarks')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              View all ({bookmarks.length})
            </button>
          )}
        </div>

        {bookmarkedQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            <Bookmark className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No bookmarked questions</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Tap the bookmark icon on any question while studying to assemble your personalized quick revision list.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bookmarkedQuestions.map(({ question, chapter, subject }) => (
              <div
                key={question!.id}
                onClick={() =>
                  onNavigate('question', {
                    subjectId: subject!.id,
                    chapterId: chapter!.id,
                    questionId: question!.id,
                  })
                }
                className="group p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-amber-700 mb-1.5">
                    <span>{subject!.name}</span>
                    <span className="text-slate-400">{question!.marks ? `${question!.marks} Marks` : ''}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {question!.question_text}
                  </h4>
                </div>

                <div className="pt-3 mt-3 border-t border-amber-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Ch {chapter!.chapter_number}: {chapter!.title}</span>
                  <span className="text-amber-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Revise</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
