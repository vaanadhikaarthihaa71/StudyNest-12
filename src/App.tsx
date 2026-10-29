/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { HomePage } from './components/student/HomePage';
import { SubjectsListPage } from './components/student/SubjectsListPage';
import { SubjectPage } from './components/student/SubjectPage';
import { ChapterPage } from './components/student/ChapterPage';
import { QuestionStudyPage } from './components/student/QuestionStudyPage';
import { BookmarksPage } from './components/student/BookmarksPage';
import { ProgressPage } from './components/student/ProgressPage';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SearchResult } from './types';
import { GraduationCap, Shield, Heart } from 'lucide-react';

interface NavigationState {
  view: string;
  params: Record<string, string>;
}

function MainApp() {
  const { isAdmin, subjects, chapters, questions } = useStudy();
  const [navState, setNavState] = useState<NavigationState>(() => {
    // Check initial hash or default to home
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('/admin')) {
      return { view: 'admin-dashboard', params: {} };
    }
    return { view: 'home', params: {} };
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Keyboard shortcut listener for Ctrl+K or / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (view: string, params: Record<string, string> = {}) => {
    setNavState({ view, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    if (result.type === 'subject') {
      handleNavigate('subject', { subjectId: result.id });
    } else if (result.type === 'chapter') {
      handleNavigate('chapter', {
        subjectId: result.subjectId || subjects[0]?.id || '',
        chapterId: result.id,
      });
    } else if (result.type === 'question') {
      // Find question to get its chapter and subject
      const targetQ = questions.find((q) => q.id === result.id);
      if (targetQ) {
        const targetChap = chapters.find((c) => c.id === targetQ.chapter_id);
        if (targetChap) {
          handleNavigate('question', {
            subjectId: targetChap.subject_id,
            chapterId: targetChap.id,
            questionId: targetQ.id,
          });
        }
      }
    }
  };

  const renderCurrentView = () => {
    switch (navState.view) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} onOpenSearch={() => setIsSearchOpen(true)} />;
      case 'subjects':
        return <SubjectsListPage onNavigate={handleNavigate} />;
      case 'subject':
        return <SubjectPage subjectId={navState.params.subjectId} onNavigate={handleNavigate} />;
      case 'chapter':
        return (
          <ChapterPage
            subjectId={navState.params.subjectId}
            chapterId={navState.params.chapterId}
            onNavigate={handleNavigate}
          />
        );
      case 'question':
        return (
          <QuestionStudyPage
            subjectId={navState.params.subjectId}
            chapterId={navState.params.chapterId}
            questionId={navState.params.questionId}
            onNavigate={handleNavigate}
          />
        );
      case 'bookmarks':
        return <BookmarksPage onNavigate={handleNavigate} />;
      case 'progress':
        return <ProgressPage onNavigate={handleNavigate} />;
      case 'admin-login':
        return (
          <AdminLogin
            onSuccess={() => handleNavigate('admin-dashboard')}
            onCancel={() => handleNavigate('home')}
          />
        );
      case 'admin-dashboard':
        if (!isAdmin) {
          return (
            <AdminLogin
              onSuccess={() => handleNavigate('admin-dashboard')}
              onCancel={() => handleNavigate('home')}
            />
          );
        }
        return <AdminDashboard onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} onOpenSearch={() => setIsSearchOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <Header
        currentView={navState.view}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
        {renderCurrentView()}
      </main>

      {/* Global Interactive Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Floating Interactive Toast Container */}
      <ToastContainer />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800">StudyNest 12</p>
              <p className="text-[11px] text-slate-400">Class 12 Board Exam Preparation Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => handleNavigate('home')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate('subjects')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Subjects
            </button>
            <button
              onClick={() => handleNavigate('bookmarks')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              My Bookmarks
            </button>
            <button
              onClick={() => handleNavigate('progress')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Progress
            </button>
            <button
              onClick={() => handleNavigate(isAdmin ? 'admin-dashboard' : 'admin-login')}
              className="hover:text-violet-600 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5 text-violet-600" />
              <span>Admin Manager</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Demonstration educational content. Editable & expandable dynamically.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <MainApp />
    </StudyProvider>
  );
}
