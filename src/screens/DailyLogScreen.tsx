import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  PlusCircle,
  Calendar,
} from 'lucide-react';
import { MealEntry, UserProfile } from '../types';
import { addDaysToDateKey, formatDateKey } from '../data/foodCatalog';
import { formatReadableDate } from '../utils/storage';
import { MealCard } from '../components/MealCard';
import { MealListSkeleton } from '../components/SkeletonLoader';
import { getCalorieStatus } from '../components/ProgressRing';

interface DailyLogScreenProps {
  user: UserProfile;
  meals: MealEntry[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onSnapMeal: (dateKey: string) => void;
  onAddManual: (dateKey: string) => void;
  onEditMeal: (meal: MealEntry) => void;
  onDeleteMeal: (mealId: string) => void;
}

export const DailyLogScreen: React.FC<DailyLogScreenProps> = ({
  user,
  meals,
  selectedDate,
  onSelectDate,
  onSnapMeal,
  onAddManual,
  onEditMeal,
  onDeleteMeal,
}) => {
  const [transitioning, setTransitioning] = useState(false);
  const todayKey = formatDateKey(new Date());
  const isToday = selectedDate === todayKey;

  useEffect(() => {
    setTransitioning(true);
    const timer = window.setTimeout(() => setTransitioning(false), 180);
    return () => window.clearTimeout(timer);
  }, [selectedDate]);

  const dayMeals = meals
    .filter((m) => m.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));

  const dayTotal = dayMeals.reduce((sum, m) => sum + m.totalCalories, 0);
  const status = getCalorieStatus(dayTotal, user.dailyCalorieGoal);
  const progressPct = Math.min(100, Math.round((dayTotal / Math.max(1, user.dailyCalorieGoal)) * 100));
  const diff = Math.abs(user.dailyCalorieGoal - dayTotal);

  const barColor =
    status === 'over'
      ? 'bg-red-500'
      : status === 'near'
      ? 'bg-amber-500'
      : 'bg-green-600';

  const statusNote =
    dayMeals.length === 0
      ? 'No calories logged for this day yet.'
      : status === 'over'
      ? `You've gone ${diff.toLocaleString()} kcal over your daily goal`
      : status === 'near'
      ? diff === 0
        ? 'Right on your daily goal'
        : `${diff.toLocaleString()} kcal remaining (near goal)`
      : `${diff.toLocaleString()} kcal remaining`;

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Daily food log
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review, edit, or add meals for any day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onAddManual(selectedDate)}
            className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle size={17} aria-hidden="true" />
            Add manually (no photo)
          </button>
          <button
            type="button"
            onClick={() => onSnapMeal(selectedDate)}
            className="min-h-[44px] px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <Camera size={17} aria-hidden="true" />
            Snap meal
          </button>
        </div>
      </div>

      {/* Date Navigation Card */}
      <section
        aria-label="Date selector and daily total"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-4 sm:p-5 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectDate(addDaysToDateKey(selectedDate, -1))}
            aria-label="Previous day"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
            <label className="relative inline-flex items-center gap-2 cursor-pointer min-h-[44px] px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Calendar size={16} className="text-green-600 dark:text-green-400 shrink-0" aria-hidden="true" />
              <span className="font-display font-semibold text-base text-slate-900 dark:text-slate-50">
                {formatReadableDate(selectedDate)}
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onSelectDate(e.target.value);
                }}
                aria-label="Choose date"
                className="sr-only"
              />
            </label>
            {!isToday && (
              <button
                type="button"
                onClick={() => onSelectDate(todayKey)}
                className="min-h-[36px] px-3 rounded-lg text-xs font-semibold text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
              >
                Jump to today
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectDate(addDaysToDateKey(selectedDate, 1))}
            aria-label="Next day"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Daily Total Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Daily total
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                  {dayTotal.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
                  / {user.dailyCalorieGoal.toLocaleString()} kcal
                </span>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 tabular-nums">
              {statusNote}
            </p>
          </div>

          <div
            className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden"
            role="progressbar"
            aria-valuenow={dayTotal}
            aria-valuemin={0}
            aria-valuemax={user.dailyCalorieGoal}
            aria-label={`Daily calories ${dayTotal} of ${user.dailyCalorieGoal}`}
          >
            <div
              className={`h-full rounded-full ${barColor}`}
              style={{
                width: `${progressPct}%`,
                transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Chronological Meals List */}
      <section aria-label="Logged meals for selected date">
        {transitioning ? (
          <MealListSkeleton count={2} />
        ) : dayMeals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] px-6 py-12 text-center space-y-3">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
              No meals logged on {formatReadableDate(selectedDate)}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Snap a photo of your plate or add an entry manually whenever you are ready.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onSnapMeal(selectedDate)}
                className="min-h-[44px] px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Camera size={17} aria-hidden="true" />
                Snap a meal
              </button>
              <button
                type="button"
                onClick={() => onAddManual(selectedDate)}
                className="min-h-[44px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-colors"
              >
                Add manually
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {dayMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                showMealType
                onEdit={onEditMeal}
                onDelete={onDeleteMeal}
              />
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
        Calorie estimates are approximate and not medical advice.
      </p>
    </div>
  );
};
