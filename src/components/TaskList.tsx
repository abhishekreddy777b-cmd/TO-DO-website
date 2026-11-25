import { ClipboardList, SearchX } from 'lucide-react';
import type { Task, TaskCategoryFilter, TaskStatusFilter } from '../types/task';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  totalTaskCount: number;
  isLoading?: boolean;
  categoryFilter: TaskCategoryFilter;
  statusFilter: TaskStatusFilter;
  searchQuery: string;
  onToggleTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onClearFilters: () => void;
  onFocusAddTask: () => void;
}

export function TaskList({
  tasks,
  totalTaskCount,
  isLoading = false,
  categoryFilter,
  statusFilter,
  searchQuery,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onClearFilters,
  onFocusAddTask,
}: TaskListProps) {
  const hasActiveFilters =
    categoryFilter !== 'All' ||
    statusFilter !== 'all' ||
    searchQuery.trim().length > 0;

  const headingLabel =
    categoryFilter === 'All' ? 'Task List' : `${categoryFilter} Tasks`;

  return (
    <section
      aria-labelledby="task-list-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="px-4 py-3.5 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2.5 min-w-0">
          <h2
            id="task-list-heading"
            className="font-display text-base font-semibold text-slate-900 truncate"
          >
            {headingLabel}
          </h2>
          <span className="font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0">
            {isLoading
              ? 'Loading...'
              : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150 whitespace-nowrap shrink-0"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading ? (
        <ul
          aria-label="Loading tasks"
          className="divide-y divide-slate-100"
        >
          {[0, 1, 2].map((index) => (
            <li
              key={index}
              className="px-4 py-4 sm:px-6 flex items-start gap-3.5 animate-pulse"
            >
              <div className="mt-1 h-5 w-5 rounded-md bg-slate-200 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <div className="h-4 w-2/5 rounded bg-slate-200" />
                <div className="h-3.5 w-4/5 rounded bg-slate-100" />
                <div className="h-3 w-1/3 rounded bg-slate-100" />
              </div>
            </li>
          ))}
        </ul>
      ) : tasks.length === 0 ? (
        <div className="px-6 py-14 text-center">
          {totalTaskCount === 0 ? (
            <>
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                Your task list is empty
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Add your first task using the form to start tracking your daily
                Personal, College, and Work priorities.
              </p>
              <button
                type="button"
                onClick={onFocusAddTask}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors duration-150"
              >
                Create your first task
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <SearchX className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900">
                No matching tasks found
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Try adjusting your search term, status filter, or selected
                category.
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-150"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100" data-testid="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
