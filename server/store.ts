import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { TaskModel, serializeTaskDocument } from './models/Task.ts';
import {
  TaskCategory,
  TaskInput,
  TaskPriority,
  TaskRecord,
  TaskStats,
  TaskStatusFilter,
  computeTaskStats,
  getTodayDateKey,
  isTaskOverdue,
} from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'tasks.json');

export interface TaskQueryFilters {
  search?: string;
  status?: TaskStatusFilter;
  category?: TaskCategory | 'all';
  priority?: TaskPriority | 'all';
  overdueOnly?: boolean;
}

type StorageMode = 'mongodb' | 'local-json';

let storageMode: StorageMode = 'local-json';

function addDays(baseDateKey: string, delta: number): string {
  const [y, m, d] = baseDateKey.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function generateObjectIdHex(): string {
  return crypto.randomBytes(12).toString('hex');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createInitialSeedTasks(): Omit<TaskRecord, 'id'>[] {
  const today = getTodayDateKey();
  const nowIso = new Date().toISOString();

  return [
    {
      title: 'Build responsive mobile dashboard & calorie progress ring',
      description:
        'Implement the circular calorie goal indicator with green, amber, and soft red states plus today’s grouped meal summary.',
      category: 'Frontend Development',
      priority: 'High',
      dueDate: addDays(today, -2),
      completed: true,
      completedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Create Express REST API endpoints for meal logs & daily totals',
      description:
        'Expose validated GET, POST, PUT, and DELETE endpoints for meal logs with structured JSON error handling.',
      category: 'Backend Development',
      priority: 'High',
      dueDate: addDays(today, -1),
      completed: true,
      completedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Design MongoDB collections for users, meals, and food items',
      description:
        'Define Mongoose schemas with compound indexes on userId and logged date for fast weekly report aggregation.',
      category: 'Database Integration',
      priority: 'High',
      dueDate: addDays(today, 1),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Implement drag-and-drop & camera meal photo upload pipeline',
      description:
        'Validate JPEG, PNG, and HEIC uploads up to 10 MB, add client-side compression, and render instant image previews.',
      category: 'Food Image Upload',
      priority: 'High',
      dueDate: addDays(today, -1),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Tune vision prompt for top-3 food labels & confidence scores',
      description:
        'Return top 3 food candidates with 0–1 confidence scores, default serving grams, and kcal per 100 g in structured JSON.',
      category: 'Food Recognition',
      priority: 'High',
      dueDate: addDays(today, 2),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Benchmark multi-item plate segmentation accuracy',
      description:
        'Evaluate model precision on bowls and mixed plates with 3+ ingredients and flag predictions under 50% confidence.',
      category: 'AI/ML Model Development',
      priority: 'Medium',
      dueDate: addDays(today, 4),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Implement live portion gram slider & calorie override calculation',
      description:
        'Recalculate kcal = kcalPer100g × (grams / 100) live for Small, Medium, Large presets and allow manual overrides.',
      category: 'Calorie Estimation',
      priority: 'Medium',
      dueDate: today,
      completed: true,
      completedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Configure CI pipeline, E2E CRUD tests, and production deploy',
      description:
        'Add automated API integration tests for all CRUD endpoints, verify environment variables, and publish release build.',
      category: 'Testing and Deployment',
      priority: 'Low',
      dueDate: addDays(today, 6),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Add dark mode theme persistence & WCAG AA contrast checks',
      description:
        'Ensure light and dark surface pairings maintain readable contrast across cards, inputs, charts, and priority indicators.',
      category: 'Frontend Development',
      priority: 'Low',
      dueDate: addDays(today, 3),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
    {
      title: 'Build nutrition lookup fallback catalog for offline manual entry',
      description:
        'Maintain a curated USDA-style food reference dataset so users can search and log meals even without a photo.',
      category: 'Calorie Estimation',
      priority: 'Medium',
      dueDate: addDays(today, -3),
      completed: false,
      completedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  ];
}

// ---------- Local Disk JSON Store Helpers (confined strictly inside DATA_DIR) ----------
function ensureDiskStore(): void {
  if (!DATA_FILE.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Invalid storage path configuration.');
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const seeded: TaskRecord[] = createInitialSeedTasks().map((t) => ({
      ...t,
      id: generateObjectIdHex(),
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), 'utf8');
  }
}

function readDiskTasks(): TaskRecord[] {
  ensureDiskStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TaskRecord[]) : [];
  } catch {
    return [];
  }
}

function writeDiskTasks(tasks: TaskRecord[]): void {
  ensureDiskStore();
  const tmpFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(tasks, null, 2), 'utf8');
  fs.renameSync(tmpFile, DATA_FILE);
}

// ---------- Database Initialization ----------
export async function initializeTaskStorage(): Promise<StorageMode> {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 4000,
      });
      storageMode = 'mongodb';
      console.log('Connected to MongoDB for persistent task storage.');

      const existingCount = await TaskModel.countDocuments();
      if (existingCount === 0) {
        await TaskModel.insertMany(createInitialSeedTasks());
        console.log('Seeded initial Food-Photo Calorie Tracker tasks into MongoDB.');
      }
      return storageMode;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(
        `MongoDB connection unavailable (${msg}). Using persistent local disk storage at data/tasks.json.`
      );
    }
  } else {
    console.log(
      'MONGODB_URI not set. Using persistent local disk storage at data/tasks.json (set MONGODB_URI to connect MongoDB).'
    );
  }

  storageMode = 'local-json';
  ensureDiskStore();
  return storageMode;
}

export function getStorageMode(): StorageMode {
  return storageMode;
}

// ---------- Repository CRUD Operations ----------
export async function listTasks(filters: TaskQueryFilters = {}): Promise<TaskRecord[]> {
  if (storageMode === 'mongodb') {
    const query: Record<string, unknown> = {};

    if (filters.status === 'completed') query.completed = true;
    if (filters.status === 'pending') query.completed = false;
    if (filters.category && filters.category !== 'all') query.category = filters.category;
    if (filters.priority && filters.priority !== 'all') query.priority = filters.priority;
    if (filters.search && filters.search.trim()) {
      query.title = { $regex: escapeRegex(filters.search.trim()), $options: 'i' };
    }
    if (filters.overdueOnly) {
      query.completed = false;
      query.dueDate = { $ne: null, $lt: getTodayDateKey() };
    }

    const docs = await TaskModel.find(query).sort({ createdAt: -1 }).exec();
    return docs.map(serializeTaskDocument);
  }

  let tasks = readDiskTasks();

  if (filters.status === 'completed') {
    tasks = tasks.filter((t) => t.completed);
  } else if (filters.status === 'pending') {
    tasks = tasks.filter((t) => !t.completed);
  }

  if (filters.category && filters.category !== 'all') {
    tasks = tasks.filter((t) => t.category === filters.category);
  }

  if (filters.priority && filters.priority !== 'all') {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
  }

  if (filters.overdueOnly) {
    tasks = tasks.filter((t) => isTaskOverdue(t));
  }

  return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getTaskById(id: string): Promise<TaskRecord | null> {
  if (storageMode === 'mongodb') {
    const doc = await TaskModel.findById(id).exec();
    return doc ? serializeTaskDocument(doc) : null;
  }

  const tasks = readDiskTasks();
  return tasks.find((t) => t.id === id) ?? null;
}

export async function createTask(input: TaskInput): Promise<TaskRecord> {
  if (storageMode === 'mongodb') {
    const doc = await TaskModel.create({
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      dueDate: input.dueDate,
      completed: Boolean(input.completed),
      completedAt: input.completed ? new Date() : null,
    });
    return serializeTaskDocument(doc);
  }

  const nowIso = new Date().toISOString();
  const created: TaskRecord = {
    id: generateObjectIdHex(),
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    dueDate: input.dueDate,
    completed: Boolean(input.completed),
    completedAt: input.completed ? nowIso : null,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const tasks = readDiskTasks();
  writeDiskTasks([created, ...tasks]);
  return created;
}

export async function updateTask(
  id: string,
  patch: Partial<TaskInput>
): Promise<TaskRecord | null> {
  if (storageMode === 'mongodb') {
    const updateDoc: Record<string, unknown> = {};
    if (patch.title !== undefined) updateDoc.title = patch.title;
    if (patch.description !== undefined) updateDoc.description = patch.description;
    if (patch.category !== undefined) updateDoc.category = patch.category;
    if (patch.priority !== undefined) updateDoc.priority = patch.priority;
    if (patch.dueDate !== undefined) updateDoc.dueDate = patch.dueDate;
    if (patch.completed !== undefined) {
      updateDoc.completed = patch.completed;
      updateDoc.completedAt = patch.completed ? new Date() : null;
    }

    const updated = await TaskModel.findByIdAndUpdate(
      id,
      { $set: updateDoc },
      { new: true, runValidators: true }
    ).exec();

    return updated ? serializeTaskDocument(updated) : null;
  }

  const tasks = readDiskTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const existing = tasks[idx];
  const nowIso = new Date().toISOString();
  const nextCompleted =
    patch.completed !== undefined ? patch.completed : existing.completed;

  const updated: TaskRecord = {
    ...existing,
    title: patch.title !== undefined ? patch.title : existing.title,
    description: patch.description !== undefined ? patch.description : existing.description,
    category: patch.category !== undefined ? patch.category : existing.category,
    priority: patch.priority !== undefined ? patch.priority : existing.priority,
    dueDate: patch.dueDate !== undefined ? patch.dueDate : existing.dueDate,
    completed: nextCompleted,
    completedAt:
      patch.completed !== undefined
        ? patch.completed
          ? nowIso
          : null
        : existing.completedAt,
    updatedAt: nowIso,
  };

  tasks[idx] = updated;
  writeDiskTasks(tasks);
  return updated;
}

export async function toggleTaskComplete(
  id: string,
  explicitCompleted?: boolean
): Promise<TaskRecord | null> {
  const existing = await getTaskById(id);
  if (!existing) return null;
  const targetState =
    typeof explicitCompleted === 'boolean' ? explicitCompleted : !existing.completed;
  return updateTask(id, { completed: targetState });
}

export async function deleteTask(id: string): Promise<boolean> {
  if (storageMode === 'mongodb') {
    const deleted = await TaskModel.findByIdAndDelete(id).exec();
    return Boolean(deleted);
  }

  const tasks = readDiskTasks();
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length) return false;
  writeDiskTasks(next);
  return true;
}

export async function getTaskStats(): Promise<TaskStats> {
  const allTasks = await listTasks();
  return computeTaskStats(allTasks);
}
