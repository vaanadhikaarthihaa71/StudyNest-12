import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_URL = 'studynest_supabase_url';
const STORAGE_KEY_SUPABASE_KEY = 'studynest_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SUPABASE_KEY) || '' : '';

  const supabaseUrl = storedUrl || envUrl;
  const supabaseAnonKey = storedKey || envKey;

  const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://'));

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured,
  };
}

export function saveStoredSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);

    if (key) localStorage.setItem(STORAGE_KEY_SUPABASE_KEY, key.trim());
    else localStorage.removeItem(STORAGE_KEY_SUPABASE_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getStoredSupabaseConfig();
  if (!isConfigured) return null;

  if (!cachedClient) {
    try {
      cachedClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return cachedClient;
}

export function resetSupabaseClient() {
  cachedClient = null;
}

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- STUDYNEST 12: COMPLETE HARDENED SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor (SQL Editor -> New query)
-- ====================================================================

-- 1. Create Core Application Tables
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  target_board TEXT DEFAULT 'CBSE Class 12',
  total_questions_completed INTEGER NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  last_studied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Atom',
  color_theme TEXT NOT NULL DEFAULT 'blue',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('Short Answer', 'Long Answer')),
  marks INTEGER DEFAULT 3,
  answer_content TEXT NOT NULL,
  model_answer TEXT GENERATED ALWAYS AS (answer_content) STORED,
  explanation_points JSONB DEFAULT '[]'::jsonb,
  board_exam_tips JSONB DEFAULT '[]'::jsonb,
  important_keywords JSONB DEFAULT '[]'::jsonb,
  formula_box TEXT DEFAULT NULL,
  audio_url TEXT,
  audio_title TEXT,
  audio_description TEXT,
  audio_file_name TEXT,
  audio_file_size BIGINT,
  audio_storage_path TEXT,
  video_url TEXT,
  video_title TEXT,
  video_description TEXT,
  video_file_name TEXT,
  video_file_size BIGINT,
  video_storage_path TEXT,
  image_url TEXT,
  image_caption TEXT,
  image_file_name TEXT,
  image_file_size BIGINT,
  image_storage_path TEXT,
  answer_image_url TEXT,
  answer_image_caption TEXT,
  answer_image_file_name TEXT,
  answer_image_file_size BIGINT,
  answer_image_storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.study_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  is_completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  last_viewed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.student_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'view_question', 'complete_question', 'uncomplete_question', 'bookmark', 'unbookmark')),
  question_id TEXT REFERENCES public.questions(id) ON DELETE SET NULL,
  chapter_id TEXT REFERENCES public.chapters(id) ON DELETE SET NULL,
  subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON public.questions(status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.student_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.student_activity(created_at DESC);

-- 3. Hardened Security Definer Function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO v_role
  FROM public.admin_users
  WHERE user_id = auth.uid();

  RETURN (v_role IS NOT NULL AND v_role IN ('admin', 'superadmin'));
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activity ENABLE ROW LEVEL SECURITY;

-- 5. Safe Dynamic Policy Cleanup
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('subjects', 'chapters', 'questions', 'bookmarks', 'study_progress', 'admin_users', 'student_profiles', 'student_activity')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND (
        policyname ILIKE '%audio%' 
        OR policyname ILIKE '%video%' 
        OR policyname ILIKE '%asset%' 
        OR policyname ILIKE '%studynest%'
      )
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;

-- 6. Hardened RLS Policies: Admin Users
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Only admins can add admins"
  ON public.admin_users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 7. Hardened RLS Policies: Student Profiles
CREATE POLICY "Students view own profile or admins view all"
  ON public.student_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Students create own profile"
  ON public.student_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Students update own profile or admins update"
  ON public.student_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- 8. Hardened RLS Policies: Subjects & Chapters
CREATE POLICY "Read published subjects"
  ON public.subjects FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin insert subjects"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update subjects"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete subjects"
  ON public.subjects FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Read published chapters"
  ON public.chapters FOR SELECT
  USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin insert chapters"
  ON public.chapters FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update chapters"
  ON public.chapters FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete chapters"
  ON public.chapters FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 9. Hardened RLS Policies: Questions
CREATE POLICY "Read published questions"
  ON public.questions FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admin insert questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete questions"
  ON public.questions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 10. Hardened RLS Policies: Bookmarks
CREATE POLICY "Students read own bookmarks or admin view"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students insert own bookmarks"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students delete own bookmarks"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. Hardened RLS Policies: Study Progress
CREATE POLICY "Students read own progress or admin view"
  ON public.study_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students insert own progress"
  ON public.study_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students update own progress"
  ON public.study_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students delete own progress"
  ON public.study_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 12. Hardened RLS Policies: Student Activity
CREATE POLICY "Students read own activity or admin view"
  ON public.student_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Students insert own activity"
  ON public.student_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 13. Auto Create Student Profile Trigger on Supabase Auth Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_student()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = NEW.id) THEN
    INSERT INTO public.student_profiles (id, full_name, email, target_board, created_at, last_login_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'target_board', 'CBSE Class 12'),
      timezone('utc'::text, now()),
      timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      last_login_at = timezone('utc'::text, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student();

-- 14. Storage Buckets Creation
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('studynest-audio', 'studynest-audio', true),
  ('studynest-video', 'studynest-video', true),
  ('studynest-images', 'studynest-images', true),
  ('studynest-assets', 'studynest-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 15. Storage Policies: Public Read & Admin-Only Write/Delete
CREATE POLICY "Public stream educational media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-images', 'studynest-assets'));

CREATE POLICY "Admins upload educational media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-images', 'studynest-assets')
    AND public.is_admin()
  );

CREATE POLICY "Admins update educational media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-images', 'studynest-assets')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-images', 'studynest-assets')
    AND public.is_admin()
  );

CREATE POLICY "Admins delete educational media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-images', 'studynest-assets')
    AND public.is_admin()
  );
`;

