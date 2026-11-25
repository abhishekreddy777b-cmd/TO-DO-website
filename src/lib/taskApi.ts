import type { Task, TaskFormData } from '../types/task';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  } & T;

  if (!response.ok) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }

  return data;
}

export async function fetchCloudTasks(idToken: string): Promise<Task[]> {
  const response = await fetch('/api/tasks', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const data = await parseJsonResponse<{ tasks: Task[] }>(response);
  return data.tasks;
}

export async function createCloudTask(
  idToken: string,
  payload: TaskFormData,
): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ task: Task }>(response);
  return data.task;
}

export async function updateCloudTask(
  idToken: string,
  taskId: string,
  payload: TaskFormData,
): Promise<Task> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse<{ task: Task }>(response);
  return data.task;
}

export async function toggleCloudTask(
  idToken: string,
  taskId: string,
): Promise<Task> {
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/toggle`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
  const data = await parseJsonResponse<{ task: Task }>(response);
  return data.task;
}

export async function deleteCloudTask(
  idToken: string,
  taskId: string,
): Promise<void> {
  const response = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  await parseJsonResponse<{ deleted: boolean }>(response);
}
