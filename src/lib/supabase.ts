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

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- STUDYNEST 12: COMPLETE SUPABASE SQL SCHEMA
-- Run this in Supabase SQL Editor (SQL Editor -> New query)
-- ==========================================

-- 1. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'Atom',
  color_theme TEXT DEFAULT 'blue',
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('Short Answer', 'Long Answer')),
  marks INTEGER,
  answer_content TEXT,
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
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 5. Create Study Progress Table
CREATE TABLE IF NOT EXISTS public.study_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter_id ON public.questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.study_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can read subjects & chapters
CREATE POLICY "Public subjects viewable by everyone" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Public chapters viewable by everyone" ON public.chapters FOR SELECT USING (true);

-- Students can read published questions only
CREATE POLICY "Published questions viewable by everyone" ON public.questions FOR SELECT USING (status = 'published');

-- Students can manage their own bookmarks
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE 'student_%');
CREATE POLICY "Users can insert their own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'student_%');
CREATE POLICY "Users can delete their own bookmarks" ON public.bookmarks FOR DELETE USING (auth.uid()::text = user_id OR user_id LIKE 'student_%');

-- Students can manage their own study progress
CREATE POLICY "Users can view their own study progress" ON public.study_progress FOR SELECT USING (auth.uid()::text = user_id OR user_id LIKE 'student_%');
CREATE POLICY "Users can insert their own study progress" ON public.study_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'student_%');
CREATE POLICY "Users can update their own study progress" ON public.study_progress FOR UPDATE USING (auth.uid()::text = user_id OR user_id LIKE 'student_%');

-- ==========================================
-- STORAGE BUCKETS FOR DIRECT AUDIO & VIDEO UPLOADS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('studynest-audio', 'studynest-audio', true),
  ('studynest-video', 'studynest-video', true),
  ('studynest-assets', 'studynest-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can read audio, video, and assets
CREATE POLICY "Public Audio Read Access" ON storage.objects
FOR SELECT USING (bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-assets'));

-- Admin upload policy (or authenticated users)
CREATE POLICY "Admin Media Upload Policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-assets'));

CREATE POLICY "Admin Media Delete Policy" ON storage.objects
FOR DELETE USING (bucket_id IN ('studynest-audio', 'studynest-video', 'studynest-assets'));
`;
