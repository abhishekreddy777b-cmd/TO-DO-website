import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { EditTaskModal } from './components/EditTaskModal';
import { Navbar } from './components/Navbar';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TaskStats } from './components/TaskStats';
import { TaskToolbar } from './components/TaskToolbar';
import { useAuth } from './context/AuthContext';
import {
  createCloudTask,
  deleteCloudTask,
  fetchCloudTasks,
  toggleCloudTask,
  updateCloudTask,
} from './lib/taskApi';
import type {
  Task,
  TaskCategoryFilter,
  TaskFormData,
  TaskStatusFilter,
} from './types/task';
import {
  addTaskItem,
  computeTaskStats,
  deleteTaskItem,
  filterTasks,
  loadTasksFromStorage,
  saveTasksToStorage,
  toggleTaskItem,
  updateTaskItem,
} from './utils/taskLogic';

export default function App() {
  const {
    user,
    authLoading,
    authError,
    signInWithGoogle,
    signOutUser,
    getIdToken,
    clearAuthError,
  } = useAuth();

  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [tasksLoading, setTasksLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<TaskCategoryFilter>('All');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Sync tasks with backend API when signed in; otherwise use local storage
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setTasksLoading(false);
      setActionError(null);
      setTasks(loadTasksFromStorage());
      return;
    }

    let cancelled = false;
    setTasksLoading(true);
    setActionError(null);

    (async () => {
      try {
        const token = await getIdToken();
        if (!token || cancelled) {
          return;
        }
        const cloudTasks = await fetchCloudTasks(token);
        if (!cancelled) {
          setTasks(cloudTasks);
        }
      } catch (error) {
        if (!cancelled) {
          setActionError(
            error instanceof Error
              ? error.message
              : 'Unable to load your tasks. Please try again.',
          );
        }
      } finally {
        if (!cancelled) {
          setTasksLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, getIdToken]);

  // Persist guest workspace tasks locally when signed out
  useEffect(() => {
    if (!authLoading && !user) {
      saveTasksToStorage(tasks);
    }
  }, [tasks, user, authLoading]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const filteredTasks = useMemo(
    () =>
      filterTasks(tasks, {
        searchQuery,
        statusFilter,
        categoryFilter,
      }),
    [tasks, searchQuery, statusFilter, categoryFilter],
  );

  const handleAddTask = async (formData: TaskFormData) => {
    setActionError(null);

    if (!user) {
      setTasks((prev) => addTaskItem(prev, formData));
    } else {
      try {
        const token = await getIdToken();
        if (!token) {
          throw new Error('Please sign in again to save tasks.');
        }
        const created = await createCloudTask(token, formData);
        setTasks((prev) => [created, ...prev]);
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : 'Unable to create task. Please try again.',
        );
        return;
      }
    }

    if (categoryFilter !== 'All' && categoryFilter !== formData.category) {
      setCategoryFilter('All');
    }
    if (statusFilter === 'completed') {
      setStatusFilter('all');
    }
  };

  const handleUpdateTask = async (taskId: string, updatedData: TaskFormData) => {
    setActionError(null);

    if (!user) {
      setTasks((prev) => updateTaskItem(prev, taskId, updatedData));
      setEditingTask(null);
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Please sign in again to update tasks.');
      }
      const updated = await updateCloudTask(token, taskId, updatedData);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated : task)),
      );
      setEditingTask(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update task. Please try again.',
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setActionError(null);

    if (!user) {
      setTasks((prev) => deleteTaskItem(prev, taskId));
      if (editingTask?.id === taskId) {
        setEditingTask(null);
      }
      return;
    }

    const previousTasks = tasks;
    setTasks((prev) => deleteTaskItem(prev, taskId));
    if (editingTask?.id === taskId) {
      setEditingTask(null);
    }

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Please sign in again to delete tasks.');
      }
      await deleteCloudTask(token, taskId);
    } catch (error) {
      setTasks(previousTasks);
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to delete task. Please try again.',
      );
    }
  };

  const handleToggleTask = async (taskId: string) => {
    setActionError(null);

    if (!user) {
      setTasks((prev) => toggleTaskItem(prev, taskId));
      return;
    }

    const previousTasks = tasks;
    setTasks((prev) => toggleTaskItem(prev, taskId));

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error('Please sign in again to update task status.');
      }
      const updated = await toggleCloudTask(token, taskId);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated : task)),
      );
    } catch (error) {
      setTasks(previousTasks);
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to update task status. Please try again.',
      );
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('All');
  };

  const handleFocusAddTask = () => {
    titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    titleInputRef.current?.focus();
  };

  const activeError = actionError || authError;
  const userLabel = user ? user.displayName || user.email || 'Signed in' : null;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        activeCategory={categoryFilter}
        onSelectCategory={setCategoryFilter}
        userLabel={userLabel}
        authLoading={authLoading}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="mb-5 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Daily Task Workspace
          </h1>
          <p className="mt-1 text-sm sm:text-base text-slate-600">
            {user
              ? 'Create, organize, update, and complete your tasks across devices.'
              : 'Create, organize, update, and complete your tasks. Sign in with Google to save and sync your list across devices.'}
          </p>
        </div>

        {activeError && (
          <div
            role="alert"
            className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{activeError}</span>
            <button
              type="button"
              onClick={() => {
                setActionError(null);
                clearAuthError();
              }}
              aria-label="Dismiss error"
              className="rounded-md p-1 text-red-600 hover:bg-red-100 transition-colors duration-150 shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left column: Add Task Form */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <TaskForm
              onAddTask={handleAddTask}
              titleInputRef={titleInputRef}
            />
          </div>

          {/* Right column: Summary Stats, Search/Filter Toolbar, and Task List */}
          <div className="lg:col-span-8 space-y-5">
            <TaskStats stats={stats} />

            <TaskToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
            />

            <TaskList
              tasks={filteredTasks}
              totalTaskCount={tasks.length}
              isLoading={tasksLoading}
              categoryFilter={categoryFilter}
              statusFilter={statusFilter}
              searchQuery={searchQuery}
              onToggleTask={handleToggleTask}
              onEditTask={setEditingTask}
              onDeleteTask={handleDeleteTask}
              onClearFilters={handleClearFilters}
              onFocusAddTask={handleFocusAddTask}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>My Task Manager</span>
          <span>
            {user
              ? 'Signed in and synced to your account.'
              : 'Sign in with Google to sync tasks across devices.'}
          </span>
        </div>
      </footer>

      <EditTaskModal
        task={editingTask}
        onSave={handleUpdateTask}
        onClose={() => setEditingTask(null)}
      />
    </div>
  );
}
