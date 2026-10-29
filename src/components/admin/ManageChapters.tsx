import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, HelpCircle, X, ArrowUpDown } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Chapter } from '../../types';

export const ManageChapters: React.FC = () => {
  const {
    subjects,
    chapters,
    addChapter,
    updateChapter,
    deleteChapter,
    getSubjectChapters,
    getChapterQuestions,
  } = useStudy();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects[0]?.id || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [chapterNumber, setChapterNumber] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [formError, setFormError] = useState('');

  const currentSubjectChapters = getSubjectChapters(selectedSubjectId);

  const openNewForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setChapterNumber(currentSubjectChapters.length + 1);
    setTitle('');
    setDescription('');
    setDisplayOrder(currentSubjectChapters.length + 1);
    setFormError('');
  };

  const openEditForm = (chap: Chapter) => {
    setIsEditing(true);
    setEditingId(chap.id);
    setSelectedSubjectId(chap.subject_id);
    setChapterNumber(chap.chapter_number);
    setTitle(chap.title);
    setDescription(chap.description || '');
    setDisplayOrder(chap.display_order);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Chapter title is required');
      return;
    }
    if (!selectedSubjectId) {
      setFormError('Please select a valid subject');
      return;
    }

    if (editingId) {
      updateChapter(editingId, {
        subject_id: selectedSubjectId,
        chapter_number: Number(chapterNumber),
        title: title.trim(),
        description: description.trim(),
        display_order: Number(displayOrder),
      });
    } else {
      addChapter({
        subject_id: selectedSubjectId,
        chapter_number: Number(chapterNumber),
        title: title.trim(),
        description: description.trim(),
        display_order: Number(displayOrder),
      });
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteChapter(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Chapters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add unlimited chapters to any subject. Reorder, edit, and organize question syllabus.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Chapter</span>
          </button>
        )}
      </div>

      {/* Subject Filter Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-slate-700">Filter by Subject:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {subjects.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                setIsEditing(false);
              }}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedSubjectId === sub.id
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Form Modal or Card */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-white border-2 border-violet-200 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Chapter' : 'Add New Chapter'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Parent Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chapter Number *
              </label>
              <input
                type="number"
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chapter Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Electric Charges and Fields, Coordination Compounds"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chapter Description & Key Syllabus Topics
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of topics covered in this chapter..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              {editingId ? 'Save Chapter' : 'Create Chapter'}
            </button>
          </div>
        </form>
      )}

      {/* Chapters Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {currentSubjectChapters.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Layers className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No chapters found for this subject</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Chapter" to create chapter 1.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-4">Ch #</th>
                <th className="p-4">Title & Description</th>
                <th className="p-4">Questions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSubjectChapters.map((chap) => {
                const chapQuestions = getChapterQuestions(chap.id, false);
                const shortCount = chapQuestions.filter((q) => q.question_type === 'Short Answer').length;
                const longCount = chapQuestions.filter((q) => q.question_type === 'Long Answer').length;

                return (
                  <tr key={chap.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-violet-700">
                      Ch {chap.chapter_number}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 text-sm block">{chap.title}</span>
                      <span className="text-slate-400 line-clamp-1 max-w-md">
                        {chap.description}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">
                        {chapQuestions.length} Questions
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {shortCount} Short • {longCount} Long
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(chap)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                          title="Edit Chapter"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(chap.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Chapter"
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
            <h3 className="text-base font-bold text-slate-900">Confirm Chapter Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this chapter? All questions under this chapter will also be removed permanently.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
