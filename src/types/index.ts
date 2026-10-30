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
  image_storage_path?: string;
  image_file_name?: string;
  image_file_size?: number;
  answer_image_url?: string;
  answer_image_caption?: string;
  answer_image_storage_path?: string;
  answer_image_file_name?: string;
  answer_image_file_size?: number;
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

export type StudentActivityType =
  | 'login'
  | 'view_question'
  | 'complete_question'
  | 'uncomplete_question'
  | 'bookmark'
  | 'unbookmark';

export interface StudentProfile {
  id: string; // Supabase auth UUID
  full_name: string;
  email: string;
  avatar_url?: string;
  target_board?: string; // e.g. 'CBSE Class 12'
  total_questions_completed: number;
  last_login_at?: string;
  last_studied_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface StudentActivity {
  id: string;
  user_id: string;
  activity_type: StudentActivityType;
  question_id?: string;
  chapter_id?: string;
  subject_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface StudentWithStats extends StudentProfile {
  completed_count: number;
  progress_percentage: number;
  bookmarked_count: number;
  subject_breakdown?: Record<string, { total: number; completed: number }>;
}

export interface StudentFilterOptions {
  searchQuery: string;
  subjectId: string;
  chapterId: string;
  progressFilter: 'all' | 'high' | 'medium' | 'low' | 'not_started';
  activityPeriod: 'all' | 'today' | '7days' | '30days';
}
