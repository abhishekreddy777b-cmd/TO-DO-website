export type TaskCategory = 'Personal' | 'College' | 'Work';

export type TaskStatusFilter = 'all' | 'pending' | 'completed';

export type TaskCategoryFilter = 'All' | TaskCategory;

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD or empty string
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string;
}

export interface TaskFilterCriteria {
  searchQuery: string;
  statusFilter: TaskStatusFilter;
  categoryFilter: TaskCategoryFilter;
}

export interface TaskStatsSummary {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export type DueDateState = 'none' | 'completed' | 'overdue' | 'today' | 'upcoming';
