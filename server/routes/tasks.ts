import express from 'express';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTaskStats,
  listTasks,
  toggleTaskComplete,
  updateTask,
} from '../store.ts';
import {
  TaskInput,
  TaskStatusFilter,
  isValidCategory,
  isValidObjectIdString,
  isValidPriority,
  validateTaskPayload,
} from '../types.ts';

export const tasksRouter = express.Router();

// GET /api/stats — Dashboard summary counts & category breakdown
tasksRouter.get('/stats', async (_req, res, next) => {
  try {
    const stats = await getTaskStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks — List tasks with optional search, status, category, priority, overdueOnly
tasksRouter.get('/tasks', async (req, res, next) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.slice(0, 140) : undefined;
    const rawStatus = typeof req.query.status === 'string' ? req.query.status.toLowerCase() : 'all';
    const status: TaskStatusFilter =
      rawStatus === 'pending' || rawStatus === 'completed' ? rawStatus : 'all';

    const rawCategory = typeof req.query.category === 'string' ? req.query.category : 'all';
    const category = rawCategory === 'all' || isValidCategory(rawCategory) ? rawCategory : 'all';

    const rawPriority = typeof req.query.priority === 'string' ? req.query.priority : 'all';
    const priority = rawPriority === 'all' || isValidPriority(rawPriority) ? rawPriority : 'all';

    const overdueOnly = req.query.overdue === 'true';

    const [tasks, stats] = await Promise.all([
      listTasks({ search, status, category, priority, overdueOnly }),
      getTaskStats(),
    ]);

    res.json({ tasks, stats });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id — Retrieve single task by ID
tasksRouter.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectIdString(id)) {
      res.status(400).json({ error: 'Invalid task identifier.' });
      return;
    }

    const task = await getTaskById(id);
    if (!task) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
});

// POST /api/tasks — Create a new task
tasksRouter.post('/tasks', async (req, res, next) => {
  try {
    const { data, error } = validateTaskPayload(req.body, false);
    if (error || !data) {
      res.status(400).json({ error: error || 'Invalid task data.' });
      return;
    }

    const created = await createTask(data as TaskInput);
    const stats = await getTaskStats();
    res.status(201).json({ task: created, stats });
  } catch (err) {
    next(err);
  }
});

// PUT /api/tasks/:id — Update an existing task
tasksRouter.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectIdString(id)) {
      res.status(400).json({ error: 'Invalid task identifier.' });
      return;
    }

    const { data, error } = validateTaskPayload(req.body, true);
    if (error || !data || Object.keys(data).length === 0) {
      res.status(400).json({ error: error || 'Please provide at least one field to update.' });
      return;
    }

    const updated = await updateTask(id, data);
    if (!updated) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const stats = await getTaskStats();
    res.json({ task: updated, stats });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id/toggle — Toggle or set task completed status
tasksRouter.patch('/tasks/:id/toggle', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectIdString(id)) {
      res.status(400).json({ error: 'Invalid task identifier.' });
      return;
    }

    const rawCompleted =
      req.body && typeof req.body === 'object' && 'completed' in req.body
        ? (req.body as { completed?: unknown }).completed
        : undefined;

    if (rawCompleted !== undefined && typeof rawCompleted !== 'boolean') {
      res.status(400).json({ error: 'Completed field must be a boolean.' });
      return;
    }

    const updated = await toggleTaskComplete(id, rawCompleted);
    if (!updated) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const stats = await getTaskStats();
    res.json({ task: updated, stats });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tasks/:id — Delete a task permanently
tasksRouter.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectIdString(id)) {
      res.status(400).json({ error: 'Invalid task identifier.' });
      return;
    }

    const deleted = await deleteTask(id);
    if (!deleted) {
      res.status(404).json({ error: 'Task not found.' });
      return;
    }

    const stats = await getTaskStats();
    res.json({ deletedId: id, stats });
  } catch (err) {
    next(err);
  }
});
