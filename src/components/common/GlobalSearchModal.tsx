import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Layers, HelpCircle, ArrowRight } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { SearchResult } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const { searchAll } = useStudy();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'subject' | 'chapter' | 'question'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setFilterType('all');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const rawResults = query.trim() ? searchAll(query) : [];
  const filteredResults =
    filterType === 'all' ? rawResults : rawResults.filter((r) => r.type === filterType);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, chapters, questions or keywords..."
            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-base focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono font-medium text-slate-400 bg-slate-200/70 hover:bg-slate-200 rounded-md transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs bg-white">
          <span className="text-slate-400 font-medium mr-1">Filter:</span>
          {(['all', 'subject', 'chapter', 'question'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full font-medium capitalize transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t === 'all' ? 'All Results' : `${t}s`}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-1.5 flex-1 divide-y divide-slate-100">
          {!query.trim() ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">Quick Search StudyNest 12</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Type any keyword like <span className="font-semibold text-slate-600">"Gauss"</span>,{' '}
                <span className="font-semibold text-slate-600">"Raoult"</span>,{' '}
                <span className="font-semibold text-slate-600">"Stack"</span>, or{' '}
                <span className="font-semibold text-slate-600">"Integral"</span>.
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium text-slate-600">No matching results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">
                Try checking the spelling or searching for a broader term.
              </p>
            </div>
          ) : (
            filteredResults.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => {
                  onSelectResult(result);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50/70 transition-all cursor-pointer border border-transparent hover:border-indigo-100"
              >
                <div className="flex items-start gap-3 min-w-0 pr-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      result.type === 'subject'
                        ? 'bg-blue-100 text-blue-700'
                        : result.type === 'chapter'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {result.type === 'subject' && <BookOpen className="w-4 h-4" />}
                    {result.type === 'chapter' && <Layers className="w-4 h-4" />}
                    {result.type === 'question' && <HelpCircle className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {result.type}
                      </span>
                      {result.questionType && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {result.questionType}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                      {result.title}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{result.subtitle}</p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
