import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, Layers, HelpCircle } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { getSubjectIcon } from '../../lib/icons';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface SubjectsListPageProps {
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const SubjectsListPage: React.FC<SubjectsListPageProps> = ({ onNavigate }) => {
  const { subjects, getSubjectChapters, getSubjectQuestionCount } = useStudy();
  const [query, setQuery] = useState('');

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => onNavigate('home') },
          { label: 'All Subjects', active: true },
        ]}
        onBack={() => onNavigate('home')}
        backLabel="Back to Home"
      />

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Class 12 Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse through Physics, Chemistry, Biology, Mathematics, and Computer Science.
          </p>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((subject) => {
          const chapters = getSubjectChapters(subject.id);
          const qCount = getSubjectQuestionCount(subject.id);

          return (
            <div
              key={subject.id}
              onClick={() => onNavigate('subject', { subjectId: subject.id })}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {getSubjectIcon(subject.icon, 'w-6 h-6 text-white')}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {chapters.length} Chapters
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                  {subject.description}
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">
                  <span className="text-slate-900 font-bold">{qCount}</span> questions
                </span>
                <span className="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Chapters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
