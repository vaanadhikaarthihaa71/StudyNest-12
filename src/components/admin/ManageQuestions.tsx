import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  CheckCircle,
  HelpCircle,
  Headphones,
  Video,
  Image,
  X,
  Save,
  Search,
  Upload,
  RefreshCw,
  AlertCircle,
  FileAudio,
  FileVideo,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Question, QuestionType, QuestionStatus } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { AudioPlayer } from '../media/AudioPlayer';
import { VideoPlayer } from '../media/VideoPlayer';
import {
  validateAudioFile,
  validateVideoFile,
  uploadMediaFile,
  deleteMediaFile,
  formatFileSize,
} from '../../lib/mediaStorage';

interface FileUploadState {
  status: 'idle' | 'uploading' | 'completed' | 'error';
  progress: number;
  fileName?: string;
  fileSize?: number;
  errorMessage?: string;
  warningMessage?: string;
  lastFile?: File;
}

export const ManageQuestions: React.FC = () => {
  const {
    subjects,
    chapters,
    questions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    getSubjectChapters,
    showToast,
  } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const subjectChapters = getSubjectChapters(selectedSubjectId);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    subjectChapters[0]?.id || ''
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [fileDeleteTarget, setFileDeleteTarget] = useState<'audio' | 'video' | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // File Inputs Refs
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Upload Progress States
  const [audioUploadState, setAudioUploadState] = useState<FileUploadState>({
    status: 'idle',
    progress: 0,
  });
  const [videoUploadState, setVideoUploadState] = useState<FileUploadState>({
    status: 'idle',
    progress: 0,
  });

  // Form Fields
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('Short Answer');
  const [marks, setMarks] = useState<number | undefined>(2);
  const [answerContent, setAnswerContent] = useState('');

  // Audio state
  const [audioUrl, setAudioUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioDescription, setAudioDescription] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [audioFileSize, setAudioFileSize] = useState<number | undefined>(undefined);
  const [audioStoragePath, setAudioStoragePath] = useState('');

  // Video state
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoFileName, setVideoFileName] = useState('');
  const [videoFileSize, setVideoFileSize] = useState<number | undefined>(undefined);
  const [videoStoragePath, setVideoStoragePath] = useState('');

  // Diagram / Image
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');

  const [status, setStatus] = useState<QuestionStatus>('published');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [formError, setFormError] = useState('');

  // Update selectedChapterId when subject changes
  const handleSubjectChange = (newSubId: string) => {
    setSelectedSubjectId(newSubId);
    const newChaps = getSubjectChapters(newSubId);
    setSelectedChapterId(newChaps[0]?.id || '');
  };

  const resetUploadStates = () => {
    setAudioUploadState({ status: 'idle', progress: 0 });
    setVideoUploadState({ status: 'idle', progress: 0 });
    if (audioInputRef.current) audioInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const openNewForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setQuestionText('');
    setQuestionType('Short Answer');
    setMarks(2);
    setAnswerContent('');

    // Audio
    setAudioUrl('');
    setAudioTitle('');
    setAudioDescription('');
    setAudioFileName('');
    setAudioFileSize(undefined);
    setAudioStoragePath('');

    // Video
    setVideoUrl('');
    setVideoTitle('');
    setVideoDescription('');
    setVideoFileName('');
    setVideoFileSize(undefined);
    setVideoStoragePath('');

    // Diagram
    setImageUrl('');
    setImageCaption('');

    setStatus('published');
    const existing = questions.filter((q) => q.chapter_id === selectedChapterId);
    setDisplayOrder(existing.length + 1);
    setFormError('');
    resetUploadStates();
  };

  const openEditForm = (q: Question) => {
    setIsEditing(true);
    setEditingId(q.id);
    const parentChap = chapters.find((c) => c.id === q.chapter_id);
    if (parentChap) {
      setSelectedSubjectId(parentChap.subject_id);
      setSelectedChapterId(parentChap.id);
    }
    setQuestionText(q.question_text);
    setQuestionType(q.question_type);
    setMarks(q.marks);
    setAnswerContent(q.answer_content || '');

    // Audio
    setAudioUrl(q.audio_url || '');
    setAudioTitle(q.audio_title || '');
    setAudioDescription(q.audio_description || '');
    setAudioFileName(q.audio_file_name || (q.audio_url ? 'Attached Audio File' : ''));
    setAudioFileSize(q.audio_file_size);
    setAudioStoragePath(q.audio_storage_path || '');

    // Video
    setVideoUrl(q.video_url || '');
    setVideoTitle(q.video_title || '');
    setVideoDescription(q.video_description || '');
    setVideoFileName(q.video_file_name || (q.video_url ? 'Attached Video Lesson' : ''));
    setVideoFileSize(q.video_file_size);
    setVideoStoragePath(q.video_storage_path || '');

    setImageUrl(q.image_url || '');
    setImageCaption(q.image_caption || '');
    setStatus(q.status);
    setDisplayOrder(q.display_order);
    setFormError('');
    resetUploadStates();
  };

  // -------------------------------------------------------------
  // Direct Audio File Upload Handler
  // -------------------------------------------------------------
  const handleAudioFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      setAudioUploadState({
        status: 'error',
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        errorMessage: validation.error,
        lastFile: file,
      });
      return;
    }

    await performAudioUpload(file);
  };

  const performAudioUpload = async (file: File) => {
    setAudioUploadState({
      status: 'uploading',
      progress: 10,
      fileName: file.name,
      fileSize: file.size,
      lastFile: file,
    });

    try {
      const result = await uploadMediaFile(
        file,
        'audio',
        editingId || 'new',
        (prog) => {
          setAudioUploadState((prev) => ({ ...prev, progress: prog }));
        }
      );

      setAudioUrl(result.url);
      setAudioFileName(result.file_name);
      setAudioFileSize(result.file_size);
      setAudioStoragePath(result.storage_path);
      if (!audioTitle) {
        setAudioTitle(`Audio Overview: ${file.name.replace(/\.[^/.]+$/, '')}`);
      }

      setAudioUploadState({
        status: 'completed',
        progress: 100,
        fileName: result.file_name,
        fileSize: result.file_size,
      });
      showToast('Audio file uploaded and attached successfully!', 'success');
    } catch (err: any) {
      setAudioUploadState({
        status: 'error',
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        errorMessage: err.message || 'Failed to upload audio file. Please try again.',
        lastFile: file,
      });
    }
  };

  const handleRemoveAudio = async () => {
    if (audioStoragePath) {
      await deleteMediaFile('audio', audioStoragePath);
    }
    setAudioUrl('');
    setAudioFileName('');
    setAudioFileSize(undefined);
    setAudioStoragePath('');
    setAudioTitle('');
    setAudioDescription('');
    setAudioUploadState({ status: 'idle', progress: 0 });
    if (audioInputRef.current) audioInputRef.current.value = '';
    setFileDeleteTarget(null);
    showToast('Audio file removed from question', 'info');
  };

  // -------------------------------------------------------------
  // Direct Video File Upload Handler
  // -------------------------------------------------------------
  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      setVideoUploadState({
        status: 'error',
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        errorMessage: validation.error,
        warningMessage: validation.warning,
        lastFile: file,
      });
      return;
    }

    await performVideoUpload(file, validation.warning);
  };

  const performVideoUpload = async (file: File, warningMsg?: string) => {
    setVideoUploadState({
      status: 'uploading',
      progress: 10,
      fileName: file.name,
      fileSize: file.size,
      warningMessage: warningMsg,
      lastFile: file,
    });

    try {
      const result = await uploadMediaFile(
        file,
        'video',
        editingId || 'new',
        (prog) => {
          setVideoUploadState((prev) => ({ ...prev, progress: prog }));
        }
      );

      setVideoUrl(result.url);
      setVideoFileName(result.file_name);
      setVideoFileSize(result.file_size);
      setVideoStoragePath(result.storage_path);
      if (!videoTitle) {
        setVideoTitle(`Video Lesson: ${file.name.replace(/\.[^/.]+$/, '')}`);
      }

      setVideoUploadState({
        status: 'completed',
        progress: 100,
        fileName: result.file_name,
        fileSize: result.file_size,
        warningMessage: warningMsg,
      });
      showToast('Video lesson uploaded and attached successfully!', 'success');
    } catch (err: any) {
      setVideoUploadState({
        status: 'error',
        progress: 0,
        fileName: file.name,
        fileSize: file.size,
        errorMessage: err.message || 'Failed to upload video file. Please check size limits and try again.',
        warningMessage: warningMsg,
        lastFile: file,
      });
    }
  };

  const handleRemoveVideo = async () => {
    if (videoStoragePath) {
      await deleteMediaFile('video', videoStoragePath);
    }
    setVideoUrl('');
    setVideoFileName('');
    setVideoFileSize(undefined);
    setVideoStoragePath('');
    setVideoTitle('');
    setVideoDescription('');
    setVideoUploadState({ status: 'idle', progress: 0 });
    if (videoInputRef.current) videoInputRef.current.value = '';
    setFileDeleteTarget(null);
    showToast('Video file removed from question', 'info');
  };

  // -------------------------------------------------------------
  // Save Question
  // -------------------------------------------------------------
  const handleSave = (addAnother = false) => {
    if (!questionText.trim()) {
      setFormError('Question text is required');
      return;
    }
    if (!selectedChapterId) {
      setFormError('Please select a valid chapter');
      return;
    }

    const payload = {
      chapter_id: selectedChapterId,
      question_text: questionText.trim(),
      question_type: questionType,
      marks: marks ? Number(marks) : undefined,
      answer_content: answerContent.trim(),
      // Audio
      audio_url: audioUrl.trim() || undefined,
      audio_title: audioTitle.trim() || undefined,
      audio_description: audioDescription.trim() || undefined,
      audio_file_name: audioFileName.trim() || undefined,
      audio_file_size: audioFileSize,
      audio_storage_path: audioStoragePath.trim() || undefined,
      // Video
      video_url: videoUrl.trim() || undefined,
      video_title: videoTitle.trim() || undefined,
      video_description: videoDescription.trim() || undefined,
      video_file_name: videoFileName.trim() || undefined,
      video_file_size: videoFileSize,
      video_storage_path: videoStoragePath.trim() || undefined,
      // Image
      image_url: imageUrl.trim() || undefined,
      image_caption: imageCaption.trim() || undefined,
      status,
      display_order: Number(displayOrder),
    };

    if (editingId) {
      updateQuestion(editingId, payload);
    } else {
      addQuestion(payload);
    }

    if (addAnother) {
      // Clear fields, increment order, keep chapter and settings
      setQuestionText('');
      setAnswerContent('');
      setAudioUrl('');
      setAudioTitle('');
      setAudioDescription('');
      setAudioFileName('');
      setAudioFileSize(undefined);
      setAudioStoragePath('');
      setVideoUrl('');
      setVideoTitle('');
      setVideoDescription('');
      setVideoFileName('');
      setVideoFileSize(undefined);
      setVideoStoragePath('');
      setImageUrl('');
      setImageCaption('');
      setDisplayOrder((prev) => prev + 1);
      setEditingId(null);
      resetUploadStates();
      showToast('Question saved! Ready for next question.', 'success');
    } else {
      setIsEditing(false);
      setEditingId(null);
      resetUploadStates();
    }
  };

  const handleDeleteQuestionConfirm = async (id: string) => {
    const targetQ = questions.find((q) => q.id === id);
    if (targetQ) {
      // Clean up storage files safely
      if (targetQ.audio_storage_path) {
        await deleteMediaFile('audio', targetQ.audio_storage_path);
      }
      if (targetQ.video_storage_path) {
        await deleteMediaFile('video', targetQ.video_storage_path);
      }
    }
    deleteQuestion(id);
    setDeleteConfirmId(null);
  };

  const insertMarkdownSnippet = (snippet: string) => {
    setAnswerContent((prev) => prev + (prev.endsWith('\n') ? '' : '\n') + snippet);
  };

  // Filter current questions
  const currentChapterQuestions = questions
    .filter((q) => {
      if (selectedChapterId && q.chapter_id !== selectedChapterId) return false;
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        return (
          q.question_text.toLowerCase().includes(query) ||
          (q.answer_content && q.answer_content.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-6">
      {/* Hidden File Pickers */}
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/mpeg,audio/*,.mp3,.wav,.m4a,.aac,.ogg"
        onChange={handleAudioFileSelected}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/*,.mp4,.webm,.mov"
        onChange={handleVideoFileSelected}
        className="hidden"
        aria-hidden="true"
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Questions & Media</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add questions, model solutions, and directly upload audio walkthroughs and video lessons from your device.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => openNewForm()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Question</span>
          </button>
        )}
      </div>

      {/* Subject & Chapter Selectors */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-violet-600"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Chapter</label>
          <select
            value={selectedChapterId}
            onChange={(e) => setSelectedChapterId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-violet-600"
          >
            {subjectChapters.map((chap) => (
              <option key={chap.id} value={chap.id}>
                Ch {chap.chapter_number}: {chap.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Search in Chapter</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-violet-600"
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal or Card */}
      {isEditing && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-violet-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h3>
              <p className="text-xs text-slate-400">
                Model answers, equations, direct audio upload, and direct video file upload.
              </p>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {formError}
            </div>
          )}

          {/* Core Question Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Question Type *</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-violet-600"
              >
                <option value="Short Answer">Short Answer (1-3 Marks)</option>
                <option value="Long Answer">Long Answer (5 Marks)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marks</label>
              <input
                type="number"
                value={marks || ''}
                onChange={(e) => setMarks(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 2, 3, 5"
                min={1}
                max={15}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-violet-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuestionStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-hidden focus:border-violet-600"
              >
                <option value="published">Published (Visible to students)</option>
                <option value="draft">Draft (Work in progress)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Question Text *
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="State the law or problem statement clearly as asked in board examinations..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
              required
            />
          </div>

          {/* Rich Model Answer with quick markdown insertion toolbar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Model Answer & Solution</label>
              {/* Quick snippet tools */}
              <div className="flex items-center gap-1 text-[11px]">
                <span className="text-slate-400 mr-1 hidden sm:inline">Insert:</span>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('### Heading Title')}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => insertMarkdownSnippet('$$\\vec{E} = \\frac{\\lambda}{2\\pi \\varepsilon_0 r}$$')}
                  className="px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono cursor-pointer"
                >
                  $$ Math $$
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdownSnippet('```python\n# Python code snippet\ndef solve():\n    pass\n```')
                  }
                  className="px-2 py-0.5 rounded bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-mono cursor-pointer"
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() =>
                    insertMarkdownSnippet(
                      '| Feature | Detail |\n| :--- | :--- |\n| Property 1 | Value 1 |'
                    )
                  }
                  className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold cursor-pointer"
                >
                  Table
                </button>
              </div>
            </div>

            <textarea
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="Write the complete model answer. Supports headings (###), steps, math formulas ($$...$$), bullet points, and code blocks..."
              rows={8}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:border-violet-600"
            />
          </div>

          {/* ============================================================== */}
          {/* SECTION 1: DIRECT AUDIO FILE UPLOAD */}
          {/* ============================================================== */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Audio Overview (Direct File Upload)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Select an MP3, WAV, M4A, or AAC audio file from your device.
                  </p>
                </div>
              </div>

              {/* Upload or Replace Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={audioUploadState.status === 'uploading'}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{audioUrl ? 'Replace Audio File' : 'Upload Audio File'}</span>
                </button>

                {audioUrl && (
                  <button
                    type="button"
                    onClick={() => setFileDeleteTarget('audio')}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
                    title="Remove Audio File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Audio Upload Progress Bar */}
            {audioUploadState.status === 'uploading' && (
              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>Uploading "{audioUploadState.fileName}"...</span>
                  </span>
                  <span>{audioUploadState.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${audioUploadState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Audio Upload Error & Retry */}
            {audioUploadState.status === 'error' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-rose-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Upload Error: {audioUploadState.errorMessage}</span>
                  </span>
                  {audioUploadState.lastFile && (
                    <button
                      type="button"
                      onClick={() => performAudioUpload(audioUploadState.lastFile!)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Audio Preview Player */}
            {audioUrl ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Uploaded File: <span className="font-mono">{audioFileName || 'audio_lesson.mp3'}</span>
                    {audioFileSize ? ` (${formatFileSize(audioFileSize)})` : ''}
                  </span>
                </div>

                <AudioPlayer
                  audioUrl={audioUrl}
                  title={audioTitle}
                  description={audioDescription}
                  fileName={audioFileName}
                  fileSize={audioFileSize}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Audio Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      placeholder="e.g. 3-Minute Concept Overview"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Audio Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={audioDescription}
                      onChange={(e) => setAudioDescription(e.target.value)}
                      placeholder="e.g. Quick revision of formulas and step 2 derivation."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : audioUploadState.status !== 'uploading' && (
              <div
                onClick={() => audioInputRef.current?.click()}
                className="p-6 rounded-xl border border-dashed border-indigo-200 bg-white text-center hover:bg-indigo-50/30 transition-colors cursor-pointer group"
              >
                <FileAudio className="w-8 h-8 text-indigo-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-indigo-900">Click to choose an audio file from your computer</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports MP3, WAV, M4A, AAC (Max 50MB)</p>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: DIRECT VIDEO FILE UPLOAD */}
          {/* ============================================================== */}
          <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Video Lesson (Direct File Upload)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Select an MP4 or WebM video file directly from your computer.
                  </p>
                </div>
              </div>

              {/* Upload or Replace Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={videoUploadState.status === 'uploading'}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{videoUrl ? 'Replace Video File' : 'Upload Video File'}</span>
                </button>

                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => setFileDeleteTarget('video')}
                    className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-100/60 transition-colors cursor-pointer"
                    title="Remove Video File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Video Upload Progress Bar */}
            {videoUploadState.status === 'uploading' && (
              <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    <span>Uploading "{videoUploadState.fileName}"...</span>
                  </span>
                  <span>{videoUploadState.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${videoUploadState.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Video Warning (e.g. large file guidance) */}
            {videoUploadState.warningMessage && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{videoUploadState.warningMessage}</span>
              </div>
            )}

            {/* Video Upload Error & Retry */}
            {videoUploadState.status === 'error' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-rose-800 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Upload Error: {videoUploadState.errorMessage}</span>
                  </span>
                  {videoUploadState.lastFile && (
                    <button
                      type="button"
                      onClick={() => performVideoUpload(videoUploadState.lastFile!, videoUploadState.warningMessage)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Video Preview Player */}
            {videoUrl ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Uploaded File: <span className="font-mono">{videoFileName || 'video_lesson.mp4'}</span>
                    {videoFileSize ? ` (${formatFileSize(videoFileSize)})` : ''}
                  </span>
                </div>

                <VideoPlayer
                  videoUrl={videoUrl}
                  title={videoTitle}
                  description={videoDescription}
                  fileName={videoFileName}
                  fileSize={videoFileSize}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Video Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="e.g. Complete Video Derivation"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Video Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      placeholder="e.g. Detailed board derivation walkthrough with diagrams."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : videoUploadState.status !== 'uploading' && (
              <div
                onClick={() => videoInputRef.current?.click()}
                className="p-6 rounded-xl border border-dashed border-rose-200 bg-white text-center hover:bg-rose-50/30 transition-colors cursor-pointer group"
              >
                <FileVideo className="w-8 h-8 text-rose-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-rose-900">Click to choose a video file from your computer</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Supports MP4, WebM (Max 150MB)</p>
              </div>
            )}
          </div>

          {/* Diagram / Image Attachment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-emerald-600" />
              <span>Optional Diagram / Figure Attachment</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Diagram / Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Figure Caption
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="e.g. Gaussian cylindrical surface diagram"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setPreviewQuestion({
                  id: 'preview',
                  chapter_id: selectedChapterId,
                  question_text: questionText || 'Sample Question Text',
                  question_type: questionType,
                  marks,
                  answer_content: answerContent,
                  audio_url: audioUrl,
                  audio_title: audioTitle,
                  audio_file_name: audioFileName,
                  audio_file_size: audioFileSize,
                  video_url: videoUrl,
                  video_title: videoTitle,
                  video_file_name: videoFileName,
                  video_file_size: videoFileSize,
                  status,
                  display_order: displayOrder,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Answer</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>

              {!editingId && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  Save & Add Another
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingId ? 'Save Changes' : 'Publish Question'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student View Live Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                Student View Preview
              </span>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {previewQuestion.question_type}
                </span>
                {previewQuestion.marks && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                    {previewQuestion.marks} Marks
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{previewQuestion.question_text}</h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Model Answer
                </h4>
                <MarkdownRenderer content={previewQuestion.answer_content} />
              </div>

              {previewQuestion.audio_url && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Audio Overview
                  </h4>
                  <AudioPlayer
                    audioUrl={previewQuestion.audio_url}
                    title={previewQuestion.audio_title}
                    fileName={previewQuestion.audio_file_name}
                    fileSize={previewQuestion.audio_file_size}
                  />
                </div>
              )}

              {previewQuestion.video_url && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Video Lesson
                  </h4>
                  <VideoPlayer
                    videoUrl={previewQuestion.video_url}
                    title={previewQuestion.video_title}
                    fileName={previewQuestion.video_file_name}
                    fileSize={previewQuestion.video_file_size}
                  />
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Deletion Confirmation Modal */}
      {fileDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Remove {fileDeleteTarget === 'audio' ? 'Audio Overview' : 'Video Lesson'} File?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove the uploaded {fileDeleteTarget} file from this question? The file reference will be cleared from the database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setFileDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (fileDeleteTarget === 'audio') handleRemoveAudio();
                  if (fileDeleteTarget === 'video') handleRemoveVideo();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Remove File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Questions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {currentChapterQuestions.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No questions found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchFilter
                ? 'No questions matching search filter.'
                : 'Click "Add New Question" above to start populating this chapter.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">#</th>
                <th className="p-4">Question Text</th>
                <th className="p-4">Type & Marks</th>
                <th className="p-4">Model Answer</th>
                <th className="p-4">Audio File</th>
                <th className="p-4">Video File</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentChapterQuestions.map((q, idx) => {
                const hasAnswer = Boolean(q.answer_content && q.answer_content.trim());
                const hasAudio = Boolean(q.audio_url && q.audio_url.trim());
                const hasVideo = Boolean(q.video_url && q.video_url.trim());

                return (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{idx + 1}</td>
                    <td className="p-4 max-w-xs">
                      <span className="font-bold text-slate-900 block line-clamp-2">
                        {q.question_text}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700 block">{q.question_type}</span>
                      <span className="text-amber-700 text-[11px] font-bold">
                        {q.marks ? `${q.marks} Marks` : 'No Marks'}
                      </span>
                    </td>

                    {/* Answer Status */}
                    <td className="p-4">
                      {hasAnswer ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Added</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Missing</span>
                      )}
                    </td>

                    {/* Audio File Status */}
                    <td className="p-4">
                      {hasAudio ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Headphones className="w-3 h-3 text-indigo-600" />
                            <span>Uploaded</span>
                          </span>
                          {q.audio_file_name && (
                            <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                              {q.audio_file_name}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>

                    {/* Video File Status */}
                    <td className="p-4">
                      {hasVideo ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <Video className="w-3 h-3 text-rose-600" />
                            <span>Uploaded</span>
                          </span>
                          {q.video_file_name && (
                            <span className="block text-[10px] text-slate-500 font-mono truncate max-w-[120px]">
                              {q.video_file_name}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          q.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditForm(q)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                          title="Edit Question & Media"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => duplicateQuestion(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Duplicate Question"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(q.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this question? Any associated uploaded audio and video files will also be cleaned up.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuestionConfirm(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
