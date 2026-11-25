import type {
  DueDateState,
  Task,
  TaskCategory,
  TaskFilterCriteria,
  TaskFormData,
  TaskStatsSummary,
} from '../types/task';

export const TASK_STORAGE_KEY = 'my_task_manager_tasks_v1';

export const TASK_CATEGORIES: readonly TaskCategory[] = ['Personal', 'College', 'Work'];

export function getTodayIsoDate(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  const day = String(referenceDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToIsoDate(baseIsoDate: string, daysToAdd: number): string {
  const [year, month, day] = baseIsoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + daysToAdd);
  return getTodayIsoDate(date);
}

export function createStarterTasks(todayIso: string = getTodayIsoDate()): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'starter-1',
      title: 'Submit Web Development Lab Report',
      description: 'Review React component structure, screenshots, and LocalStorage persistence notes before uploading to the portal.',
      category: 'College',
      dueDate: todayIso,
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'starter-2',
      title: 'Prepare Weekly Project Standup Notes',
      description: 'Summarize completed frontend milestones, open UI refinements, and next week deliverables for the team sync.',
      category: 'Work',
      dueDate: addDaysToIsoDate(todayIso, 2),
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'starter-3',
      title: 'Buy Weekly Groceries & Essentials',
      description: 'Pick up fresh vegetables, coffee beans, oats, and notebooks for the week.',
      category: 'Personal',
      dueDate: addDaysToIsoDate(todayIso, 1),
      completed: false,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'starter-4',
      title: 'Complete Database Normalization Worksheet',
      description: 'Finish 1NF, 2NF, and 3NF schema exercises from Chapter 4.',
      category: 'College',
      dueDate: addDaysToIsoDate(todayIso, -1),
      completed: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: {
    title?: string;
    description?: string;
  };
  sanitized: TaskFormData;
}

export function validateTaskInput(input: TaskFormData): TaskValidationResult {
  const title = input.title.trim();
  const description = input.description.trim();
  const category: TaskCategory = TASK_CATEGORIES.includes(input.category)
    ? input.category
    : 'Personal';
  const dueDate = input.dueDate.trim();

  const errors: TaskValidationResult['errors'] = {};

  if (!title) {
    errors.title = 'Please enter a task title.';
  } else if (title.length > 120) {
    errors.title = 'Task title must be 120 characters or fewer.';
  }

  if (description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      title,
      description,
      category,
      dueDate,
    },
  };
}

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addTaskItem(
  tasks: Task[],
  input: TaskFormData,
  idFactory: () => string = generateTaskId,
  nowIso: string = new Date().toISOString(),
): Task[] {
  const validation = validateTaskInput(input);
  if (!validation.isValid) {
    return tasks;
  }

  const newTask: Task = {
    id: idFactory(),
    title: validation.sanitized.title,
    description: validation.sanitized.description,
    category: validation.sanitized.category,
    dueDate: validation.sanitized.dueDate,
    completed: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return [newTask, ...tasks];
}

export function updateTaskItem(
  tasks: Task[],
  taskId: string,
  updates: TaskFormData,
  nowIso: string = new Date().toISOString(),
): Task[] {
  const validation = validateTaskInput(updates);
  if (!validation.isValid) {
    return tasks;
  }

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          title: validation.sanitized.title,
          description: validation.sanitized.description,
          category: validation.sanitized.category,
          dueDate: validation.sanitized.dueDate,
          updatedAt: nowIso,
        }
      : task,
  );
}

export function deleteTaskItem(tasks: Task[], taskId: string): Task[] {
  return tasks.filter((task) => task.id !== taskId);
}

export function toggleTaskItem(
  tasks: Task[],
  taskId: string,
  nowIso: string = new Date().toISOString(),
): Task[] {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          completed: !task.completed,
          updatedAt: nowIso,
        }
      : task,
  );
}

export function filterTasks(tasks: Task[], criteria: TaskFilterCriteria): Task[] {
  const normalizedQuery = criteria.searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    if (criteria.statusFilter === 'pending' && task.completed) {
      return false;
    }
    if (criteria.statusFilter === 'completed' && !task.completed) {
      return false;
    }
    if (criteria.categoryFilter !== 'All' && task.category !== criteria.categoryFilter) {
      return false;
    }
    if (normalizedQuery) {
      const matchesTitle = task.title.toLowerCase().includes(normalizedQuery);
      const matchesDescription = task.description.toLowerCase().includes(normalizedQuery);
      const matchesCategory = task.category.toLowerCase().includes(normalizedQuery);
      if (!matchesTitle && !matchesDescription && !matchesCategory) {
        return false;
      }
    }
    return true;
  });
}

export function computeTaskStats(tasks: Task[]): TaskStatsSummary {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    pending,
    completionRate,
  };
}

export function getDueDateState(
  dueDate: string,
  completed: boolean,
  todayIso: string = getTodayIsoDate(),
): DueDateState {
  if (!dueDate) {
    return 'none';
  }
  if (completed) {
    return 'completed';
  }
  if (dueDate < todayIso) {
    return 'overdue';
  }
  if (dueDate === todayIso) {
    return 'today';
  }
  return 'upcoming';
}

export function formatDueDateLabel(
  dueDate: string,
  completed: boolean,
  todayIso: string = getTodayIsoDate(),
): string {
  if (!dueDate) {
    return 'No due date';
  }

  const parts = dueDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return dueDate;
  }

  const [year, month, day] = parts;
  const dateObj = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);

  const state = getDueDateState(dueDate, completed, todayIso);
  if (state === 'overdue') {
    return `Overdue (${formatted})`;
  }
  if (state === 'today') {
    return `Due today (${formatted})`;
  }
  return `Due ${formatted}`;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isValidTaskRecord(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.category === 'string' &&
    TASK_CATEGORIES.includes(candidate.category as TaskCategory) &&
    typeof candidate.dueDate === 'string' &&
    typeof candidate.completed === 'boolean'
  );
}

export function loadTasksFromStorage(
  storage: StorageLike | null = typeof window !== 'undefined' ? window.localStorage : null,
  todayIso: string = getTodayIsoDate(),
): Task[] {
  if (!storage) {
    return createStarterTasks(todayIso);
  }

  try {
    const raw = storage.getItem(TASK_STORAGE_KEY);
    if (raw === null) {
      return createStarterTasks(todayIso);
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return createStarterTasks(todayIso);
    }

    return parsed.filter(isValidTaskRecord).map((task) => ({
      ...task,
      createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString(),
      updatedAt: typeof task.updatedAt === 'string' ? task.updatedAt : new Date().toISOString(),
    }));
  } catch {
    return createStarterTasks(todayIso);
  }
}

export function saveTasksToStorage(
  tasks: Task[],
  storage: StorageLike | null = typeof window !== 'undefined' ? window.localStorage : null,
): boolean {
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
