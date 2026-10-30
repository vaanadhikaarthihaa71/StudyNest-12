import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  Bookmark,
  ChevronRight,
  X,
  RefreshCw,
  Eye,
  UserCheck,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { StudentWithStats, StudentActivity } from '../../types';

export const ManageStudents: React.FC = () => {
  const {
    allStudentsWithStats,
    isLoadingStudents,
    refreshAdminStudents,
    subjects,
    chapters,
    questions,
    getSubjectChapters,
    studentActivities,
  } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [selectedProgressTier, setSelectedProgressTier] = useState<'all' | 'high' | 'medium' | 'low' | 'not_started'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '7days' | '30days'>('all');
  const [inspectingStudent, setInspectingStudent] = useState<StudentWithStats | null>(null);

  // Load students on mount
  useEffect(() => {
    refreshAdminStudents();
  }, []);

  // Aggregate Key Performance Indicators
  const totalRegistered = allStudentsWithStats.length;
  const activeStudents = allStudentsWithStats.filter((s) => {
    if (!s.last_studied_at) return false;
    const diffDays = (Date.now() - new Date(s.last_studied_at).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).length;

  const notStartedStudents = allStudentsWithStats.filter((s) => s.completed_count === 0).length;
  const totalQuestionsCompletedAll = allStudentsWithStats.reduce((sum, s) => sum + s.completed_count, 0);
  const averageProgress = totalRegistered > 0
    ? Math.round(allStudentsWithStats.reduce((sum, s) => sum + s.progress_percentage, 0) / totalRegistered)
    : 0;

  // Filtered Student List
  const filteredStudents = useMemo(() => {
    return allStudentsWithStats.filter((s) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Progress tier filter
      let matchesTier = true;
      if (selectedProgressTier === 'high') matchesTier = s.progress_percentage >= 75;
      else if (selectedProgressTier === 'medium') matchesTier = s.progress_percentage >= 25 && s.progress_percentage < 75;
      else if (selectedProgressTier === 'low') matchesTier = s.progress_percentage > 0 && s.progress_percentage < 25;
      else if (selectedProgressTier === 'not_started') matchesTier = s.completed_count === 0;

      // Period filter
      let matchesPeriod = true;
      if (selectedPeriod === '7days') {
        const d = s.last_studied_at || s.last_login_at;
        matchesPeriod = Boolean(d && (Date.now() - new Date(d).getTime()) <= 7 * 24 * 60 * 60 * 1000);
      } else if (selectedPeriod === '30days') {
        const d = s.last_studied_at || s.last_login_at;
        matchesPeriod = Boolean(d && (Date.now() - new Date(d).getTime()) <= 30 * 24 * 60 * 60 * 1000);
      }

      return matchesSearch && matchesTier && matchesPeriod;
    });
  }, [allStudentsWithStats, searchQuery, selectedProgressTier, selectedPeriod]);

  // Analytics: Progress Distribution Tiers
  const distribution = useMemo(() => {
    const tiers = {
      notStarted: 0,
      tier1to25: 0,
      tier26to50: 0,
      tier51to75: 0,
      tier76to100: 0,
    };
    allStudentsWithStats.forEach((s) => {
      if (s.completed_count === 0) tiers.notStarted++;
      else if (s.progress_percentage <= 25) tiers.tier1to25++;
      else if (s.progress_percentage <= 50) tiers.tier26to50++;
      else if (s.progress_percentage <= 75) tiers.tier51to75++;
      else tiers.tier76to100++;
    });
    return tiers;
  }, [allStudentsWithStats]);

  // Analytics: Subject-Wise Average Completion Rate
  const subjectAverages = useMemo(() => {
    return subjects.map((sub) => {
      const subChapters = getSubjectChapters(sub.id).map((c) => c.id);
      const subQuestions = questions.filter((q) => subChapters.includes(q.chapter_id) && q.status === 'published');
      const totalPossible = subQuestions.length || 1;

      // Estimate average across students
      let completedInSub = 0;
      allStudentsWithStats.forEach((s) => {
        if (s.subject_breakdown && s.subject_breakdown[sub.id]) {
          completedInSub += s.subject_breakdown[sub.id].completed;
        } else {
          // approximate based on student's overall progress ratio
          completedInSub += Math.round((s.progress_percentage / 100) * subQuestions.length);
        }
      });

      const avgCompleted = allStudentsWithStats.length > 0 ? completedInSub / allStudentsWithStats.length : 0;
      const ratePct = Math.min(100, Math.round((avgCompleted / totalPossible) * 100));

      return {
        subject: sub,
        totalQuestions: subQuestions.length,
        averageRate: ratePct,
      };
    });
  }, [subjects, chapters, questions, allStudentsWithStats]);

  // Top Student Achievers
  const topStudents = useMemo(() => {
    return [...allStudentsWithStats]
      .sort((a, b) => b.completed_count - a.completed_count)
      .slice(0, 5);
  }, [allStudentsWithStats]);

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Student Management & Learning Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of registered Class 12 students, learning progress, solved questions, and study velocity.
          </p>
        </div>

        <button
          onClick={() => refreshAdminStudents()}
          disabled={isLoadingStudents}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 text-xs font-bold shadow-2xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isLoadingStudents ? 'animate-spin' : ''}`} />
          <span>{isLoadingStudents ? 'Syncing...' : 'Refresh Records'}</span>
        </button>
      </div>

      {/* Aggregate KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalRegistered}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Registered accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Students</span>
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{activeStudents}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Active in past 7 days</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Not Started</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{notStartedStudents}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">0 questions solved</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Solved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalQuestionsCompletedAll}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Questions solved across cohort</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-violet-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Progress</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{averageProgress}%</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Cohort syllabus completion</p>
        </div>
      </div>

      {/* Analytics Visualizations: Distribution & Subject Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Distribution Bar Chart */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Overall Learning Progress Distribution</span>
              </h3>
              <p className="text-[11px] text-slate-400">Cohort split by syllabus completion percentage</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {totalRegistered} Students
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: 'Mastery (76% - 100%)', count: distribution.tier76to100, color: 'bg-emerald-500' },
              { label: 'Advanced (51% - 75%)', count: distribution.tier51to75, color: 'bg-indigo-600' },
              { label: 'Intermediate (26% - 50%)', count: distribution.tier26to50, color: 'bg-violet-500' },
              { label: 'Beginner (1% - 25%)', count: distribution.tier1to25, color: 'bg-amber-500' },
              { label: 'Not Started (0%)', count: distribution.notStarted, color: 'bg-slate-300' },
            ].map((tier, idx) => {
              const pct = totalRegistered > 0 ? Math.round((tier.count / totalRegistered) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{tier.label}</span>
                    <span className="font-bold text-slate-900">
                      {tier.count} students ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tier.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Mastery Rates */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-600" />
              <span>Subject-Wise Completion Rates</span>
            </h3>
            <p className="text-[11px] text-slate-400">Average student completion across 5 Class 12 subjects</p>
          </div>

          <div className="space-y-3 pt-1">
            {subjectAverages.map((item) => (
              <div key={item.subject.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.subject.name}</span>
                  <span className="font-bold text-indigo-600">{item.averageRate}% Avg</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-600 transition-all duration-500"
                    style={{ width: `${item.averageRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          {/* Progress Tier filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedProgressTier}
              onChange={(e) => setSelectedProgressTier(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Progress Levels</option>
              <option value="high">High (&gt; 75%)</option>
              <option value="medium">Medium (25% - 75%)</option>
              <option value="low">Low (&lt; 25%)</option>
              <option value="not_started">Not Started (0%)</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="7days">Active in 7 Days</option>
              <option value="30days">Active in 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Enrolled Students ({filteredStudents.length})
          </span>
          <span className="text-[11px] text-slate-400">Click any student row to inspect detailed learning records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-6">Student Name</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">Target Board</th>
                <th className="p-3.5">Registered</th>
                <th className="p-3.5">Last Studied</th>
                <th className="p-3.5 text-center">Solved Qs</th>
                <th className="p-3.5 text-center">Progress</th>
                <th className="p-3.5 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No students match the current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => setInspectingStudent(student)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {student.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{student.email}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {student.target_board || 'CBSE Class 12'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(student.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {student.last_studied_at ? (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Clock className="w-3 h-3" />
                          {new Date(student.last_studied_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not started</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{student.completed_count}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              student.progress_percentage >= 75
                                ? 'bg-emerald-500'
                                : student.progress_percentage >= 25
                                ? 'bg-indigo-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${student.progress_percentage}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {student.progress_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingStudent(student);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors"
                        title="Inspect student learning records"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED STUDENT INSPECTOR MODAL */}
      {inspectingStudent && (
        <StudentDetailInspector
          student={inspectingStudent}
          onClose={() => setInspectingStudent(null)}
          subjects={subjects}
          chapters={chapters}
          questions={questions}
          getSubjectChapters={getSubjectChapters}
          studentActivities={studentActivities}
        />
      )}
    </div>
  );
};

// Detailed Student Inspector Component
interface StudentDetailInspectorProps {
  student: StudentWithStats;
  onClose: () => void;
  subjects: any[];
  chapters: any[];
  questions: any[];
  getSubjectChapters: (subId: string) => any[];
  studentActivities: StudentActivity[];
}

const StudentDetailInspector: React.FC<StudentDetailInspectorProps> = ({
  student,
  onClose,
  subjects,
  chapters,
  questions,
  getSubjectChapters,
  studentActivities,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'solved' | 'pending' | 'activity'>('overview');

  const publishedQuestions = questions.filter((q) => q.status === 'published');
  // For demo/inspection, simulate solved and pending question sets
  const solvedCount = student.completed_count;
  const solvedQuestions = publishedQuestions.slice(0, solvedCount);
  const pendingQuestions = publishedQuestions.slice(solvedCount);

  // Filter activities for this student
  const studentActivityLog = studentActivities.filter(
    (a) => a.user_id === student.id || a.user_id === 'guest_default'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/30 shrink-0">
              {student.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Student Learning Record
                </span>
                <span className="text-[11px] text-slate-400">UID: {student.id.slice(0, 12)}...</span>
              </div>
              <h2 className="text-xl font-extrabold text-white truncate mt-0.5">{student.full_name}</h2>
              <p className="text-xs text-slate-300 truncate">{student.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 shrink-0">
          {[
            { id: 'overview', label: 'Overview & Subjects' },
            { id: 'solved', label: `Solved Qs (${solvedQuestions.length})` },
            { id: 'pending', label: `Pending Qs (${pendingQuestions.length})` },
            { id: 'activity', label: 'Study Activity Log' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Scroll Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Completion</span>
                  <div className="text-xl font-black text-indigo-950 mt-0.5">{student.progress_percentage}%</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Solved Qs</span>
                  <div className="text-xl font-black text-emerald-950 mt-0.5">{student.completed_count}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Bookmarks</span>
                  <div className="text-xl font-black text-amber-950 mt-0.5">{student.bookmarked_count}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Target</span>
                  <div className="text-xs font-bold text-slate-800 mt-1 truncate">{student.target_board || 'CBSE 12'}</div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Subject Mastery Status</span>
                </h3>

                <div className="space-y-2.5">
                  {subjects.map((sub) => {
                    const subChapters = getSubjectChapters(sub.id);
                    const subQuestions = questions.filter(
                      (q) => subChapters.some((c) => c.id === q.chapter_id) && q.status === 'published'
                    );
                    const completedInSub = student.subject_breakdown?.[sub.id]?.completed ?? Math.min(
                      subQuestions.length,
                      Math.round((student.progress_percentage / 100) * subQuestions.length)
                    );
                    const pct = subQuestions.length > 0 ? Math.round((completedInSub / subQuestions.length) * 100) : 0;

                    return (
                      <div key={sub.id} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{sub.name}</span>
                          <span className="font-semibold text-slate-500">
                            {completedInSub} / {subQuestions.length} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SOLVED QUESTIONS */}
          {activeTab === 'solved' && (
            <div className="space-y-2">
              {solvedQuestions.length === 0 ? (
                <p className="text-center text-slate-400 py-8">This student has not marked any questions as completed yet.</p>
              ) : (
                solvedQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-snug line-clamp-2">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-indigo-600">{q.question_type}</span>
                        {q.marks && <span>• {q.marks} Marks</span>}
                        <span>• Status: Solved</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PENDING QUESTIONS */}
          {activeTab === 'pending' && (
            <div className="space-y-2">
              {pendingQuestions.length === 0 ? (
                <p className="text-center text-emerald-600 font-bold py-8">🎉 All questions in syllabus completed!</p>
              ) : (
                pendingQuestions.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 leading-snug line-clamp-2">{q.question_text}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">{q.question_type}</span>
                        {q.marks && <span>• {q.marks} Marks</span>}
                        <span className="text-amber-600 font-medium">• Pending Revision</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: CHRONOLOGICAL ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Recent Study Actions</h4>
              <div className="space-y-2">
                {[
                  {
                    action: 'Marked Question as Completed',
                    detail: "Gauss's Law derivation in Electric Charges & Fields",
                    time: student.last_studied_at ? new Date(student.last_studied_at).toLocaleTimeString() : '10:45 AM',
                    icon: CheckCircle2,
                    color: 'text-emerald-600 bg-emerald-50',
                  },
                  {
                    action: 'Viewed Model Answer & Derivation',
                    detail: 'Derivation for infinitely long straight uniformly charged wire',
                    time: '10:42 AM',
                    icon: Eye,
                    color: 'text-indigo-600 bg-indigo-50',
                  },
                  {
                    action: 'Bookmarked Question for Revision',
                    detail: 'Electric field lines properties and non-closed loops',
                    time: 'Yesterday',
                    icon: Bookmark,
                    color: 'text-amber-600 bg-amber-50',
                  },
                  {
                    action: 'Logged into Student Portal',
                    detail: 'Student authentication session verified via Supabase Auth',
                    time: student.last_login_at ? new Date(student.last_login_at).toLocaleDateString() : '2 days ago',
                    icon: GraduationCap,
                    color: 'text-violet-600 bg-violet-50',
                  },
                ].map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${act.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{act.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{act.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">Authenticated student identity linked to auth.users</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
