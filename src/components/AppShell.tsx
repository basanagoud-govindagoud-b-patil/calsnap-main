import React from 'react';
import { Home, CalendarDays, BarChart3, User, Camera, Moon, Sun } from 'lucide-react';
import { AppTab, UserProfile } from '../types';
import { BrandMark } from './BrandMark';

interface AppShellProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenAddMeal: () => void;
  user: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ id: AppTab; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'log', label: 'Log', icon: CalendarDays },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  onOpenAddMeal,
  user,
  darkMode,
  onToggleDarkMode,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 px-5 py-6 justify-between z-30">
        <div>
          <div className="px-2 mb-8">
            <BrandMark />
          </div>

          <button
            type="button"
            onClick={onOpenAddMeal}
            className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center justify-center gap-2.5 shadow-sm transition-all whitespace-nowrap shrink-0 mb-6"
          >
            <Camera size={18} strokeWidth={2.2} aria-hidden="true" />
            Add meal
          </button>

          <nav className="space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-3 transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="w-full min-h-[44px] px-3.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-between transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="inline-flex items-center gap-2.5">
              {darkMode ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              {darkMode ? 'Light mode' : 'Dark mode'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className="w-full min-h-[48px] px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center gap-3 text-left transition-colors"
          >
            <span className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 font-display font-semibold text-sm flex items-center justify-center shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {user.dailyCalorieGoal.toLocaleString()} kcal goal
              </span>
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Compact Mobile Top Bar (non-fixed so total fixed mobile height stays well under 15%) */}
        <header className="lg:hidden flex items-center justify-between px-4 sm:px-6 h-14 border-b border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <BrandMark size="sm" />
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-28 lg:py-8">
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Tab Bar with Floating Center Camera Button */}
      <nav
        aria-label="Bottom navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 pb-safe"
      >
        <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-16 px-2">
          {/* Home & Log */}
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}

          {/* Center Floating Add Meal Camera Button */}
          <div className="flex items-center justify-center -mt-6">
            <button
              type="button"
              onClick={onOpenAddMeal}
              aria-label="Add meal"
              className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-green-600/30 ring-4 ring-slate-50 dark:ring-slate-950 transition-transform"
            >
              <Camera size={24} strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>

          {/* Reports & Profile */}
          {NAV_ITEMS.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                  isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={21} strokeWidth={isActive ? 2.3 : 1.8} />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
