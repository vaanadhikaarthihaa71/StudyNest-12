export type QuestionType = 'Short Answer' | 'Long Answer';

export type QuestionStatus = 'published' | 'draft';

export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  display_order: number;
  created_at: string;
  color_theme?: string; // e.g. 'blue', 'violet', 'emerald', 'amber', 'cyan'
}

export interface Chapter {
  id: string;
  subject_id: string;
  chapter_number: number;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface Question {
  id: string;
  chapter_id: string;
  question_text: string;
  question_type: QuestionType;
  marks?: number;
  answer_content: string;
  audio_url?: string;
  audio_title?: string;
  audio_description?: string;
  audio_file_name?: string;
  audio_file_size?: number;
  audio_storage_path?: string;
  video_url?: string;
  video_title?: string;
  video_description?: string;
  video_file_name?: string;
  video_file_size?: number;
  video_storage_path?: string;
  image_url?: string;
  image_caption?: string;
  status: QuestionStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MediaUploadProgress {
  status: 'idle' | 'uploading' | 'completed' | 'error';
  progress: number;
  fileName?: string;
  fileSize?: number;
  errorMessage?: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  question_id: string;
  is_completed: boolean;
  completed_at?: string;
  last_viewed_at?: string;
}

export interface RecentActivity {
  question_id: string;
  chapter_id: string;
  subject_id: string;
  viewed_at: string;
}

export interface SearchResult {
  type: 'subject' | 'chapter' | 'question';
  id: string;
  title: string;
  subtitle: string;
  subjectId?: string;
  chapterId?: string;
  questionType?: QuestionType;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
  isConfigured: boolean;
}
