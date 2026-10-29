import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  Share2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Video,
  FileCheck,
  Printer,
  Copy,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { AudioPlayer } from '../media/AudioPlayer';
import { VideoPlayer } from '../media/VideoPlayer';

interface QuestionStudyPageProps {
  subjectId: string;
  chapterId: string;
  questionId: string;
  onNavigate: (view: string, params?: Record<string, string>) => void;
}

export const QuestionStudyPage: React.FC<QuestionStudyPageProps> = ({
  subjectId,
  chapterId,
  questionId,
  onNavigate,
}) => {
  const {
    subjects,
    chapters,
    questions,
    getChapterQuestions,
    isBookmarked,
    toggleBookmark,
    isCompleted,
    toggleCompleted,
    recordQuestionView,
    showToast,
  } = useStudy();

  const [activeMediaTab, setActiveMediaTab] = useState<'both' | 'audio' | 'video'>('both');

  const subject = subjects.find((s) => s.id === subjectId);
  const chapter = chapters.find((c) => c.id === chapterId);
  const question = questions.find((q) => q.id === questionId);

  // Chapter's published questions for previous / next navigation
  const chapterQuestions = chapter ? getChapterQuestions(chapter.id, true) : [];
  const currentIndex = chapterQuestions.findIndex((q) => q.id === questionId);
  const prevQuestion = currentIndex > 0 ? chapterQuestions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex < chapterQuestions.length - 1 ? chapterQuestions[currentIndex + 1] : null;

  // Track recent study view
  useEffect(() => {
    if (question && chapter && subject) {
      recordQuestionView(question.id, chapter.id, subject.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [questionId, chapterId, subjectId]);

  if (!subject || !chapter || !question) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Question Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested question could not be located in this chapter.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const bookmarked = isBookmarked(question.id);
  const completed = isCompleted(question.id);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `StudyNest 12 - ${subject.name}: ${chapter.title}`,
      text: question.question_text,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
        return;
      } catch {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Question link copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy link automatically.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb Navigation & Back Button */}
      <Breadcrumbs
        items={[
          { label: 'Home', onClick: () => onNavigate('home') },
          { label: subject.name, onClick: () => onNavigate('subject', { subjectId: subject.id }) },
          {
            label: `Ch ${chapter.chapter_number}`,
            onClick: () =>
              onNavigate('chapter', { subjectId: subject.id, chapterId: chapter.id }),
          },
          { label: `Q${currentIndex >= 0 ? currentIndex + 1 : ''}`, active: true },
        ]}
        onBack={() => onNavigate('chapter', { subjectId: subject.id, chapterId: chapter.id })}
        backLabel={`Back to ${chapter.title}`}
      />

      {/* Main Study Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question, Answer & Study Actions (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question Card */}
          <div
            className={`p-6 sm:p-8 rounded-3xl bg-white border shadow-xs transition-colors ${
              completed ? 'border-emerald-200 ring-2 ring-emerald-500/10' : 'border-slate-200/90'
            }`}
          >
            {/* Top metadata tags & Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  Question {currentIndex >= 0 ? currentIndex + 1 : ''} of {chapterQuestions.length}
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    question.question_type === 'Long Answer'
                      ? 'bg-violet-50 text-violet-700 border border-violet-100'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  {question.question_type}
                </span>

                {question.marks && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                    {question.marks} Marks
                  </span>
                )}
              </div>

              {/* Study Action Bar */}
              <div className="flex items-center gap-2">
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  title="Print question & answer"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer no-print"
                  aria-label="Print study sheet"
                >
                  <Printer className="w-4 h-4" />
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  title="Share question link"
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer no-print"
                  aria-label="Share question"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Bookmark Toggle */}
                <button
                  onClick={() => toggleBookmark(question.id)}
                  title={bookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    bookmarked
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-600' : ''}`} />
                  <span>{bookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>

                {/* Mark as completed toggle */}
                <button
                  onClick={() => toggleCompleted(question.id)}
                  title={completed ? 'Mark incomplete' : 'Mark as solved'}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{completed ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="pt-5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {question.question_text}
              </h1>

              {/* Attached diagram or illustration if present */}
              {question.image_url && (
                <div className="my-5 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={question.image_url}
                    alt={question.image_caption || 'Question diagram'}
                    className="w-full max-h-96 object-contain p-2"
                  />
                  {question.image_caption && (
                    <p className="text-center text-xs text-slate-500 py-2 border-t border-slate-200 bg-white">
                      Figure: {question.image_caption}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Model Answer Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Official Model Answer & Solution</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Board Standard Solution</span>
            </div>

            {/* Render answer or empty state */}
            {question.answer_content && question.answer_content.trim() ? (
              <div className="pt-2">
                <MarkdownRenderer content={question.answer_content} />
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <FileCheck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">Answer not added yet</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  The model solution for this question is currently being prepared. You can add or edit it through the Admin Content Manager.
                </p>
              </div>
            )}
          </div>

          {/* Mobile Media Accordion / Preview (Visible on smaller screens below answer) */}
          <div className="lg:hidden space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-600" />
                <span>Audio Overview</span>
              </h3>
              <AudioPlayer
                audioUrl={question.audio_url}
                title={question.audio_title}
                description={question.audio_description}
                fileName={question.audio_file_name}
                fileSize={question.audio_file_size}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-600" />
                <span>Video Lesson</span>
              </h3>
              <VideoPlayer
                videoUrl={question.video_url}
                title={question.video_title}
                description={question.video_description}
                fileName={question.video_file_name}
                fileSize={question.video_file_size}
              />
            </div>
          </div>

          {/* Previous / Next Question Navigation Footer */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 no-print">
            {prevQuestion ? (
              <button
                onClick={() =>
                  onNavigate('question', {
                    subjectId: subject.id,
                    chapterId: chapter.id,
                    questionId: prevQuestion.id,
                  })
                }
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Previous</span>
                  <p className="text-xs font-semibold text-slate-700 truncate max-w-[150px]">
                    {prevQuestion.question_text}
                  </p>
                </div>
                <span className="sm:hidden text-xs font-semibold text-slate-700">Prev</span>
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={() =>
                onNavigate('chapter', {
                  subjectId: subject.id,
                  chapterId: chapter.id,
                })
              }
              className="text-xs font-bold text-indigo-600 hover:underline px-2 py-1"
            >
              Chapter Questions ({currentIndex + 1}/{chapterQuestions.length})
            </button>

            {nextQuestion ? (
              <button
                onClick={() =>
                  onNavigate('question', {
                    subjectId: subject.id,
                    chapterId: chapter.id,
                    questionId: nextQuestion.id,
                  })
                }
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-right cursor-pointer"
              >
                <div className="hidden sm:block">
                  <span className="text-[10px] font-bold uppercase text-indigo-200">Next</span>
                  <p className="text-xs font-semibold truncate max-w-[150px]">
                    {nextQuestion.question_text}
                  </p>
                </div>
                <span className="sm:hidden text-xs font-semibold">Next</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                onClick={() =>
                  onNavigate('chapter', {
                    subjectId: subject.id,
                    chapterId: chapter.id,
                  })
                }
                className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Chapter Complete!
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Audio Overview & Video Lesson (Desktop Sticky Sidebar lg:col-span-4) */}
        <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24">
          {/* Audio Overview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                <span>Audio Walkthrough</span>
              </h3>
            </div>
            <AudioPlayer
              audioUrl={question.audio_url}
              title={question.audio_title}
              description={question.audio_description}
              fileName={question.audio_file_name}
              fileSize={question.audio_file_size}
            />
          </div>

          {/* Video Lesson Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-600" />
                <span>Video Lesson</span>
              </h3>
            </div>
            <VideoPlayer
              videoUrl={question.video_url}
              title={question.video_title}
              description={question.video_description}
              fileName={question.video_file_name}
              fileSize={question.video_file_size}
            />
          </div>

          {/* Quick study tips widget */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Board Exam Writing Strategy</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
              <li>State all underlying laws and definitions clearly first.</li>
              <li>Underline key numerical values, units, and final formulas.</li>
              <li>Draw labeled schematics or graphs in pencil.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
