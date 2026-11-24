import React, { useState } from 'react';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { MealEntry } from '../types';
import { formatTime12h } from '../utils/storage';
import { FoodImage } from './FoodImage';

interface MealCardProps {
  meal: MealEntry;
  showMealType?: boolean;
  onEdit: (meal: MealEntry) => void;
  onDelete: (mealId: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  showMealType = false,
  onEdit,
  onDelete,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const primaryTitle =
    meal.items.length === 0
      ? 'Logged meal'
      : meal.items.length === 1
      ? meal.items[0].name
      : `${meal.items[0].name} + ${meal.items.length - 1} more`;

  const totalGrams = meal.items.reduce((acc, item) => acc + Math.round(item.grams), 0);

  return (
    <article className="group bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 transition-colors duration-150 hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center gap-3.5">
        <FoodImage
          src={meal.photoUrl}
          alt={primaryTitle}
          className="w-16 h-16 sm:w-[70px] sm:h-[70px] rounded-xl"
          iconSize={22}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                {primaryTitle}
              </h3>

              {meal.items.length > 1 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {meal.items.map((it) => it.name).join(', ')}
                </p>
              )}

              {/* Unboxed metadata with subtle typographic separators */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {showMealType && (
                  <>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {meal.mealType}
                    </span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span>{formatTime12h(meal.time)}</span>
                {totalGrams > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{totalGrams} g</span>
                  </>
                )}
                {meal.overrideCalories != null && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-display text-lg font-bold text-slate-900 dark:text-slate-50 tabular-nums leading-tight">
                {meal.totalCalories.toLocaleString()}
              </div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                kcal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action row — large 44px touch targets */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-1.5">
        {confirmingDelete ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Remove this meal from your log?
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                aria-label="Cancel deleting meal"
              >
                <X size={14} aria-hidden="true" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(meal.id)}
                className="min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors"
                aria-label={`Confirm delete ${primaryTitle}`}
              >
                <Check size={14} aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(meal)}
              className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              aria-label={`Edit ${primaryTitle}`}
            >
              <Pencil size={14} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="min-h-[44px] px-3 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              aria-label={`Delete ${primaryTitle}`}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
};
