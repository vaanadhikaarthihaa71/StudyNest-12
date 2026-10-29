import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { Subject, Chapter, Question, Bookmark, StudyProgress, RecentActivity, SearchResult, QuestionStatus } from '../types';
import {
  getLocalSubjects, saveLocalSubjects,
  getLocalChapters, saveLocalChapters,
  getLocalQuestions, saveLocalQuestions,
  getLocalBookmarks, saveLocalBookmarks,
  getLocalProgress, saveLocalProgress,
  getLocalRecentActivity, saveLocalRecentActivity,
  getOrCreateUserId,
  isAdminAuthenticated, setAdminAuthenticated,
  resetAllDataToDefault,
} from '../lib/storage';
import { getStoredSupabaseConfig } from '../lib/supabase';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface StudyContextType {
  // Data
  subjects: Subject[];
  chapters: Chapter[];
  questions: Question[];
  bookmarks: Bookmark[];
  progress: StudyProgress[];
  recentActivity: RecentActivity[];
  userId: string;
  isAdmin: boolean;
  isSupabaseConfigured: boolean;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Student actions
  isBookmarked: (questionId: string) => boolean;
  toggleBookmark: (questionId: string) => void;
  isCompleted: (questionId: string) => boolean;
  toggleCompleted: (questionId: string) => void;
  recordQuestionView: (questionId: string, chapterId: string, subjectId: string) => void;

  // Calculations
  getSubjectChapters: (subjectId: string) => Chapter[];
  getChapterQuestions: (chapterId: string, onlyPublished?: boolean) => Question[];
  getSubjectQuestionCount: (subjectId: string) => number;
  getChapterProgressPercentage: (chapterId: string) => number;
  getOverallProgressPercentage: () => number;
  getTotalCompletedCount: () => number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchAll: (query: string) => SearchResult[];

  // Admin Actions
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  
  // Subject CRUD
  addSubject: (subject: Omit<Subject, 'id' | 'created_at'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Chapter CRUD
  addChapter: (chapter: Omit<Chapter, 'id' | 'created_at'>) => Chapter;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;

  // Question CRUD
  addQuestion: (question: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  duplicateQuestion: (id: string) => Question | null;

  // Bulk & Reset
  importQuestions: (newQuestions: Question[], mode: 'append' | 'replace') => { added: number; updated: number };
  resetData: () => void;
  reloadFromStorage: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId] = useState<string>(() => getOrCreateUserId());
  const [subjects, setSubjects] = useState<Subject[]>(() => getLocalSubjects());
  const [chapters, setChapters] = useState<Chapter[]>(() => getLocalChapters());
  const [questions, setQuestions] = useState<Question[]>(() => getLocalQuestions());
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => getLocalBookmarks());
  const [progress, setProgress] = useState<StudyProgress[]>(() => getLocalProgress());
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(() => getLocalRecentActivity());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(() => getStoredSupabaseConfig().isConfigured);

  // Sync to local storage whenever state changes
  useEffect(() => {
    saveLocalSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveLocalChapters(chapters);
  }, [chapters]);

  useEffect(() => {
    saveLocalQuestions(questions);
  }, [questions]);

  useEffect(() => {
    saveLocalBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveLocalProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveLocalRecentActivity(recentActivity);
  }, [recentActivity]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const reloadFromStorage = () => {
    setSubjects(getLocalSubjects());
    setChapters(getLocalChapters());
    setQuestions(getLocalQuestions());
    setBookmarks(getLocalBookmarks());
    setProgress(getLocalProgress());
    setRecentActivity(getLocalRecentActivity());
    setIsAdmin(isAdminAuthenticated());
    setIsSupabaseConfigured(getStoredSupabaseConfig().isConfigured);
  };

  // Student Actions
  const isBookmarked = (questionId: string) => {
    return bookmarks.some((b) => b.user_id === userId && b.question_id === questionId);
  };

  const toggleBookmark = (questionId: string) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.user_id === userId && b.question_id === questionId);
      if (exists) {
        showToast('Question removed from bookmarks', 'info');
        return prev.filter((b) => !(b.user_id === userId && b.question_id === questionId));
      } else {
        showToast('Question added to bookmarks', 'success');
        return [
          ...prev,
          {
            id: 'bm-' + Math.random().toString(36).substring(2, 10),
            user_id: userId,
            question_id: questionId,
            created_at: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const isCompleted = (questionId: string) => {
    return progress.some((p) => p.user_id === userId && p.question_id === questionId && p.is_completed);
  };

  const toggleCompleted = (questionId: string) => {
    setProgress((prev) => {
      const existing = prev.find((p) => p.user_id === userId && p.question_id === questionId);
      if (existing && existing.is_completed) {
        showToast('Marked as not completed', 'info');
        return prev.map((p) =>
          p.user_id === userId && p.question_id === questionId ? { ...p, is_completed: false } : p
        );
      } else {
        // Trigger celebratory micro-confetti
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
          });
        } catch {
          // safe ignore
        }
        showToast('Well done! Question marked as completed 🎉', 'success');
        if (existing) {
          return prev.map((p) =>
            p.user_id === userId && p.question_id === questionId
              ? { ...p, is_completed: true, completed_at: new Date().toISOString() }
              : p
          );
        } else {
          return [
            ...prev,
            {
              id: 'prog-' + Math.random().toString(36).substring(2, 10),
              user_id: userId,
              question_id: questionId,
              is_completed: true,
              completed_at: new Date().toISOString(),
              last_viewed_at: new Date().toISOString(),
            },
          ];
        }
      }
    });
  };

  const recordQuestionView = (questionId: string, chapterId: string, subjectId: string) => {
    setRecentActivity((prev) => {
      const filtered = prev.filter((r) => r.question_id !== questionId);
      return [
        {
          question_id: questionId,
          chapter_id: chapterId,
          subject_id: subjectId,
          viewed_at: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, 8);
    });
  };

  // Helper selectors
  const getSubjectChapters = (subjectId: string) => {
    return chapters
      .filter((c) => c.subject_id === subjectId)
      .sort((a, b) => a.chapter_number - b.chapter_number || a.display_order - b.display_order);
  };

  const getChapterQuestions = (chapterId: string, onlyPublished = true) => {
    return questions
      .filter((q) => q.chapter_id === chapterId && (!onlyPublished || q.status === 'published'))
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getSubjectQuestionCount = (subjectId: string) => {
    const subChapters = chapters.filter((c) => c.subject_id === subjectId).map((c) => c.id);
    return questions.filter((q) => subChapters.includes(q.chapter_id) && q.status === 'published').length;
  };

  const getChapterProgressPercentage = (chapterId: string) => {
    const chapterQuestions = questions.filter((q) => q.chapter_id === chapterId && q.status === 'published');
    if (chapterQuestions.length === 0) return 0;
    const completedCount = chapterQuestions.filter((q) => isCompleted(q.id)).length;
    return Math.round((completedCount / chapterQuestions.length) * 100);
  };

  const getTotalCompletedCount = () => {
    const publishedIds = new Set(questions.filter((q) => q.status === 'published').map((q) => q.id));
    return progress.filter((p) => p.user_id === userId && p.is_completed && publishedIds.has(p.question_id)).length;
  };

  const getOverallProgressPercentage = () => {
    const published = questions.filter((q) => q.status === 'published');
    if (published.length === 0) return 0;
    const completed = getTotalCompletedCount();
    return Math.round((completed / published.length) * 100);
  };

  // Search All
  const searchAll = (query: string): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search Subjects
    subjects.forEach((s) => {
      if (s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)) {
        results.push({
          type: 'subject',
          id: s.id,
          title: s.name,
          subtitle: s.description.substring(0, 90) + '...',
          subjectId: s.id,
        });
      }
    });

    // Search Chapters
    chapters.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || `chapter ${c.chapter_number}`.includes(q)) {
        const parentSub = subjects.find((s) => s.id === c.subject_id);
        results.push({
          type: 'chapter',
          id: c.id,
          title: `Ch ${c.chapter_number}: ${c.title}`,
          subtitle: `${parentSub ? parentSub.name + ' • ' : ''}${c.description?.substring(0, 80) || ''}`,
          subjectId: c.subject_id,
          chapterId: c.id,
        });
      }
    });

    // Search Questions
    questions.forEach((qu) => {
      if (
        qu.question_text.toLowerCase().includes(q) ||
        (qu.answer_content && qu.answer_content.toLowerCase().includes(q))
      ) {
        const parentChap = chapters.find((c) => c.id === qu.chapter_id);
        const parentSub = parentChap ? subjects.find((s) => s.id === parentChap.subject_id) : undefined;
        results.push({
          type: 'question',
          id: qu.id,
          title: qu.question_text.length > 90 ? qu.question_text.substring(0, 90) + '...' : qu.question_text,
          subtitle: `${parentSub?.name || ''} > ${parentChap?.title || ''} • ${qu.question_type}`,
          subjectId: parentSub?.id,
          chapterId: parentChap?.id,
          questionType: qu.question_type,
        });
      }
    });

    return results.slice(0, 15);
  };

  // Admin Auth
  const loginAdmin = (pin: string) => {
    // Default PIN is 1234 or admin123
    const validPins = ['1234', 'admin123', 'studynest12'];
    if (validPins.includes(pin.trim())) {
      setIsAdmin(true);
      setAdminAuthenticated(true);
      showToast('Admin mode activated successfully', 'success');
      return true;
    }
    showToast('Invalid admin access code', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminAuthenticated(false);
    showToast('Logged out of Admin mode', 'info');
  };

  // Subject CRUD
  const addSubject = (subData: Omit<Subject, 'id' | 'created_at'>) => {
    const newSub: Subject = {
      ...subData,
      id: 'sub-' + subData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4),
      created_at: new Date().toISOString(),
    };
    setSubjects((prev) => [...prev, newSub]);
    showToast(`Subject "${newSub.name}" added successfully`, 'success');
    return newSub;
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast('Subject updated successfully', 'success');
  };

  const deleteSubject = (id: string) => {
    const targetSub = subjects.find((s) => s.id === id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    // Cascade delete chapters and questions
    const subChapIds = chapters.filter((c) => c.subject_id === id).map((c) => c.id);
    setChapters((prev) => prev.filter((c) => c.subject_id !== id));
    setQuestions((prev) => prev.filter((q) => !subChapIds.includes(q.chapter_id)));
    showToast(`Subject "${targetSub?.name || ''}" and its content deleted`, 'info');
  };

  // Chapter CRUD
  const addChapter = (chapData: Omit<Chapter, 'id' | 'created_at'>) => {
    const newChap: Chapter = {
      ...chapData,
      id: 'chap-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    setChapters((prev) => [...prev, newChap]);
    showToast(`Chapter "${newChap.title}" added successfully`, 'success');
    return newChap;
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Chapter updated successfully', 'success');
  };

  const deleteChapter = (id: string) => {
    const targetChap = chapters.find((c) => c.id === id);
    setChapters((prev) => prev.filter((c) => c.id !== id));
    setQuestions((prev) => prev.filter((q) => q.chapter_id !== id));
    showToast(`Chapter "${targetChap?.title || ''}" deleted`, 'info');
  };

  // Question CRUD
  const addQuestion = (qData: Omit<Question, 'id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString();
    const newQ: Question = {
      ...qData,
      id: 'q-' + Math.random().toString(36).substring(2, 9),
      created_at: now,
      updated_at: now,
    };
    setQuestions((prev) => [...prev, newQ]);
    showToast('Question added successfully', 'success');
    return newQ;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updated_at: new Date().toISOString() } : q))
    );
    showToast('Question saved successfully', 'success');
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setBookmarks((prev) => prev.filter((b) => b.question_id !== id));
    setProgress((prev) => prev.filter((p) => p.question_id !== id));
    showToast('Question deleted', 'info');
  };

  const duplicateQuestion = (id: string): Question | null => {
    const target = questions.find((q) => q.id === id);
    if (!target) return null;
    const now = new Date().toISOString();
    const duplicated: Question = {
      ...target,
      id: 'q-' + Math.random().toString(36).substring(2, 9),
      question_text: target.question_text + ' (Copy)',
      status: 'draft',
      created_at: now,
      updated_at: now,
    };
    setQuestions((prev) => [...prev, duplicated]);
    showToast('Question duplicated as Draft', 'success');
    return duplicated;
  };

  const importQuestions = (newQuestions: Question[], mode: 'append' | 'replace') => {
    let added = 0;
    let updated = 0;

    if (mode === 'replace') {
      setQuestions(newQuestions);
      added = newQuestions.length;
    } else {
      setQuestions((prev) => {
        const map = new Map<string, Question>();
        prev.forEach((q) => map.set(q.id, q));
        newQuestions.forEach((q) => {
          if (map.has(q.id)) {
            updated++;
          } else {
            added++;
          }
          map.set(q.id, q);
        });
        return Array.from(map.values());
      });
    }

    showToast(`Bulk import complete: ${added} added, ${updated} updated`, 'success');
    return { added, updated };
  };

  const resetData = () => {
    resetAllDataToDefault();
    reloadFromStorage();
    showToast('All data reset to initial sample demonstration content', 'info');
  };

  const value = useMemo(
    () => ({
      subjects,
      chapters,
      questions,
      bookmarks,
      progress,
      recentActivity,
      userId,
      isAdmin,
      isSupabaseConfigured,
      toasts,
      showToast,
      removeToast,
      isBookmarked,
      toggleBookmark,
      isCompleted,
      toggleCompleted,
      recordQuestionView,
      getSubjectChapters,
      getChapterQuestions,
      getSubjectQuestionCount,
      getChapterProgressPercentage,
      getOverallProgressPercentage,
      getTotalCompletedCount,
      searchQuery,
      setSearchQuery,
      searchAll,
      loginAdmin,
      logoutAdmin,
      addSubject,
      updateSubject,
      deleteSubject,
      addChapter,
      updateChapter,
      deleteChapter,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      duplicateQuestion,
      importQuestions,
      resetData,
      reloadFromStorage,
    }),
    [
      subjects,
      chapters,
      questions,
      bookmarks,
      progress,
      recentActivity,
      userId,
      isAdmin,
      isSupabaseConfigured,
      toasts,
      searchQuery,
    ]
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
