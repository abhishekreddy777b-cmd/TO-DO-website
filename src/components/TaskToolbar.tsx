import { Search, X } from 'lucide-react';
import type { TaskCategoryFilter, TaskStatusFilter } from '../types/task';

interface TaskToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatusFilter;
  onStatusFilterChange: (status: TaskStatusFilter) => void;
  categoryFilter: TaskCategoryFilter;
  onCategoryFilterChange: (category: TaskCategoryFilter) => void;
}

const STATUS_OPTIONS: { label: string; value: TaskStatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
];

const CATEGORY_OPTIONS: { label: string; value: TaskCategoryFilter }[] = [
  { label: 'All', value: 'All' },
  { label: 'Personal', value: 'Personal' },
  { label: 'College', value: 'College' },
  { label: 'Work', value: 'Work' },
];

export function TaskToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}: TaskToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="search-tasks"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks by title or description..."
            aria-label="Search tasks"
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-600 transition-colors duration-150"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors duration-150"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Status Filter Segmented Control */}
        <div
          role="group"
          aria-label="Filter tasks by status"
          className="inline-flex items-center p-1 bg-slate-100 rounded-lg self-start sm:self-auto shrink-0"
        >
          {STATUS_OPTIONS.map((option) => {
            const isActive = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onStatusFilterChange(option.value)}
                aria-pressed={isActive}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter for Mobile & Small Tablets (Desktop uses Top Navbar) */}
      <div
        role="group"
        aria-label="Filter tasks by category"
        className="flex md:hidden items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto"
      >
        {CATEGORY_OPTIONS.map((option) => {
          const isActive = categoryFilter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onCategoryFilterChange(option.value)}
              aria-pressed={isActive}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
