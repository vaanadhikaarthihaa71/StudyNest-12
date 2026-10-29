import React, { useState } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Layers, HelpCircle, Check, X } from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Subject } from '../../types';
import { AVAILABLE_ICONS, getSubjectIcon } from '../../lib/icons';

export const ManageSubjects: React.FC = () => {
  const { subjects, chapters, questions, addSubject, updateSubject, deleteSubject, getSubjectChapters, getSubjectQuestionCount } = useStudy();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Atom');
  const [colorTheme, setColorTheme] = useState('blue');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [formError, setFormError] = useState('');

  const openNewForm = () => {
    setIsEditing(true);
    setEditingId(null);
    setName('');
    setDescription('');
    setIcon('Atom');
    setColorTheme('blue');
    setDisplayOrder(subjects.length + 1);
    setFormError('');
  };

  const openEditForm = (sub: Subject) => {
    setIsEditing(true);
    setEditingId(sub.id);
    setName(sub.name);
    setDescription(sub.description);
    setIcon(sub.icon || 'Atom');
    setColorTheme(sub.color_theme || 'blue');
    setDisplayOrder(sub.display_order);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Subject name is required');
      return;
    }

    if (editingId) {
      updateSubject(editingId, {
        name: name.trim(),
        description: description.trim(),
        icon,
        color_theme: colorTheme,
        display_order: Number(displayOrder),
      });
    } else {
      addSubject({
        name: name.trim(),
        description: description.trim(),
        icon,
        color_theme: colorTheme,
        display_order: Number(displayOrder),
      });
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteSubject(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manage Subjects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add or edit syllabus subjects. You can add unlimited subjects to StudyNest 12.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal or Card */}
      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-white border-2 border-violet-200 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Subject' : 'Add New Subject'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Physics, Accountancy, Psychology"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Select Icon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
              >
                {AVAILABLE_ICONS.map((ic) => (
                  <option key={ic.name} value={ic.name}>
                    {ic.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Color Theme
              </label>
              <select
                value={colorTheme}
                onChange={(e) => setColorTheme(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-violet-600"
              >
                <option value="blue">Blue Accent (e.g. Physics)</option>
                <option value="violet">Violet Accent (e.g. Chemistry)</option>
                <option value="emerald">Emerald Accent (e.g. Biology)</option>
                <option value="amber">Amber Accent (e.g. Mathematics)</option>
                <option value="cyan">Cyan Accent (e.g. Computer Science)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subject Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the curriculum for Class 12 students..."
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
              {editingId ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      )}

      {/* Subjects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <th className="p-4">Order</th>
              <th className="p-4">Subject</th>
              <th className="p-4">Chapters</th>
              <th className="p-4">Questions</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects
              .sort((a, b) => a.display_order - b.display_order)
              .map((sub) => {
                const subChapters = getSubjectChapters(sub.id);
                const questionCount = getSubjectQuestionCount(sub.id);

                return (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{sub.display_order}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                          {getSubjectIcon(sub.icon, 'w-5 h-5')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{sub.name}</span>
                          <span className="text-slate-400 line-clamp-1 max-w-sm">
                            {sub.description}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700">{subChapters.length}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700">{questionCount}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(sub)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors cursor-pointer"
                          title="Edit Subject"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(sub.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Subject"
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Confirm Subject Deletion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this subject? Deleting a subject will also permanently remove all its chapters and attached questions.
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
                Yes, Delete Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
