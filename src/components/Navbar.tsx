import { LogIn, LogOut } from 'lucide-react';
import type { TaskCategoryFilter } from '../types/task';

interface NavbarProps {
  activeCategory: TaskCategoryFilter;
  onSelectCategory: (category: TaskCategoryFilter) => void;
  userLabel: string | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const NAV_CATEGORIES: { label: string; value: TaskCategoryFilter }[] = [
  { label: 'All Tasks', value: 'All' },
  { label: 'Personal', value: 'Personal' },
  { label: 'College', value: 'College' },
  { label: 'Work', value: 'Work' },
];

export function Navbar({
  activeCategory,
  onSelectCategory,
  userLabel,
  authLoading,
  onSignIn,
  onSignOut,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            onSelectCategory('All');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors duration-150 whitespace-nowrap shrink-0"
        >
          My Task Manager
        </a>

        {/* Zone 2: Clean single-line category navigation */}
        <nav
          aria-label="Task categories"
          className="hidden md:flex items-center gap-6"
        >
          {NAV_CATEGORIES.map((item) => {
            const isActive = activeCategory === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onSelectCategory(item.value)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[13px] h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Account authentication action */}
        <div className="flex items-center gap-3 shrink-0">
          {authLoading ? (
            <div
              aria-hidden="true"
              className="h-9 w-24 rounded-lg bg-slate-100 animate-pulse"
            />
          ) : userLabel ? (
            <>
              <span className="hidden sm:inline text-sm text-slate-600 truncate max-w-[160px]">
                {userLabel}
              </span>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 whitespace-nowrap shrink-0"
            >
              <LogIn className="w-4 h-4" aria-hidden="true" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
