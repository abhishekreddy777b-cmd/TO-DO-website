import { useEffect, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskCategory, TaskFormData } from '../types/task';
import { TASK_CATEGORIES, validateTaskInput } from '../utils/taskLogic';

interface EditTaskModalProps {
  task: Task | null;
  onSave: (taskId: string, updatedData: TaskFormData) => void;
  onClose: () => void;
}

export function EditTaskModal({ task, onSave, onClose }: EditTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'Personal',
    dueDate: '',
  });
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!task) {
      return;
    }

    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.dueDate,
    });
    setErrors({});

    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [task, onClose]);

  if (!task) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateTaskInput(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      if (validation.errors.title) {
        titleInputRef.current?.focus();
      }
      return;
    }

    onSave(task.id, validation.sanitized);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-task-heading"
        className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <h2
            id="edit-task-heading"
            className="font-display text-lg font-semibold text-slate-900"
          >
            Edit Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-150"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-4">
          <div>
            <label
              htmlFor="edit-task-title"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Task Title <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="edit-task-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, title: event.target.value }));
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              maxLength={120}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'edit-task-title-error' : undefined}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 transition-colors duration-150 ${
                errors.title
                  ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                  : 'border-slate-300 bg-white hover:border-slate-400 focus:border-blue-600'
              }`}
            />
            {errors.title && (
              <p
                id="edit-task-title-error"
                role="alert"
                className="mt-1.5 text-xs font-medium text-red-600"
              >
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-task-description"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Description
            </label>
            <textarea
              id="edit-task-description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, description: event.target.value }));
                if (errors.description) {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                }
              }}
              maxLength={500}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 hover:border-slate-400 focus:border-blue-600 transition-colors duration-150 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-task-category"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Category
              </label>
              <select
                id="edit-task-category"
                name="category"
                value={formData.category}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: event.target.value as TaskCategory,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 hover:border-slate-400 focus:border-blue-600 transition-colors duration-150"
              >
                {TASK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="edit-task-due-date"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                Due Date
              </label>
              <input
                id="edit-task-due-date"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, dueDate: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono hover:border-slate-400 focus:border-blue-600 transition-colors duration-150"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150 whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 whitespace-nowrap"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
