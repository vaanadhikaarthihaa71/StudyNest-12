import { Subject, Chapter, Question, Bookmark, StudyProgress, RecentActivity } from '../types';
import { INITIAL_SUBJECTS, INITIAL_CHAPTERS, INITIAL_QUESTIONS } from '../data/initialData';
import { getSupabaseClient, getStoredSupabaseConfig, saveStoredSupabaseConfig } from './supabase';

export { getStoredSupabaseConfig, saveStoredSupabaseConfig };

const STORAGE_KEYS = {
  SUBJECTS: 'studynest_subjects_v1',
  CHAPTERS: 'studynest_chapters_v1',
  QUESTIONS: 'studynest_questions_v1',
  BOOKMARKS: 'studynest_bookmarks_v1',
  PROGRESS: 'studynest_progress_v1',
  RECENT: 'studynest_recent_v1',
  USER_ID: 'studynest_user_id_v1',
  ADMIN_AUTH: 'studynest_admin_auth_v1',
};

// Ensure a stable user identity for bookmarks & progress tracking
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'guest_default';
  let userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (!userId) {
    userId = 'student_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }
  return userId;
}

// Initial storage bootstrap
export function getLocalSubjects(): Subject[] {
  if (typeof window === 'undefined') return INITIAL_SUBJECTS;
  const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (!raw) {
    saveLocalSubjects(INITIAL_SUBJECTS);
    return INITIAL_SUBJECTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBJECTS;
  }
}

export function saveLocalSubjects(subjects: Subject[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }
}

export function getLocalChapters(): Chapter[] {
  if (typeof window === 'undefined') return INITIAL_CHAPTERS;
  const raw = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
  if (!raw) {
    saveLocalChapters(INITIAL_CHAPTERS);
    return INITIAL_CHAPTERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_CHAPTERS;
  }
}

export function saveLocalChapters(chapters: Chapter[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
  }
}

export function getLocalQuestions(): Question[] {
  if (typeof window === 'undefined') return INITIAL_QUESTIONS;
  const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
  if (!raw) {
    saveLocalQuestions(INITIAL_QUESTIONS);
    return INITIAL_QUESTIONS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveLocalQuestions(questions: Question[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }
}

export function getLocalBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalBookmarks(bookmarks: Bookmark[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }
}

export function getLocalProgress(): StudyProgress[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalProgress(progress: StudyProgress[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  }
}

export function getLocalRecentActivity(): RecentActivity[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.RECENT);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalRecentActivity(recent: RecentActivity[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(recent.slice(0, 10)));
  }
}

export function resetAllDataToDefault() {
  saveLocalSubjects(INITIAL_SUBJECTS);
  saveLocalChapters(INITIAL_CHAPTERS);
  saveLocalQuestions(INITIAL_QUESTIONS);
  saveLocalBookmarks([]);
  saveLocalProgress([]);
  saveLocalRecentActivity([]);
}

// Student Profile Local Persistence
const STORAGE_KEY_STUDENT = 'studynest_current_student_v1';
const STORAGE_KEY_ACTIVITIES = 'studynest_student_activities_v1';

export function getLocalStudentProfile(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_STUDENT);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalStudentProfile(profile: any | null) {
  if (typeof window !== 'undefined') {
    if (profile) localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(profile));
    else localStorage.removeItem(STORAGE_KEY_STUDENT);
  }
}

export function getLocalStudentActivities(): any[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveLocalStudentActivity(activity: any) {
  if (typeof window !== 'undefined') {
    const list = getLocalStudentActivities();
    const updated = [activity, ...list].slice(0, 100);
    localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));
  }
}

// Admin Authentication State
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
}

export function setAdminAuthenticated(authenticated: boolean) {
  if (typeof window !== 'undefined') {
    if (authenticated) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  }
}

// Sync with Supabase (if configured)
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL or Anon Key is missing.' };
  }
  try {
    const { error } = await client.from('subjects').select('id').limit(1);
    if (error) {
      return { success: false, message: `Database query returned: ${error.message}` };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection test failed.' };
  }
}

export async function syncLocalToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Supabase not connected' };
  }
  try {
    const subjects = getLocalSubjects();
    const chapters = getLocalChapters();
    const questions = getLocalQuestions();

    // Upsert subjects
    if (subjects.length > 0) {
      const { error: sErr } = await client.from('subjects').upsert(subjects, { onConflict: 'id' });
      if (sErr) throw sErr;
    }

    // Upsert chapters
    if (chapters.length > 0) {
      const { error: cErr } = await client.from('chapters').upsert(chapters, { onConflict: 'id' });
      if (cErr) throw cErr;
    }

    // Upsert questions
    if (questions.length > 0) {
      const { error: qErr } = await client.from('questions').upsert(questions, { onConflict: 'id' });
      if (qErr) throw qErr;
    }

    return { success: true, count: subjects.length + chapters.length + questions.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'Failed syncing to Supabase' };
  }
}

// Student Cloud Operations
export async function logStudentActivityCloud(
  userId: string,
  activityType: string,
  questionId?: string,
  chapterId?: string,
  subjectId?: string,
  details?: Record<string, any>
) {
  const client = getSupabaseClient();
  const activity = {
    id: 'act-' + Math.random().toString(36).substring(2, 10),
    user_id: userId,
    activity_type: activityType,
    question_id: questionId || null,
    chapter_id: chapterId || null,
    subject_id: subjectId || null,
    details: details || {},
    created_at: new Date().toISOString(),
  };

  saveLocalStudentActivity(activity);

  if (client) {
    try {
      await client.from('student_activity').insert({
        user_id: userId,
        activity_type: activityType,
        question_id: questionId || null,
        chapter_id: chapterId || null,
        subject_id: subjectId || null,
        details: details || {},
      });
    } catch {
      // safe fallback
    }
  }
}
