export const TASK_CATEGORIES = [
  'Frontend Development',
  'Backend Development',
  'AI/ML Model Development',
  'Database Integration',
  'Food Image Upload',
  'Food Recognition',
  'Calorie Estimation',
  'Testing and Deployment',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_PRIORITIES = ['High', 'Medium', 'Low'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskStatusFilter = 'all' | 'pending' | 'completed';

export type TaskSortOption = 'newest' | 'dueDate' | 'priority';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormPayload {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionPercentage: number;
  byCategory: Record<TaskCategory, { total: number; completed: number; pending: number }>;
}

export function getLocalTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isTaskOverdue(task: Pick<Task, 'dueDate' | 'completed'>): boolean {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate < getLocalTodayKey();
}

export function isTaskDueToday(task: Pick<Task, 'dueDate' | 'completed'>): boolean {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate === getLocalTodayKey();
}

export function formatDueDate(dateKey: string | null): string {
  if (!dateKey) return 'No due date';
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export const PRIORITY_RANK: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};
