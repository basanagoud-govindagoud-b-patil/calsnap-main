import {
  Task,
  TaskCategory,
  TaskFormPayload,
  TaskPriority,
  TaskStats,
  TaskStatusFilter,
} from '../types/todo';

export interface FetchTasksParams {
  search?: string;
  status?: TaskStatusFilter;
  category?: TaskCategory | 'all';
  priority?: TaskPriority | 'all';
  overdue?: boolean;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof (payload as { error?: unknown }).error === 'string'
        ? (payload as { error: string }).error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchTasks(
  params: FetchTasksParams = {}
): Promise<{ tasks: Task[]; stats: TaskStats }> {
  const qs = new URLSearchParams();
  if (params.search && params.search.trim()) qs.set('search', params.search.trim());
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  if (params.category && params.category !== 'all') qs.set('category', params.category);
  if (params.priority && params.priority !== 'all') qs.set('priority', params.priority);
  if (params.overdue) qs.set('overdue', 'true');

  const url = qs.toString() ? `/api/tasks?${qs.toString()}` : '/api/tasks';
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  return parseJsonResponse<{ tasks: Task[]; stats: TaskStats }>(res);
}

export async function createTaskApi(
  payload: TaskFormPayload
): Promise<{ task: Task; stats: TaskStats }> {
  const res = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ task: Task; stats: TaskStats }>(res);
}

export async function updateTaskApi(
  id: string,
  payload: Partial<TaskFormPayload & { completed?: boolean }>
): Promise<{ task: Task; stats: TaskStats }> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<{ task: Task; stats: TaskStats }>(res);
}

export async function toggleTaskApi(
  id: string,
  completed?: boolean
): Promise<{ task: Task; stats: TaskStats }> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(completed === undefined ? {} : { completed }),
  });
  return parseJsonResponse<{ task: Task; stats: TaskStats }>(res);
}

export async function deleteTaskApi(
  id: string
): Promise<{ deletedId: string; stats: TaskStats }> {
  const res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  return parseJsonResponse<{ deletedId: string; stats: TaskStats }>(res);
}
