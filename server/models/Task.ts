import mongoose, { Document, Schema } from 'mongoose';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  TaskCategory,
  TaskPriority,
  TaskRecord,
} from '../types.ts';

export interface TaskDocument extends Document {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<TaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [140, 'Task title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Task description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: TASK_CATEGORIES,
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: TASK_PRIORITIES,
      default: 'Medium',
      index: true,
    },
    dueDate: {
      type: String,
      default: null,
      index: true,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskModel =
  (mongoose.models.Task as mongoose.Model<TaskDocument> | undefined) ||
  mongoose.model<TaskDocument>('Task', TaskSchema);

export function serializeTaskDocument(doc: TaskDocument): TaskRecord {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description || '',
    category: doc.category,
    priority: doc.priority,
    dueDate: doc.dueDate ?? null,
    completed: Boolean(doc.completed),
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : null,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
  };
}
