import React from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  Plus,
  Moon,
  Sun,
  X,
  Code2,
  Server,
  BrainCircuit,
  Database,
  Upload,
  ScanSearch,
  Calculator,
  Rocket,
} from 'lucide-react';
import { TASK_CATEGORIES, TaskCategory, TaskStats } from '../../types/todo';
import { BrandMark } from '../BrandMark';

export type SidebarSelection =
  | { type: 'all' }
  | { type: 'overdue' }
  | { type: 'category'; category: TaskCategory };

interface TodoSidebarProps {
  selection: SidebarSelection;
  stats: TaskStats | null;
  darkMode: boolean;
  mobileOpen: boolean;
  onSelect: (next: SidebarSelection) => void;
  onOpenNewTask: () => void;
  onToggleDarkMode: () => void;
  onCloseMobile: () => void;
}

const CATEGORY_ICONS: Record<TaskCategory, React.FC<{ size?: number; strokeWidth?: number }>> = {
  'Frontend Development': Code2,
  'Backend Development': Server,
  'AI/ML Model Development': BrainCircuit,
  'Database Integration': Database,
  'Food Image Upload': Upload,
  'Food Recognition': ScanSearch,
  'Calorie Estimation': Calculator,
  'Testing and Deployment': Rocket,
};

export const TodoSidebar: React.FC<TodoSidebarProps> = ({
  selection,
  stats,
  darkMode,
  mobileOpen,
  onSelect,
  onOpenNewTask,
  onToggleDarkMode,
  onCloseMobile,
}) => {
  const handleSelect = (next: SidebarSelection) => {
    onSelect(next);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800">
      {/* Top Brand Zone */}
      <div className="px-5 h-16 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <BrandMark showWordmark={false} size="sm" />
          <span className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-slate-50 truncate">
            Calorie Tracker
          </span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden min-h-[44px] min-w-[44px] -mr-2 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Primary Action */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            onOpenNewTask();
          }}
          className="w-full min-h-[46px] px-4 rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
          New Task
        </button>
      </div>

      {/* Scrollable Nav Lists */}
      <nav
        aria-label="Task views and project categories"
        className="flex-1 overflow-y-auto px-3 py-2 space-y-6"
      >
        {/* Overview Views */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
            Views
          </p>

          <button
            type="button"
            onClick={() => handleSelect({ type: 'all' })}
            aria-current={selection.type === 'all' ? 'page' : undefined}
            className={`w-full min-h-[44px] px-3 rounded-xl text-sm font-medium flex items-center justify-between gap-2 transition-colors ${
              selection.type === 'all'
                ? 'bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-300 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <span className="inline-flex items-center gap-2.5 truncate">
              <LayoutGrid size={17} strokeWidth={1.9} aria-hidden="true" />
              <span className="truncate">All Tasks</span>
            </span>
            <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
              {stats?.total ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect({ type: 'overdue' })}
            aria-current={selection.type === 'overdue' ? 'page' : undefined}
            className={`w-full min-h-[44px] px-3 rounded-xl text-sm font-medium flex items-center justify-between gap-2 transition-colors ${
              selection.type === 'overdue'
                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
            }`}
          >
            <span className="inline-flex items-center gap-2.5 truncate">
              <AlertTriangle
                size={17}
                strokeWidth={1.9}
                className={
                  (stats?.overdue ?? 0) > 0
                    ? 'text-red-600 dark:text-red-400'
                    : undefined
                }
                aria-hidden="true"
              />
              <span className="truncate">Overdue</span>
            </span>
            <span
              className={`text-xs font-semibold tabular-nums ${
                (stats?.overdue ?? 0) > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {stats?.overdue ?? 0}
            </span>
          </button>
        </div>

        {/* 8 Project Categories */}
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5">
            Project Categories
          </p>

          {TASK_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const isSelected =
              selection.type === 'category' && selection.category === category;
            const catCount = stats?.byCategory?.[category]?.total ?? 0;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleSelect({ type: 'category', category })}
                aria-current={isSelected ? 'page' : undefined}
                className={`w-full min-h-[44px] px-3 rounded-xl text-[13px] font-medium flex items-center justify-between gap-2 transition-colors ${
                  isSelected
                    ? 'bg-green-50 dark:bg-green-950/50 text-green-800 dark:text-green-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <span className="inline-flex items-center gap-2.5 min-w-0">
                  <Icon size={16} strokeWidth={1.85} />
                  <span className="truncate">{category}</span>
                </span>
                <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500 shrink-0">
                  {catCount}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Theme Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-full min-h-[44px] px-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-2.5 transition-colors"
        >
          {darkMode ? (
            <Sun size={17} aria-hidden="true" />
          ) : (
            <Moon size={17} aria-hidden="true" />
          )}
          <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-68 lg:fixed lg:inset-y-0 lg:left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
