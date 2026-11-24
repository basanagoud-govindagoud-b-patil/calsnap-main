import React from 'react';
import { Camera, Plus, ArrowRight } from 'lucide-react';
import { MealEntry, MealType, UserProfile } from '../types';
import { formatDateKey } from '../data/foodCatalog';
import { formatReadableDate, getTimeGreeting } from '../utils/storage';
import { ProgressRing } from '../components/ProgressRing';
import { MealCard } from '../components/MealCard';
import { MealListSkeleton } from '../components/SkeletonLoader';

interface DashboardScreenProps {
  user: UserProfile;
  meals: MealEntry[];
  isLoading?: boolean;
  onAddMeal: (defaultType?: MealType) => void;
  onEditMeal: (meal: MealEntry) => void;
  onDeleteMeal: (mealId: string) => void;
  onOpenLog: () => void;
}

const MEAL_GROUPS: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  meals,
  isLoading = false,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
  onOpenLog,
}) => {
  const todayKey = formatDateKey(new Date());
  const todayMeals = meals
    .filter((m) => m.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));

  const consumedToday = todayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const firstName = user.name.split(' ')[0] || 'there';

  const groupTotals = MEAL_GROUPS.reduce<Record<MealType, number>>(
    (acc, group) => {
      acc[group] = todayMeals
        .filter((m) => m.mealType === group)
        .reduce((sum, m) => sum + m.totalCalories, 0);
      return acc;
    },
    { Breakfast: 0, Lunch: 0, Dinner: 0, Snack: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {formatReadableDate(todayKey)}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-0.5">
            {getTimeGreeting()}, {firstName}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onAddMeal()}
          className="min-h-[48px] px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Camera size={18} strokeWidth={2.2} aria-hidden="true" />
          Add meal
        </button>
      </div>

      {/* Main Summary Card: Ring + Meal Type Breakdown */}
      <section
        aria-label="Today's calorie summary"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-6 sm:p-7"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-6 flex justify-center">
            <ProgressRing consumed={consumedToday} goal={user.dailyCalorieGoal} />
          </div>

          <div className="md:col-span-6 space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center sm:text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Consumed</p>
                <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50 tabular-nums mt-0.5">
                  {consumedToday.toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Daily goal</p>
                <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50 tabular-nums mt-0.5">
                  {user.dailyCalorieGoal.toLocaleString()}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Meals</p>
                <p className="font-display text-xl font-bold text-slate-900 dark:text-slate-50 tabular-nums mt-0.5">
                  {todayMeals.length}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 border-t border-slate-100 dark:border-slate-800/80">
              {MEAL_GROUPS.map((group) => (
                <div
                  key={group}
                  className="py-2.5 flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {group}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {groupTotals[group] > 0
                        ? `${groupTotals[group].toLocaleString()} kcal`
                        : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddMeal(group)}
                      aria-label={`Add ${group}`}
                      className="min-h-[36px] min-w-[36px] rounded-lg text-slate-400 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/40 flex items-center justify-center transition-colors"
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Today's Meals Grouped by Meal Type */}
      <section aria-label="Today's meals" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
            Today&apos;s meals
          </h2>
          {todayMeals.length > 0 && (
            <button
              type="button"
              onClick={onOpenLog}
              className="min-h-[44px] px-2 text-sm font-medium text-green-700 dark:text-green-400 hover:underline inline-flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              Full daily log
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {isLoading ? (
          <MealListSkeleton count={3} />
        ) : todayMeals.length === 0 ? (
          /* Friendly Empty State with Custom Illustration */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] px-6 py-12 text-center flex flex-col items-center">
            <svg
              width="124"
              height="108"
              viewBox="0 0 124 108"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="mb-5"
            >
              <circle
                cx="62"
                cy="56"
                r="42"
                className="fill-green-50 dark:fill-green-950/40"
              />
              <circle
                cx="62"
                cy="56"
                r="31"
                className="fill-white dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="2"
              />
              <circle
                cx="62"
                cy="56"
                r="22"
                className="stroke-slate-200 dark:stroke-slate-700"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              {/* Viewfinder framing marks */}
              <path
                d="M22 32V24C22 21.8 23.8 20 26 20H34M90 20H98C100.2 20 102 21.8 102 24V32M102 80V88C102 90.2 100.2 92 98 92H90M34 92H26C23.8 92 22 90.2 22 88V80"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Leaf / sprout accent */}
              <path
                d="M54 62C54 53 61 46 72 46C72 57 65 65 57 65C55 65 54 63.8 54 62Z"
                fill="#16A34A"
              />
              <path
                d="M52 67L63 56"
                stroke="#F0FDF4"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
              No meals yet. Snap your first one!
            </h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Take a quick photo of breakfast, lunch, or a snack to get an approximate calorie estimate in seconds.
            </p>
            <button
              type="button"
              onClick={() => onAddMeal()}
              className="mt-6 min-h-[48px] px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm inline-flex items-center gap-2 transition-colors shadow-sm"
            >
              <Camera size={18} aria-hidden="true" />
              Snap your first meal
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {MEAL_GROUPS.map((group) => {
              const itemsInGroup = todayMeals.filter((m) => m.mealType === group);
              if (itemsInGroup.length === 0) return null;
              return (
                <div key={group} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {group}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                      {groupTotals[group].toLocaleString()} kcal
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {itemsInGroup.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onEdit={onEditMeal}
                        onDelete={onDeleteMeal}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
        Calorie estimates are approximate and not medical advice.
      </p>
    </div>
  );
};
