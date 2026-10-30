import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  Chapter,
  Question,
  Bookmark,
  StudyProgress,
  RecentActivity,
  SearchResult,
  QuestionStatus,
  StudentProfile,
  StudentActivity,
  StudentActivityType,
  StudentWithStats,
} from '../types';
import {
  getLocalSubjects, saveLocalSubjects,
  getLocalChapters, saveLocalChapters,
  getLocalQuestions, saveLocalQuestions,
  getLocalBookmarks, saveLocalBookmarks,
  getLocalProgress, saveLocalProgress,
  getLocalRecentActivity, saveLocalRecentActivity,
  getLocalStudentProfile, saveLocalStudentProfile,
  getLocalStudentActivities, saveLocalStudentActivity,
  logStudentActivityCloud,
  getOrCreateUserId,
  isAdminAuthenticated, setAdminAuthenticated,
  resetAllDataToDefault,
} from '../lib/storage';
import { getSupabaseClient, getStoredSupabaseConfig } from '../lib/supabase';

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

  // Student Authentication & Profile
  currentStudent: StudentProfile | null;
  isStudentAuthenticated: boolean;
  isStudentLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
  registerStudent: (name: string, email: string, password: string, targetBoard?: string) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutStudent: () => Promise<void>;
  resetStudentPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateStudentProfile: (updates: Partial<StudentProfile>) => Promise<boolean>;

  // Student Learning Activity Tracking
  studentActivities: StudentActivity[];
  recordActivity: (type: StudentActivityType, questionId?: string, chapterId?: string, subjectId?: string, details?: Record<string, any>) => void;

  // Admin Student Management & Analytics
  allStudentsWithStats: StudentWithStats[];
  isLoadingStudents: boolean;
  refreshAdminStudents: () => Promise<void>;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Student Study Actions
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

  // Admin Auth Actions
  loginAdmin: (pin: string) => boolean;
  loginAdminWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  const [userId, setUserId] = useState<string>(() => getOrCreateUserId());
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

  // Student State
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(() => getLocalStudentProfile());
  const [isStudentLoading, setIsStudentLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(() => getLocalStudentActivities());

  // Admin Student Management Data - Real registered students only
  const [allStudentsWithStats, setAllStudentsWithStats] = useState<StudentWithStats[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Sync to local storage
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

  useEffect(() => {
    saveLocalStudentProfile(currentStudent);
  }, [currentStudent]);

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

  // Check Supabase Auth Session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsStudentLoading(true);
      const supabase = getSupabaseClient();
      if (!supabase) {
        setIsStudentLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const u = session.user;
          setUserId(u.id);

          // Check if user is an admin
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', u.id)
            .maybeSingle();

          if (adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'superadmin')) {
            setIsAdmin(true);
            setAdminAuthenticated(true);
          } else {
            // Fetch student profile
            const { data: profile } = await supabase
              .from('student_profiles')
              .select('*')
              .eq('id', u.id)
              .maybeSingle();

            if (profile) {
              setCurrentStudent(profile);
            } else {
              // Construct profile from user auth metadata
              const newProf: StudentProfile = {
                id: u.id,
                full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Student',
                email: u.email || '',
                target_board: u.user_metadata?.target_board || 'CBSE Class 12',
                total_questions_completed: 0,
                created_at: new Date().toISOString(),
                last_login_at: new Date().toISOString(),
              };
              setCurrentStudent(newProf);
            }

            // Load student's cloud bookmarks and progress
            try {
              const { data: bData } = await supabase.from('bookmarks').select('*').eq('user_id', u.id);
              if (bData && bData.length > 0) setBookmarks(bData);

              const { data: pData } = await supabase.from('study_progress').select('*').eq('user_id', u.id);
              if (pData && pData.length > 0) setProgress(pData);
            } catch {
              // ignore table missing
            }
          }
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      } finally {
        setIsStudentLoading(false);
      }

      // Listen for auth changes
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session) {
          setCurrentStudent(null);
          saveLocalStudentProfile(null);
        }
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    };

    initAuth();
  }, []);

  // Realtime subscription for Admin live monitoring
  useEffect(() => {
    if (!isAdmin) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel('studynest_admin_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_profiles' },
        () => {
          refreshAdminStudents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_progress' },
        () => {
          refreshAdminStudents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'student_activity' },
        () => {
          refreshAdminStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  // Modal open/close controls
  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openProfileModal = () => setIsProfileModalOpen(true);
  const closeProfileModal = () => setIsProfileModalOpen(false);

  // Student Activity Logger
  const recordActivity = (
    type: StudentActivityType,
    questionId?: string,
    chapterId?: string,
    subjectId?: string,
    details?: Record<string, any>
  ) => {
    const act: StudentActivity = {
      id: 'act-' + Math.random().toString(36).substring(2, 9),
      user_id: currentStudent ? currentStudent.id : userId,
      activity_type: type,
      question_id: questionId,
      chapter_id: chapterId,
      subject_id: subjectId,
      details,
      created_at: new Date().toISOString(),
    };

    setStudentActivities((prev) => [act, ...prev].slice(0, 50));
    saveLocalStudentActivity(act);

    // Sync to Supabase cloud if connected
    logStudentActivityCloud(act.user_id, type, questionId, chapterId, subjectId, details);
  };

  // Student Registration
  const registerStudent = async (
    name: string,
    email: string,
    password: string,
    targetBoard = 'CBSE Class 12'
  ): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              target_board: targetBoard,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const newId = data.user?.id || 'std_' + Math.random().toString(36).substring(2, 10);
        const newProf: StudentProfile = {
          id: newId,
          full_name: cleanName,
          email: cleanEmail,
          target_board: targetBoard,
          total_questions_completed: 0,
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };

        // Try direct insert to student_profiles
        try {
          await supabase.from('student_profiles').upsert({
            id: newId,
            full_name: cleanName,
            email: cleanEmail,
            target_board: targetBoard,
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          });
        } catch {
          // trigger will handle or table offline
        }

        setCurrentStudent(newProf);
        setUserId(newId);
        recordActivity('login', undefined, undefined, undefined, { method: 'registered' });
        showToast(`Welcome to StudyNest 12, ${cleanName}! 🎓`, 'success');
        closeAuthModal();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed.' };
      }
    }

    // Local/Offline Fallback registration
    const fallbackId = 'std_' + Math.random().toString(36).substring(2, 10);
    const fallbackProf: StudentProfile = {
      id: fallbackId,
      full_name: cleanName,
      email: cleanEmail,
      target_board: targetBoard,
      total_questions_completed: 0,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };
    setCurrentStudent(fallbackProf);
    setUserId(fallbackId);
    showToast(`Account created for ${cleanName}!`, 'success');
    closeAuthModal();
    return { success: true };
  };

  // Student Login
  const loginStudent = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        const uid = data.user.id;
        setUserId(uid);

        // Fetch or create profile
        let studentProfile: StudentProfile | null = null;
        try {
          const { data: prof } = await supabase.from('student_profiles').select('*').eq('id', uid).maybeSingle();
          if (prof) studentProfile = prof;
        } catch {
          // table not yet ready
        }

        if (!studentProfile) {
          studentProfile = {
            id: uid,
            full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            target_board: data.user.user_metadata?.target_board || 'CBSE Class 12',
            total_questions_completed: 0,
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          };
        }

        // Update last login
        try {
          await supabase
            .from('student_profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', uid);
        } catch {
          // ignore
        }

        // Load bookmarks and progress from Supabase
        try {
          const { data: bData } = await supabase.from('bookmarks').select('*').eq('user_id', uid);
          if (bData && bData.length > 0) setBookmarks(bData);

          const { data: pData } = await supabase.from('study_progress').select('*').eq('user_id', uid);
          if (pData && pData.length > 0) setProgress(pData);
        } catch {
          // ignore
        }

        setCurrentStudent(studentProfile);
        recordActivity('login', undefined, undefined, undefined, { email: cleanEmail });
        showToast(`Welcome back, ${studentProfile.full_name}! 👋`, 'success');
        closeAuthModal();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed.' };
      }
    }

    // Offline / Demo student login
    const demoStudent: StudentProfile = {
      id: 'student_' + cleanEmail.replace(/[^a-z0-9]/g, '_'),
      full_name: cleanEmail.split('@')[0],
      email: cleanEmail,
      target_board: 'CBSE Class 12',
      total_questions_completed: 0,
      created_at: new Date().toISOString(),
      last_login_at: new Date().toISOString(),
    };
    setCurrentStudent(demoStudent);
    setUserId(demoStudent.id);
    showToast(`Signed in as ${demoStudent.full_name}`, 'success');
    closeAuthModal();
    return { success: true };
  };

  // Student Logout
  const logoutStudent = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // safe ignore
      }
    }
    setCurrentStudent(null);
    saveLocalStudentProfile(null);
    const guestId = 'student_' + Math.random().toString(36).substring(2, 10);
    setUserId(guestId);
    showToast('Signed out successfully.', 'info');
  };

  // Password Reset
  const resetStudentPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
        if (error) {
          return { success: false, message: error.message };
        }
        return {
          success: true,
          message: `Password reset link sent to ${cleanEmail}. Please check your inbox.`,
        };
      } catch (err: any) {
        return { success: false, message: err.message || 'Failed to send reset email.' };
      }
    }

    return {
      success: true,
      message: `If an account exists for ${cleanEmail}, password reset instructions have been dispatched.`,
    };
  };

  // Update Student Profile
  const updateStudentProfile = async (updates: Partial<StudentProfile>): Promise<boolean> => {
    if (!currentStudent) return false;
    const updated = { ...currentStudent, ...updates, updated_at: new Date().toISOString() };
    setCurrentStudent(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('student_profiles')
          .update(updates)
          .eq('id', currentStudent.id);
      } catch {
        // fallback
      }
    }
    showToast('Profile updated successfully!', 'success');
    return true;
  };

  // Admin Student Management Fetcher
  const refreshAdminStudents = async () => {
    setIsLoadingStudents(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: profiles, error: pErr } = await supabase
          .from('student_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!pErr && profiles && profiles.length > 0) {
          // Fetch all progress and bookmarks to compile student stats
          const { data: allProg } = await supabase.from('study_progress').select('user_id, question_id, is_completed');
          const { data: allBm } = await supabase.from('bookmarks').select('user_id, question_id');

          const compiled: StudentWithStats[] = profiles.map((p) => {
            const studentProg = (allProg || []).filter((pr) => pr.user_id === p.id && pr.is_completed);
            const studentBms = (allBm || []).filter((b) => b.user_id === p.id);
            const totalPubQuestions = questions.filter((q) => q.status === 'published').length || 1;
            const pct = Math.min(100, Math.round((studentProg.length / totalPubQuestions) * 100));

            return {
              ...p,
              completed_count: studentProg.length,
              progress_percentage: pct,
              bookmarked_count: studentBms.length,
            };
          });

          setAllStudentsWithStats(compiled);
          setIsLoadingStudents(false);
          return;
        }
      } catch (err) {
        console.warn('Admin student fetch fallback notice:', err);
      }
    }

    // If current student is active locally, show their stats in the admin overview; otherwise show empty list
    if (currentStudent) {
      const myCompleted = progress.filter((p) => p.user_id === currentStudent.id && p.is_completed).length;
      const totalQ = questions.filter((q) => q.status === 'published').length || 1;
      const meWithStats: StudentWithStats = {
        ...currentStudent,
        completed_count: myCompleted,
        progress_percentage: Math.min(100, Math.round((myCompleted / totalQ) * 100)),
        bookmarked_count: bookmarks.filter((b) => b.user_id === currentStudent.id).length,
      };

      setAllStudentsWithStats([meWithStats]);
    } else {
      setAllStudentsWithStats([]);
    }
    setIsLoadingStudents(false);
  };

  const reloadFromStorage = () => {
    setSubjects(getLocalSubjects());
    setChapters(getLocalChapters());
    setQuestions(getLocalQuestions());
    setBookmarks(getLocalBookmarks());
    setProgress(getLocalProgress());
    setRecentActivity(getLocalRecentActivity());
    setIsAdmin(isAdminAuthenticated());
    setCurrentStudent(getLocalStudentProfile());
    setIsSupabaseConfigured(getStoredSupabaseConfig().isConfigured);
  };

  // Student Study Actions
  const isBookmarked = (questionId: string) => {
    const activeUid = currentStudent ? currentStudent.id : userId;
    return bookmarks.some((b) => b.user_id === activeUid && b.question_id === questionId);
  };

  const toggleBookmark = (questionId: string) => {
    const activeUid = currentStudent ? currentStudent.id : userId;
    const exists = bookmarks.some((b) => b.user_id === activeUid && b.question_id === questionId);

    if (exists) {
      setBookmarks((prev) => prev.filter((b) => !(b.user_id === activeUid && b.question_id === questionId)));
      recordActivity('unbookmark', questionId);
      showToast('Question removed from bookmarks', 'info');

      // Sync removal to Supabase
      const supabase = getSupabaseClient();
      if (supabase && currentStudent) {
        supabase.from('bookmarks').delete().eq('user_id', activeUid).eq('question_id', questionId).then(() => {});
      }
    } else {
      const newBm: Bookmark = {
        id: 'bm-' + Math.random().toString(36).substring(2, 10),
        user_id: activeUid,
        question_id: questionId,
        created_at: new Date().toISOString(),
      };
      setBookmarks((prev) => [...prev, newBm]);
      recordActivity('bookmark', questionId);
      showToast('Question bookmarked for revision! ⭐', 'success');

      // Sync addition to Supabase
      const supabase = getSupabaseClient();
      if (supabase && currentStudent) {
        supabase.from('bookmarks').insert({ user_id: activeUid, question_id: questionId }).then(() => {});
      }
    }
  };

  const isCompleted = (questionId: string) => {
    const activeUid = currentStudent ? currentStudent.id : userId;
    return progress.some((p) => p.user_id === activeUid && p.question_id === questionId && p.is_completed);
  };

  const toggleCompleted = (questionId: string) => {
    const activeUid = currentStudent ? currentStudent.id : userId;
    const existing = progress.find((p) => p.user_id === activeUid && p.question_id === questionId);
    const now = new Date().toISOString();

    if (existing && existing.is_completed) {
      // Mark as NOT completed
      setProgress((prev) =>
        prev.map((p) => (p.user_id === activeUid && p.question_id === questionId ? { ...p, is_completed: false } : p))
      );
      recordActivity('uncomplete_question', questionId);
      showToast('Marked as not completed', 'info');

      if (currentStudent) {
        const newCount = Math.max(0, (currentStudent.total_questions_completed || 1) - 1);
        setCurrentStudent({ ...currentStudent, total_questions_completed: newCount, last_studied_at: now });
      }

      // Sync to Supabase
      const supabase = getSupabaseClient();
      if (supabase && currentStudent) {
        supabase
          .from('study_progress')
          .update({ is_completed: false, last_viewed_at: now })
          .eq('user_id', activeUid)
          .eq('question_id', questionId)
          .then(() => {});
      }
    } else {
      // Micro-confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b'],
        });
      } catch {
        // safe ignore
      }

      showToast('Well done! Question marked as completed 🎉', 'success');
      recordActivity('complete_question', questionId);

      if (existing) {
        setProgress((prev) =>
          prev.map((p) =>
            p.user_id === activeUid && p.question_id === questionId
              ? { ...p, is_completed: true, completed_at: now, last_viewed_at: now }
              : p
          )
        );
      } else {
        const newProg: StudyProgress = {
          id: 'prog-' + Math.random().toString(36).substring(2, 10),
          user_id: activeUid,
          question_id: questionId,
          is_completed: true,
          completed_at: now,
          last_viewed_at: now,
        };
        setProgress((prev) => [...prev, newProg]);
      }

      if (currentStudent) {
        const newCount = (currentStudent.total_questions_completed || 0) + 1;
        setCurrentStudent({ ...currentStudent, total_questions_completed: newCount, last_studied_at: now });
      }

      // Sync to Supabase
      const supabase = getSupabaseClient();
      if (supabase && currentStudent) {
        supabase
          .from('study_progress')
          .upsert(
            {
              user_id: activeUid,
              question_id: questionId,
              is_completed: true,
              completed_at: now,
              last_viewed_at: now,
            },
            { onConflict: 'user_id,question_id' }
          )
          .then(() => {});

        // Update student profile last_studied_at
        supabase
          .from('student_profiles')
          .update({ last_studied_at: now })
          .eq('id', activeUid)
          .then(() => {});
      }
    }
  };

  const recordQuestionView = (questionId: string, chapterId: string, subjectId: string) => {
    const activeUid = currentStudent ? currentStudent.id : userId;
    const now = new Date().toISOString();

    setRecentActivity((prev) => {
      const filtered = prev.filter((r) => r.question_id !== questionId);
      return [
        {
          question_id: questionId,
          chapter_id: chapterId,
          subject_id: subjectId,
          viewed_at: now,
        },
        ...filtered,
      ].slice(0, 8);
    });

    recordActivity('view_question', questionId, chapterId, subjectId);

    if (currentStudent) {
      setCurrentStudent({ ...currentStudent, last_studied_at: now });
    }
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
    const activeUid = currentStudent ? currentStudent.id : userId;
    const publishedIds = new Set(questions.filter((q) => q.status === 'published').map((q) => q.id));
    return progress.filter((p) => p.user_id === activeUid && p.is_completed && publishedIds.has(p.question_id)).length;
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
      if (qu.question_text.toLowerCase().includes(q) || (qu.answer_content && qu.answer_content.toLowerCase().includes(q))) {
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

  // Admin Auth via Realtime Admin Password ("hi vaanu") & Supabase Credentials
  const loginAdminWithCredentials = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Check Realtime Admin Password: "hi vaanu"
    if (cleanPass.toLowerCase() === 'hi vaanu') {
      setIsAdmin(true);
      setAdminAuthenticated(true);
      showToast('Admin Console unlocked successfully! 🔐', 'success');
      return { success: true };
    }

    // 2. Fallback to Supabase Auth if cloud credentials provided
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, error: 'Invalid administrator credentials. Access denied.' };
        }

        if (data.user) {
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'superadmin')) {
            setIsAdmin(true);
            setAdminAuthenticated(true);
            showToast('Administrator authenticated successfully!', 'success');
            return { success: true };
          }
        }
      } catch (err: any) {
        // Continue to password check error
      }
    }

    return {
      success: false,
      error: 'Incorrect administrator password. Access denied.',
    };
  };

  // Direct realtime password verification
  const loginAdmin = (password: string) => {
    if (password.trim().toLowerCase() === 'hi vaanu') {
      setIsAdmin(true);
      setAdminAuthenticated(true);
      showToast('Admin Console unlocked successfully! 🚀', 'success');
      return true;
    }
    showToast('Incorrect administrator password. Access denied.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
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
        const existingIds = new Set(prev.map((q) => q.id));
        const merged = [...prev];
        newQuestions.forEach((nq) => {
          if (existingIds.has(nq.id)) {
            const idx = merged.findIndex((q) => q.id === nq.id);
            if (idx >= 0) {
              merged[idx] = nq;
              updated++;
            }
          } else {
            merged.push(nq);
            added++;
          }
        });
        return merged;
      });
    }

    showToast(`Import completed: ${added} added, ${updated} updated`, 'success');
    return { added, updated };
  };

  const resetData = () => {
    resetAllDataToDefault();
    reloadFromStorage();
    showToast('All subjects, chapters, and questions reset to default syllabus', 'info');
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
      currentStudent,
      isStudentAuthenticated: Boolean(currentStudent),
      isStudentLoading,
      isAuthModalOpen,
      authModalTab,
      openAuthModal,
      closeAuthModal,
      isProfileModalOpen,
      openProfileModal,
      closeProfileModal,
      registerStudent,
      loginStudent,
      logoutStudent,
      resetStudentPassword,
      updateStudentProfile,
      studentActivities,
      recordActivity,
      allStudentsWithStats,
      isLoadingStudents,
      refreshAdminStudents,
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
      loginAdminWithCredentials,
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
      currentStudent,
      isStudentLoading,
      isAuthModalOpen,
      authModalTab,
      isProfileModalOpen,
      studentActivities,
      allStudentsWithStats,
      isLoadingStudents,
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
