import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TASK_STORAGE_KEY,
  addTaskItem,
  computeTaskStats,
  createStarterTasks,
  deleteTaskItem,
  filterTasks,
  formatDueDateLabel,
  getDueDateState,
  loadTasksFromStorage,
  saveTasksToStorage,
  toggleTaskItem,
  updateTaskItem,
  validateTaskInput,
  type StorageLike,
} from './taskLogic';

test('validateTaskInput rejects empty or whitespace-only titles', () => {
  const result = validateTaskInput({
    title: '   ',
    description: 'Details',
    category: 'Work',
    dueDate: '2026-12-01',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.title, 'Please enter a task title.');
});

test('validateTaskInput trims valid input cleanly', () => {
  const result = validateTaskInput({
    title: '  Finish React Assignment  ',
    description: '  Include CRUD tests  ',
    category: 'College',
    dueDate: '2026-12-05',
  });

  assert.equal(result.isValid, true);
  assert.equal(result.sanitized.title, 'Finish React Assignment');
  assert.equal(result.sanitized.description, 'Include CRUD tests');
  assert.equal(result.sanitized.category, 'College');
});

test('CRUD lifecycle: add, update, toggle, and delete tasks immutably', () => {
  const initial = createStarterTasks('2026-11-24');
  const afterAdd = addTaskItem(
    initial,
    {
      title: 'Build CRUD App',
      description: 'Demonstrate all four operations',
      category: 'Work',
      dueDate: '2026-11-30',
    },
    () => 'custom-1',
    '2026-11-24T10:00:00.000Z',
  );

  assert.equal(afterAdd.length, initial.length + 1);
  assert.equal(afterAdd[0].id, 'custom-1');
  assert.equal(afterAdd[0].completed, false);

  const afterUpdate = updateTaskItem(
    afterAdd,
    'custom-1',
    {
      title: 'Build React CRUD App',
      description: 'Updated description',
      category: 'College',
      dueDate: '2026-12-01',
    },
    '2026-11-24T11:00:00.000Z',
  );

  assert.equal(afterUpdate[0].title, 'Build React CRUD App');
  assert.equal(afterUpdate[0].category, 'College');
  assert.equal(afterUpdate[0].dueDate, '2026-12-01');

  const afterToggle = toggleTaskItem(afterUpdate, 'custom-1');
  assert.equal(afterToggle[0].completed, true);

  const afterDelete = deleteTaskItem(afterToggle, 'custom-1');
  assert.equal(afterDelete.length, initial.length);
  assert.equal(afterDelete.some((t) => t.id === 'custom-1'), false);
});

test('filterTasks combines search query, status filter, and category filter', () => {
  const tasks = createStarterTasks('2026-11-24');

  const onlyCompleted = filterTasks(tasks, {
    searchQuery: '',
    statusFilter: 'completed',
    categoryFilter: 'All',
  });
  assert.equal(onlyCompleted.length, 1);
  assert.equal(onlyCompleted[0].id, 'starter-4');

  const pendingCollege = filterTasks(tasks, {
    searchQuery: '',
    statusFilter: 'pending',
    categoryFilter: 'College',
  });
  assert.equal(pendingCollege.length, 1);
  assert.equal(pendingCollege[0].id, 'starter-1');

  const searchResult = filterTasks(tasks, {
    searchQuery: 'groceries',
    statusFilter: 'all',
    categoryFilter: 'All',
  });
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].category, 'Personal');
});

test('computeTaskStats accurately counts total, completed, pending, and completionRate', () => {
  const tasks = createStarterTasks('2026-11-24');
  const stats = computeTaskStats(tasks);

  assert.deepEqual(stats, {
    total: 4,
    completed: 1,
    pending: 3,
    completionRate: 25,
  });

  assert.deepEqual(computeTaskStats([]), {
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0,
  });
});

test('due date state and formatting classify overdue, today, upcoming, and completed', () => {
  assert.equal(getDueDateState('2026-11-20', false, '2026-11-24'), 'overdue');
  assert.equal(getDueDateState('2026-11-24', false, '2026-11-24'), 'today');
  assert.equal(getDueDateState('2026-11-28', false, '2026-11-24'), 'upcoming');
  assert.equal(getDueDateState('2026-11-20', true, '2026-11-24'), 'completed');
  assert.equal(getDueDateState('', false, '2026-11-24'), 'none');

  assert.match(formatDueDateLabel('2026-11-20', false, '2026-11-24'), /^Overdue/);
  assert.match(formatDueDateLabel('2026-11-24', false, '2026-11-24'), /^Due today/);
  assert.match(formatDueDateLabel('2026-11-28', false, '2026-11-24'), /^Due Nov 28, 2026$/);
});

test('LocalStorage helpers seed first visit and preserve empty array when all tasks are deleted', () => {
  const store = new Map<string, string>();
  const mockStorage: StorageLike = {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
  };

  // First visit (no saved key) returns starter tasks
  const initial = loadTasksFromStorage(mockStorage, '2026-11-24');
  assert.equal(initial.length, 4);

  // Saving an empty list persists empty list instead of re-seeding
  assert.equal(saveTasksToStorage([], mockStorage), true);
  assert.equal(store.get(TASK_STORAGE_KEY), '[]');
  const reloadedEmpty = loadTasksFromStorage(mockStorage, '2026-11-24');
  assert.equal(reloadedEmpty.length, 0);
});
