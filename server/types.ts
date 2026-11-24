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

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null; // YYYY-MM-DD
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
  completed?: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionPercentage: number;
  byCategory: Record<TaskCategory, { total: number; completed: number; pending: number }>;
}

const CATEGORY_SET = new Set<string>(TASK_CATEGORIES);
const PRIORITY_SET = new Set<string>(TASK_PRIORITIES);
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export function isValidObjectIdString(id: unknown): id is string {
  return typeof id === 'string' && OBJECT_ID_REGEX.test(id);
}

export function isValidCategory(val: unknown): val is TaskCategory {
  return typeof val === 'string' && CATEGORY_SET.has(val);
}

export function isValidPriority(val: unknown): val is TaskPriority {
  return typeof val === 'string' && PRIORITY_SET.has(val);
}

export function isValidDueDate(val: unknown): val is string {
  if (typeof val !== 'string' || !ISO_DATE_REGEX.test(val)) return false;
  const [y, m, d] = val.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

export function validateTaskPayload(
  body: unknown,
  isPartial = false
): { data?: Partial<TaskInput>; error?: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a valid JSON object.' };
  }

  const raw = body as Record<string, unknown>;
  const data: Partial<TaskInput> = {};

  if (!isPartial || raw.title !== undefined) {
    if (typeof raw.title !== 'string') {
      return { error: 'Task title must be a text string.' };
    }
    const trimmed = raw.title.trim();
    if (trimmed.length === 0) {
      return { error: 'Task title is required.' };
    }
    if (trimmed.length > 140) {
      return { error: 'Task title must be 140 characters or fewer.' };
    }
    data.title = trimmed;
  }

  if (!isPartial || raw.description !== undefined) {
    if (raw.description === undefined || raw.description === null) {
      data.description = '';
    } else if (typeof raw.description !== 'string') {
      return { error: 'Task description must be a text string.' };
    } else {
      const trimmedDesc = raw.description.trim();
      if (trimmedDesc.length > 1000) {
        return { error: 'Task description must be 1,000 characters or fewer.' };
      }
      data.description = trimmedDesc;
    }
  }

  if (!isPartial || raw.category !== undefined) {
    if (!isValidCategory(raw.category)) {
      return {
        error: `Category must be one of: ${TASK_CATEGORIES.join(', ')}.`,
      };
    }
    data.category = raw.category;
  }

  if (!isPartial || raw.priority !== undefined) {
    const val = raw.priority ?? 'Medium';
    if (!isValidPriority(val)) {
      return { error: 'Priority must be High, Medium, or Low.' };
    }
    data.priority = val;
  }

  if (!isPartial || raw.dueDate !== undefined) {
    if (raw.dueDate === null || raw.dueDate === '' || raw.dueDate === undefined) {
      data.dueDate = null;
    } else if (!isValidDueDate(raw.dueDate)) {
      return { error: 'Due date must be a valid date in YYYY-MM-DD format.' };
    } else {
      data.dueDate = raw.dueDate;
    }
  }

  if (raw.completed !== undefined) {
    if (typeof raw.completed !== 'boolean') {
      return { error: 'Completed status must be a boolean.' };
    }
    data.completed = raw.completed;
  }

  return { data };
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isTaskOverdue(task: Pick<TaskRecord, 'dueDate' | 'completed'>): boolean {
  if (task.completed || !task.dueDate) return false;
  return task.dueDate < getTodayDateKey();
}

export function computeTaskStats(tasks: TaskRecord[]): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter((t) => isTaskOverdue(t)).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const byCategory = {} as Record<
    TaskCategory,
    { total: number; completed: number; pending: number }
  >;

  for (const cat of TASK_CATEGORIES) {
    byCategory[cat] = { total: 0, completed: 0, pending: 0 };
  }

  for (const task of tasks) {
    const bucket = byCategory[task.category];
    if (bucket) {
      bucket.total += 1;
      if (task.completed) bucket.completed += 1;
      else bucket.pending += 1;
    }
  }

  return {
    total,
    completed,
    pending,
    overdue,
    completionPercentage,
    byCategory,
  };
}
