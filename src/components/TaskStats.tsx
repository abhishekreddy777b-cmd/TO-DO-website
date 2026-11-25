import type { TaskStatsSummary } from '../types/task';

interface TaskStatsProps {
  stats: TaskStatsSummary;
}

export function TaskStats({ stats }: TaskStatsProps) {
  return (
    <section
      aria-label="Task summary"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="grid grid-cols-3 divide-x divide-slate-200">
        <div className="px-4 py-4 sm:px-6 sm:py-5" data-testid="stat-total">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Total Tasks
          </p>
          <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-slate-900 tabular-nums">
            {stats.total}
          </p>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5" data-testid="stat-pending">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Pending
          </p>
          <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-blue-600 tabular-nums">
            {stats.pending}
          </p>
        </div>

        <div className="px-4 py-4 sm:px-6 sm:py-5" data-testid="stat-completed">
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Completed
          </p>
          <p className="mt-1 font-mono text-2xl sm:text-3xl font-semibold text-emerald-700 tabular-nums">
            {stats.completed}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 sm:px-6 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between gap-4">
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-[width] duration-200 ease-out"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <span className="font-mono text-xs font-medium text-slate-600 tabular-nums whitespace-nowrap shrink-0">
          {stats.completionRate}% done
        </span>
      </div>
    </section>
  );
}
