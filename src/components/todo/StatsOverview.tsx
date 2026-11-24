import React from 'react';
import { TaskStats } from '../../types/todo';

interface StatsOverviewProps {
  stats: TaskStats | null;
  loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  if (loading && !stats) {
    return (
      <section aria-busy="true" aria-label="Loading statistics" className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2"
            >
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-7 w-14 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 h-16 animate-pulse" />
      </section>
    );
  }

  const total = stats?.total ?? 0;
  const completed = stats?.completed ?? 0;
  const pending = stats?.pending ?? 0;
  const overdue = stats?.overdue ?? 0;
  const completionPct = stats?.completionPercentage ?? 0;

  return (
    <section aria-label="Project task statistics" className="space-y-4">
      {/* 5 Required Dashboard Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Tasks
          </p>
          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
            {total}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Completed Tasks
          </p>
          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-400 tabular-nums">
            {completed}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending Tasks
          </p>
          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {pending}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overdue Tasks
          </p>
          <p
            className={`mt-1.5 font-display text-2xl sm:text-3xl font-bold tabular-nums ${
              overdue > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-900 dark:text-slate-50'
            }`}
          >
            {overdue}
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Overall Completion
          </p>
          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
            {completionPct}%
          </p>
        </div>
      </div>

      {/* Overall Completion Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-5 py-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            Project Progress
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            <span className="font-semibold text-green-700 dark:text-green-400">
              {completed} completed
            </span>
            <span aria-hidden="true">·</span>
            <span>{pending} pending</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {completionPct}%
            </span>
          </div>
        </div>

        <div
          className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
          role="progressbar"
          aria-valuenow={completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Overall project completion ${completionPct}%`}
        >
          <div
            className="h-full rounded-full bg-green-600 dark:bg-green-500"
            style={{
              width: `${completionPct}%`,
              transition: 'width 450ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>
    </section>
  );
};
