import React, { useState } from 'react';
import {
  Search,
  Layers,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { getSubjectIcon } from '../../lib/icons';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface SubjectPageProps {
  subjectId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({ subjectId, onNavigate }) => {
  const { subjects, getSubjectChapters, getChapterQuestions, getChapterProgressPercentage } = useStudy();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const subject = subjects.find((s) => s.id === subjectId);
  const chapters = getSubjectChapters(subjectId);

  if (!subject) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Subject Not Found</h2>
        <p className="text-sm text-slate-500">The subject you are trying to view does not exist.</p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Filter chapters by search query
  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `chapter ${c.chapter_number}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => onNavigate('home') },
          { label: 'Subjects', onClick: () => onNavigate('subjects') },
          { label: subject.name, active: true },
        ]}
        onBack={() => onNavigate('home')}
        backLabel="Back to Home"
      />

      {/* Subject Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4 sm:gap-5">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/20">
            {getSubjectIcon(subject.icon, 'w-8 h-8')}
          </div>
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Class 12 Syllabus
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-500">
                {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {subject.name}
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{subject.description}</p>
          </div>
        </div>

        {/* View toggle & Search controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter chapters..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center self-end sm:self-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chapters Container */}
      {filteredChapters.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No chapters found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No chapter matching "${searchQuery}". Try clearing the search query.`
              : 'No chapters have been created for this subject yet. You can add unlimited chapters using the Admin Dashboard.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredChapters.map((chapter) => {
            const chapQuestions = getChapterQuestions(chapter.id, true);
            const shortCount = chapQuestions.filter((q) => q.question_type === 'Short Answer').length;
            const longCount = chapQuestions.filter((q) => q.question_type === 'Long Answer').length;
            const progressPercent = getChapterProgressPercentage(chapter.id);

            return (
              <div
                key={chapter.id}
                onClick={() =>
                  onNavigate('chapter', {
                    subjectId: subject.id,
                    chapterId: chapter.id,
                  })
                }
                className="group p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Chapter {chapter.chapter_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {progressPercent}% Complete
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {chapter.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {chapter.description || 'No chapter summary provided.'}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-medium">
                      <span>{chapQuestions.length} Total</span>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">{shortCount} Short</span>
                      <span>•</span>
                      <span className="text-violet-600 font-semibold">{longCount} Long</span>
                    </div>

                    <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Open Chapter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChapters.map((chapter) => {
            const chapQuestions = getChapterQuestions(chapter.id, true);
            const shortCount = chapQuestions.filter((q) => q.question_type === 'Short Answer').length;
            const longCount = chapQuestions.filter((q) => q.question_type === 'Long Answer').length;
            const progressPercent = getChapterProgressPercentage(chapter.id);

            return (
              <div
                key={chapter.id}
                onClick={() =>
                  onNavigate('chapter', {
                    subjectId: subject.id,
                    chapterId: chapter.id,
                  })
                }
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                    {chapter.chapter_number}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {chapter.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-xl">
                      {chapter.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{chapQuestions.length} Questions</span>
                      <span>({shortCount} Short, {longCount} Long)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-700">{progressPercent}%</span>
                    <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-xs flex items-center gap-1 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <span>View Questions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
