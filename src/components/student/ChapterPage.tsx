import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Bookmark,
  ArrowRight,
  Headphones,
  Video,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface ChapterPageProps {
  subjectId: string;
  chapterId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const ChapterPage: React.FC<ChapterPageProps> = ({ subjectId, chapterId, onNavigate }) => {
  const {
    subjects,
    chapters,
    getChapterQuestions,
    isBookmarked,
    toggleBookmark,
    isCompleted,
    toggleCompleted,
    getSubjectChapters,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'short' | 'long' | 'bookmarked' | 'completed' | 'pending'
  >('all');
  const [sortBy, setSortBy] = useState<'order' | 'marks-high' | 'marks-low'>('order');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const subject = subjects.find((s) => s.id === subjectId);
  const chapter = chapters.find((c) => c.id === chapterId);
  const allSubjectChapters = getSubjectChapters(subjectId);

  // Find previous and next chapters for seamless progression
  const currentChapIndex = allSubjectChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentChapIndex > 0 ? allSubjectChapters[currentChapIndex - 1] : null;
  const nextChapter =
    currentChapIndex < allSubjectChapters.length - 1 ? allSubjectChapters[currentChapIndex + 1] : null;

  if (!subject || !chapter) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Chapter Not Found</h2>
        <p className="text-sm text-slate-500">The chapter you are looking for does not exist.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const allQuestions = getChapterQuestions(chapterId, true);

  // Filter questions
  const filtered = allQuestions.filter((q) => {
    // Search match
    const matchesSearch =
      q.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.answer_content && q.answer_content.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Type/Status filter
    if (activeFilter === 'short') return q.question_type === 'Short Answer';
    if (activeFilter === 'long') return q.question_type === 'Long Answer';
    if (activeFilter === 'bookmarked') return isBookmarked(q.id);
    if (activeFilter === 'completed') return isCompleted(q.id);
    if (activeFilter === 'pending') return !isCompleted(q.id);

    return true;
  });

  // Sort questions
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'marks-high') return (b.marks || 0) - (a.marks || 0);
    if (sortBy === 'marks-low') return (a.marks || 0) - (b.marks || 0);
    return a.display_order - b.display_order;
  });

  // Pagination for scalability
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedQuestions = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const completedInChapter = allQuestions.filter((q) => isCompleted(q.id)).length;
  const progressPercent =
    allQuestions.length > 0 ? Math.round((completedInChapter / allQuestions.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => onNavigate('home') },
          { label: subject.name, onClick: () => onNavigate('subject', { subjectId: subject.id }) },
          { label: `Ch ${chapter.chapter_number}: ${chapter.title}`, active: true },
        ]}
        onBack={() => onNavigate('subject', { subjectId: subject.id })}
        backLabel={`Back to ${subject.name}`}
      />

      {/* Chapter Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                Chapter {chapter.chapter_number}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-600">{subject.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {chapter.title}
            </h1>
          </div>

          {/* Chapter completion widget */}
          <div className="sm:text-right bg-slate-50 p-3 sm:p-0 sm:bg-transparent rounded-xl">
            <div className="text-xs font-bold text-slate-700">
              {completedInChapter} of {allQuestions.length} completed ({progressPercent}%)
            </div>
            <div className="w-full sm:w-36 bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {chapter.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl pt-1">
            {chapter.description}
          </p>
        )}
      </div>

      {/* Search, Filter Tabs & Sorting Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search in Chapter */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Search ${allQuestions.length} questions in this chapter...`}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="order">Question Number / Order</option>
              <option value="marks-high">Marks: Highest First</option>
              <option value="marks-low">Marks: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
          {[
            { id: 'all', label: `All (${allQuestions.length})` },
            {
              id: 'short',
              label: `Short Answers (${
                allQuestions.filter((q) => q.question_type === 'Short Answer').length
              })`,
            },
            {
              id: 'long',
              label: `Long Answers (${
                allQuestions.filter((q) => q.question_type === 'Long Answer').length
              })`,
            },
            {
              id: 'bookmarked',
              label: `Bookmarked (${allQuestions.filter((q) => isBookmarked(q.id)).length})`,
            },
            {
              id: 'completed',
              label: `Completed (${completedInChapter})`,
            },
            {
              id: 'pending',
              label: `Pending (${allQuestions.length - completedInChapter})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFilter(tab.id as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      {paginatedQuestions.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No questions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No question matches "${searchQuery}" with the current filters.`
              : 'No questions have been published in this chapter yet. Questions can be added seamlessly via the Admin Content Manager.'}
          </p>
          {(searchQuery || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {paginatedQuestions.map((question, index) => {
            const questionIndex = (currentPage - 1) * itemsPerPage + index + 1;
            const bookmarked = isBookmarked(question.id);
            const completed = isCompleted(question.id);

            return (
              <div
                key={question.id}
                className={`group p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  completed
                    ? 'border-emerald-200/90 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                {/* Left info & text */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Completion check trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompleted(question.id);
                    }}
                    title={completed ? 'Mark incomplete' : 'Mark completed'}
                    className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    aria-label={completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Q{questionIndex}.</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          question.question_type === 'Long Answer'
                            ? 'bg-violet-50 text-violet-700 border border-violet-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}
                      >
                        {question.question_type}
                      </span>

                      {question.marks ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                          {question.marks} Marks
                        </span>
                      ) : null}

                      {/* Media indicators */}
                      {question.audio_url && (
                        <span
                          title="Has Audio Overview"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded"
                        >
                          <Headphones className="w-3 h-3" />
                          <span>Audio</span>
                        </span>
                      )}

                      {question.video_url && (
                        <span
                          title="Has Video Lesson"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 bg-rose-50/80 px-1.5 py-0.5 rounded"
                        >
                          <Video className="w-3 h-3" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>

                    <h3
                      onClick={() =>
                        onNavigate('question', {
                          subjectId: subject.id,
                          chapterId: chapter.id,
                          questionId: question.id,
                        })
                      }
                      className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {question.question_text}
                    </h3>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(question.id);
                    }}
                    title={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      bookmarked
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    aria-label="Bookmark"
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-600' : ''}`} />
                  </button>

                  <button
                    onClick={() =>
                      onNavigate('question', {
                        subjectId: subject.id,
                        chapterId: chapter.id,
                        questionId: question.id,
                      })
                    }
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer group-hover:scale-102"
                  >
                    <span>Study Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span> ({sorted.length} total)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg font-bold transition-colors cursor-pointer ${
                  currentPage === idx + 1
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chapter Navigation Footer (Prev / Next Chapter) */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {prevChapter ? (
          <button
            onClick={() =>
              onNavigate('chapter', {
                subjectId: subject.id,
                chapterId: prevChapter.id,
              })
            }
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all text-left cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Previous Chapter
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                Ch {prevChapter.chapter_number}: {prevChapter.title}
              </p>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextChapter && (
          <button
            onClick={() =>
              onNavigate('chapter', {
                subjectId: subject.id,
                chapterId: nextChapter.id,
              })
            }
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all text-right ml-auto cursor-pointer"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Next Chapter
              </span>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                Ch {nextChapter.chapter_number}: {nextChapter.title}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-600 shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
};
