import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Bookmark,
  Award,
  BookOpen,
  Edit2,
  Save,
  LogOut,
  Target,
  Sparkles,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';

export const StudentProfileModal: React.FC = () => {
  const {
    currentStudent,
    isProfileModalOpen,
    closeProfileModal,
    logoutStudent,
    updateStudentProfile,
    subjects,
    chapters,
    questions,
    progress,
    bookmarks,
    getSubjectChapters,
    studentActivities,
  } = useStudy();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentStudent?.full_name || '');
  const [targetBoard, setTargetBoard] = useState(currentStudent?.target_board || 'CBSE Class 12');

  React.useEffect(() => {
    if (currentStudent) {
      setFullName(currentStudent.full_name);
      setTargetBoard(currentStudent.target_board || 'CBSE Class 12');
    }
  }, [currentStudent, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentStudent) return null;

  const handleSave = async () => {
    if (!fullName.trim()) return;
    await updateStudentProfile({
      full_name: fullName.trim(),
      target_board: targetBoard,
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logoutStudent();
    closeProfileModal();
  };

  // Calculate student subject stats
  const publishedQuestions = questions.filter((q) => q.status === 'published');
  const studentCompletedIds = new Set(
    progress.filter((p) => p.user_id === currentStudent.id && p.is_completed).map((p) => p.question_id)
  );
  const totalCompleted = studentCompletedIds.size;
  const overallPercentage = publishedQuestions.length > 0
    ? Math.round((totalCompleted / publishedQuestions.length) * 100)
    : 0;

  const studentBookmarksCount = bookmarks.filter((b) => b.user_id === currentStudent.id).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 relative">
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30 shrink-0">
              {currentStudent.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student Account
                </span>
                <span className="text-[11px] text-slate-400">Class 12</span>
              </div>
              <h2 className="text-xl font-extrabold text-white truncate mt-0.5">
                {currentStudent.full_name}
              </h2>
              <p className="text-xs text-slate-300 truncate">{currentStudent.email}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
              <div className="flex items-center justify-center text-indigo-600 mb-1">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-indigo-950">{totalCompleted}</div>
              <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Solved Qs</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="flex items-center justify-center text-emerald-600 mb-1">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-emerald-950">{overallPercentage}%</div>
              <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Progress</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
              <div className="flex items-center justify-center text-amber-600 mb-1">
                <Bookmark className="w-5 h-5" />
              </div>
              <div className="text-xl font-black text-amber-950">{studentBookmarksCount}</div>
              <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Bookmarked</span>
            </div>
          </div>

          {/* Student Profile Info / Edit Form */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Profile Details</span>
              </span>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Target Board / Exam:</span>
                  <span className="font-semibold text-slate-800">{currentStudent.target_board || 'CBSE Class 12'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-400">Registered On:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(currentStudent.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Last Studied:</span>
                  <span className="font-semibold text-slate-800">
                    {currentStudent.last_studied_at
                      ? new Date(currentStudent.last_studied_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Not yet started'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Target Board
                  </label>
                  <input
                    type="text"
                    value={targetBoard}
                    onChange={(e) => setTargetBoard(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Subject-Wise Progress Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Subject-Wise Mastery</span>
            </h3>

            <div className="space-y-2.5">
              {subjects.map((sub) => {
                const subChapters = getSubjectChapters(sub.id).map((c) => c.id);
                const subQuestions = questions.filter(
                  (q) => subChapters.includes(q.chapter_id) && q.status === 'published'
                );
                const subCompleted = subQuestions.filter((q) => studentCompletedIds.has(q.id)).length;
                const subPct = subQuestions.length > 0 ? Math.round((subCompleted / subQuestions.length) * 100) : 0;

                return (
                  <div key={sub.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{sub.name}</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {subCompleted} / {subQuestions.length} ({subPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${subPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400">
            Encrypted with Supabase Auth
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
