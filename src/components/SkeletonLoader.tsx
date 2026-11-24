import React from 'react';

export const MealListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading meals">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 animate-pulse"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/70 rounded-md w-1/2" />
            </div>
            <div className="w-14 space-y-1.5">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/70 rounded-md w-8 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ReportsSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-pulse" aria-busy="true" aria-label="Loading weekly report">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-2"
          >
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 h-72 flex items-end gap-4">
        {[55, 78, 92, 68, 84, 48, 72].map((h, idx) => (
          <div
            key={idx}
            className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
};
