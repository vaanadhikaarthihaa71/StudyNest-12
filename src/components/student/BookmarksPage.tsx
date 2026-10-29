import React, { useState } from 'react';
import { Bookmark, ArrowRight, Trash2, Search, BookOpen, Layers } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface BookmarksPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ onNavigate }) => {
  const { bookmarks, questions, chapters, subjects, toggleBookmark } = useStudy();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Assemble full bookmarked items
  const bookmarkedItems = bookmarks
    .map((b) => {
      const q = questions.find((item) => item.id === b.question_id);
      const c = q ? chapters.find((item) => item.id === q.chapter_id) : undefined;
      const s = c ? subjects.find((item) => item.id === c.subject_id) : undefined;
      return { bookmark: b, question: q, chapter: c, subject: s };
    })
    .filter((item) => item.question && item.chapter && item.subject);

  const filteredItems = bookmarkedItems.filter(({ question, chapter, subject }) => {
    if (selectedSubjectId !== 'all' && subject!.id !== selectedSubjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        question!.question_text.toLowerCase().includes(q) ||
        chapter!.title.toLowerCase().includes(q) ||
        subject!.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => onNavigate('home') },
          { label: 'My Bookmarks', active: true },
        ]}
        onBack={() => onNavigate('home')}
        backLabel="Back to Home"
      />

      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6 fill-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Bookmarked Questions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Your personalized collection of questions saved for quick revision before exams.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 self-start sm:self-auto">
          {bookmarkedItems.length} Saved Questions
        </span>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within bookmarked questions..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>

        {/* Subject Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubjectId === sub.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks List */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No bookmarked questions</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedSubjectId !== 'all'
              ? 'No bookmarked questions match your search or subject filter.'
              : 'Bookmark questions while reading solutions to review formulas, derivations, and tricky questions before tests.'}
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Explore Question Bank
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(({ question, chapter, subject }) => (
            <div
              key={question!.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-700">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{subject!.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium">Ch {chapter!.chapter_number}</span>
                  </div>
                  {question!.marks && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {question!.marks} Marks
                    </span>
                  )}
                </div>

                <h3
                  onClick={() =>
                    onNavigate('question', {
                      subjectId: subject!.id,
                      chapterId: chapter!.id,
                      questionId: question!.id,
                    })
                  }
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer line-clamp-3 leading-snug"
                >
                  {question!.question_text}
                </h3>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleBookmark(question!.id)}
                  title="Remove from bookmarks"
                  className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>

                <button
                  onClick={() =>
                    onNavigate('question', {
                      subjectId: subject!.id,
                      chapterId: chapter!.id,
                      questionId: question!.id,
                    })
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  <span>Revise Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
