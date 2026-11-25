import { useState, type FormEvent, type RefObject } from 'react';
import { Plus } from 'lucide-react';
import type { TaskCategory, TaskFormData } from '../types/task';
import { TASK_CATEGORIES, validateTaskInput } from '../utils/taskLogic';

interface TaskFormProps {
  onAddTask: (data: TaskFormData) => void;
  titleInputRef: RefObject<HTMLInputElement | null>;
}

const INITIAL_FORM_STATE: TaskFormData = {
  title: '',
  description: '',
  category: 'Personal',
  dueDate: '',
};

export function TaskForm({ onAddTask, titleInputRef }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

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

    onAddTask(validation.sanitized);
    setFormData({
      title: '',
      description: '',
      category: formData.category,
      dueDate: '',
    });
    setErrors({});
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
  };

  const hasAnyInput =
    formData.title.length > 0 ||
    formData.description.length > 0 ||
    formData.dueDate.length > 0;

  return (
    <section
      aria-labelledby="add-task-heading"
      className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
    >
      <div className="mb-5">
        <h2
          id="add-task-heading"
          className="font-display text-lg font-semibold text-slate-900"
        >
          Add a New Task
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Organize your Personal, College, or Work tasks with optional deadlines.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="task-title"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Task Title <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            ref={titleInputRef}
            id="task-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, title: event.target.value }));
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="e.g. Finish React CRUD lab report"
            maxLength={120}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 ${
              errors.title
                ? 'border-red-500 bg-red-50/40 focus:border-red-600'
                : 'border-slate-300 bg-white hover:border-slate-400 focus:border-blue-600'
            }`}
          />
          {errors.title && (
            <p
              id="task-title-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Description
          </label>
          <textarea
            id="task-description"
            name="description"
            rows={2}
            value={formData.description}
            onChange={(event) => {
              setFormData((prev) => ({ ...prev, description: event.target.value }));
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            placeholder="Add notes, links, or key steps for this task..."
            maxLength={500}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={
              errors.description ? 'task-description-error' : undefined
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 transition-colors duration-150 resize-y"
          />
          {errors.description && (
            <p
              id="task-description-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="task-category"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Category
            </label>
            <select
              id="task-category"
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
              htmlFor="task-due-date"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Due Date
            </label>
            <input
              id="task-due-date"
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

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>

          {hasAnyInput && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
