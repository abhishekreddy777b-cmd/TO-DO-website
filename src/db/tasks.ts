import { and, desc, eq } from 'drizzle-orm';
import type { Task, TaskCategory, TaskFormData } from '../types/task.ts';
import { generateTaskId, TASK_CATEGORIES } from '../utils/taskLogic.ts';
import { db } from './index.ts';
import { tasks } from './schema.ts';

function mapRowToTask(row: typeof tasks.$inferSelect): Task {
  const category: TaskCategory = TASK_CATEGORIES.includes(
    row.category as TaskCategory,
  )
    ? (row.category as TaskCategory)
    : 'Personal';

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category,
    dueDate: row.dueDate,
    completed: row.completed,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listTasksForUser(userId: number): Promise<Task[]> {
  try {
    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    return rows.map(mapRowToTask);
  } catch (error) {
    console.error('Database query failed in listTasksForUser:', error);
    throw new Error('Failed to load tasks. Please try again later.', {
      cause: error,
    });
  }
}

export async function createTaskForUser(
  userId: number,
  input: TaskFormData,
): Promise<Task> {
  try {
    const now = new Date();
    const [inserted] = await db
      .insert(tasks)
      .values({
        id: generateTaskId(),
        userId,
        title: input.title,
        description: input.description,
        category: input.category,
        dueDate: input.dueDate,
        completed: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return mapRowToTask(inserted);
  } catch (error) {
    console.error('Database query failed in createTaskForUser:', error);
    throw new Error('Failed to create task. Please try again later.', {
      cause: error,
    });
  }
}

export async function updateTaskForUser(
  userId: number,
  taskId: string,
  updates: TaskFormData,
): Promise<Task | null> {
  try {
    const [updated] = await db
      .update(tasks)
      .set({
        title: updates.title,
        description: updates.description,
        category: updates.category,
        dueDate: updates.dueDate,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return updated ? mapRowToTask(updated) : null;
  } catch (error) {
    console.error('Database query failed in updateTaskForUser:', error);
    throw new Error('Failed to update task. Please try again later.', {
      cause: error,
    });
  }
}

export async function toggleTaskForUser(
  userId: number,
  taskId: string,
): Promise<Task | null> {
  try {
    const [existing] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (!existing) {
      return null;
    }

    const [updated] = await db
      .update(tasks)
      .set({
        completed: !existing.completed,
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    return updated ? mapRowToTask(updated) : null;
  } catch (error) {
    console.error('Database query failed in toggleTaskForUser:', error);
    throw new Error('Failed to update task status. Please try again later.', {
      cause: error,
    });
  }
}

export async function deleteTaskForUser(
  userId: number,
  taskId: string,
): Promise<boolean> {
  try {
    const deleted = await db
      .delete(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning({ id: tasks.id });

    return deleted.length > 0;
  } catch (error) {
    console.error('Database query failed in deleteTaskForUser:', error);
    throw new Error('Failed to delete task. Please try again later.', {
      cause: error,
    });
  }
}
