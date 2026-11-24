import React from 'react';
import { CheckCircle2, Info, Sparkles } from 'lucide-react';

interface ProgressRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  compact?: boolean;
}

export type RingStatus = 'under' | 'near' | 'over';

export function getCalorieStatus(consumed: number, goal: number): RingStatus {
  if (goal <= 0) return 'under';
  const ratio = consumed / goal;
  if (ratio > 1) return 'over';
  if (ratio >= 0.9) return 'near';
  return 'under';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  consumed,
  goal,
  size = 216,
  strokeWidth = 15,
  compact = false,
}) => {
  const safeGoal = Math.max(1, goal);
  const safeConsumed = Math.max(0, Math.round(consumed));
  const rawPercent = (safeConsumed / safeGoal) * 100;
  const clampedPercent = Math.min(100, Math.max(0, rawPercent));
  const status = getCalorieStatus(safeConsumed, safeGoal);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (clampedPercent / 100) * circumference;

  const remaining = Math.max(0, safeGoal - safeConsumed);
  const overBy = Math.max(0, safeConsumed - safeGoal);

  const strokeColor =
    status === 'over'
      ? '#DC4C4C' // Soft red
      : status === 'near'
      ? '#F59E0B' // Warm amber
      : '#16A34A'; // Fresh green

  const statusTextClass =
    status === 'over'
      ? 'text-red-700 dark:text-red-300'
      : status === 'near'
      ? 'text-amber-700 dark:text-amber-300'
      : 'text-green-700 dark:text-green-400';

  const statusMessage =
    status === 'over'
      ? `You've gone ${overBy.toLocaleString()} kcal over today`
      : status === 'near'
      ? remaining === 0
        ? 'Right at your daily goal'
        : `Near your goal · ${remaining.toLocaleString()} kcal left`
      : `${remaining.toLocaleString()} kcal remaining today`;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
        role="progressbar"
        aria-valuenow={safeConsumed}
        aria-valuemin={0}
        aria-valuemax={safeGoal}
        aria-label={`Daily calories: ${safeConsumed} of ${safeGoal} kcal. ${statusMessage}`}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 650ms cubic-bezier(0.16, 1, 0.3, 1), stroke 300ms ease',
            }}
          />
        </svg>

        {/* Center Metrics */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {status === 'over' ? 'Consumed' : 'Remaining'}
          </span>
          <span
            className={`font-display ${
              compact ? 'text-2xl' : 'text-4xl'
            } font-bold tracking-tight text-slate-900 dark:text-slate-50 tabular-nums mt-0.5`}
          >
            {status === 'over'
              ? safeConsumed.toLocaleString()
              : remaining.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            kcal
          </span>
          {!compact && (
            <span className="mt-2 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {safeConsumed.toLocaleString()} / {safeGoal.toLocaleString()} goal
            </span>
          )}
        </div>
      </div>

      {/* Explicit non-hue-only status message */}
      {!compact && (
        <div className={`mt-4 flex items-center gap-1.5 text-sm font-medium ${statusTextClass}`}>
          {status === 'over' ? (
            <Info size={16} className="shrink-0" aria-hidden="true" />
          ) : status === 'near' ? (
            <Sparkles size={16} className="shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
          )}
          <span className="tabular-nums">{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
