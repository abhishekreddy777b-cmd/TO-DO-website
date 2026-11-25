import { Check, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types/task';
import { formatDueDateLabel, getDueDateState } from '../utils/taskLogic';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const dueState = getDueDateState(task.dueDate, task.completed);
  const dueLabel = formatDueDateLabel(task.dueDate, task.completed);

  const dueTextClass =
    dueState === 'overdue'
      ? 'text-red-600 font-medium'
      : dueState === 'today'
        ? 'text-amber-700 font-medium'
        : 'text-slate-500';

  const statusTextClass = task.completed
    ? 'text-emerald-700 font-medium'
    : 'text-slate-500';

  return (
    <li
      data-testid="task-item"
      className="px-4 py-4 sm:px-6 flex items-start gap-3.5 hover:bg-slate-50/80 transition-colors duration-150"
    >
      {/* Accessible completion toggle with comfortable touch target */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
        onClick={() => onToggle(task.id)}
        className="mt-0.5 -ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-blue-50 transition-colors duration-150"
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors duration-150 ${
            task.completed
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-300 bg-white hover:border-blue-500'
          }`}
        >
          {task.completed && (
            <Check className="h-3.5 w-3.5 stroke-[2.75]" aria-hidden="true" />
          )}
        </span>
      </button>

      {/* Task content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h3
              className={`font-display text-base font-semibold leading-snug break-words transition-colors duration-150 ${
                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p
                className={`mt-1 text-sm leading-relaxed break-words ${
                  task.completed ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Clean unboxed metadata row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="font-medium text-blue-700">{task.category}</span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className={`font-mono tabular-nums ${dueTextClass}`}>
                {dueLabel}
              </span>
              <span className="text-slate-300" aria-hidden="true">
                ·
              </span>
              <span className={statusTextClass}>
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit "${task.title}"`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete "${task.title}"`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
