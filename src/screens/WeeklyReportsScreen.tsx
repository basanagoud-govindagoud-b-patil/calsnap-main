import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { MealEntry, UserProfile } from '../types';
import { addDaysToDateKey, formatDateKey } from '../data/foodCatalog';
import { formatMonthDay, formatShortDay } from '../utils/storage';
import { getCalorieStatus } from '../components/ProgressRing';
import { ReportsSkeleton } from '../components/SkeletonLoader';

interface WeeklyReportsScreenProps {
  user: UserProfile;
  meals: MealEntry[];
  darkMode: boolean;
  onInspectDate: (dateKey: string) => void;
}

interface DayChartRow {
  dateKey: string;
  dayLabel: string;
  shortDate: string;
  calories: number;
  mealCount: number;
  status: 'empty' | 'under' | 'near' | 'over';
}

export const WeeklyReportsScreen: React.FC<WeeklyReportsScreenProps> = ({
  user,
  meals,
  darkMode,
  onInspectDate,
}) => {
  // weekOffset = 0 means last 7 days ending today; -1 means previous 7-day window, etc.
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(t);
  }, [weekOffset]);

  const todayKey = formatDateKey(new Date());

  const weekData: DayChartRow[] = useMemo(() => {
    const endDateKey = addDaysToDateKey(todayKey, weekOffset * 7);
    const rows: DayChartRow[] = [];

    for (let offset = -6; offset <= 0; offset++) {
      const dateKey = addDaysToDateKey(endDateKey, offset);
      const dayMeals = meals.filter((m) => m.date === dateKey);
      const calories = dayMeals.reduce((sum, m) => sum + m.totalCalories, 0);
      const status =
        calories === 0 ? 'empty' : getCalorieStatus(calories, user.dailyCalorieGoal);

      rows.push({
        dateKey,
        dayLabel: formatShortDay(dateKey),
        shortDate: formatMonthDay(dateKey),
        calories,
        mealCount: dayMeals.length,
        status,
      });
    }

    return rows;
  }, [meals, todayKey, user.dailyCalorieGoal, weekOffset]);

  const rangeLabel = `${weekData[0].shortDate} – ${weekData[6].shortDate}`;

  const loggedDays = weekData.filter((d) => d.calories > 0);
  const weeklyAverage =
    loggedDays.length > 0
      ? Math.round(loggedDays.reduce((s, d) => s + d.calories, 0) / loggedDays.length)
      : 0;

  const daysWithinGoal = loggedDays.filter(
    (d) => d.calories <= user.dailyCalorieGoal
  ).length;

  const highestDay = loggedDays.reduce<DayChartRow | null>(
    (max, row) => (!max || row.calories > max.calories ? row : max),
    null
  );

  const yMax = Math.max(
    user.dailyCalorieGoal * 1.2,
    ...(weekData.map((d) => d.calories * 1.15)),
    2200
  );

  const getBarFill = (status: DayChartRow['status']) => {
    if (status === 'empty') return darkMode ? '#1E293B' : '#E2E8F0';
    if (status === 'over') return '#DC4C4C';
    if (status === 'near') return '#F59E0B';
    return '#16A34A';
  };

  return (
    <div className="space-y-6">
      {/* Header + Week Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Weekly reports
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            A calm overview of your 7-day calorie pattern.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            aria-label="Previous week"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <div className="min-h-[44px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
            {rangeLabel}
          </div>

          <button
            type="button"
            onClick={() => setWeekOffset((w) => Math.min(0, w + 1))}
            disabled={weekOffset >= 0}
            aria-label="Next week"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <ReportsSkeleton />
      ) : (
        <>
          {/* Stat Cards */}
          <section
            aria-label="Weekly summary metrics"
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Weekly average
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                  {weeklyAverage > 0 ? weeklyAverage.toLocaleString() : '—'}
                </span>
                {weeklyAverage > 0 && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    kcal / day
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Across {loggedDays.length} logged {loggedDays.length === 1 ? 'day' : 'days'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Days within goal
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold text-green-700 dark:text-green-400 tabular-nums">
                  {daysWithinGoal}
                </span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                  of {loggedDays.length || 7}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Goal: {user.dailyCalorieGoal.toLocaleString()} kcal
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Highest day
              </p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                  {highestDay ? highestDay.calories.toLocaleString() : '—'}
                </span>
                {highestDay && (
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    kcal
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {highestDay
                  ? `${highestDay.dayLabel}, ${highestDay.shortDate}`
                  : 'No meals logged this week'}
              </p>
            </div>
          </section>

          {/* Recharts 7-Day Bar Chart with Dashed Goal Line */}
          <section
            aria-label="Daily calories bar chart"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                  Daily calories
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                  Dashed line shows your {user.dailyCalorieGoal.toLocaleString()} kcal daily goal
                </p>
              </div>

              {/* Clean text legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block" aria-hidden="true" />
                  Under 90%
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" aria-hidden="true" />
                  90–100%
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#DC4C4C] inline-block" aria-hidden="true" />
                  Over goal
                </span>
              </div>
            </div>

            {loggedDays.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                <p className="font-display font-semibold text-slate-800 dark:text-slate-200">
                  No meals recorded for {rangeLabel}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Log a meal on any day in this period to see your 7-day trend chart.
                </p>
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weekData}
                    margin={{ top: 18, right: 12, left: -12, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={darkMode ? '#1E293B' : '#E2E8F0'}
                    />
                    <XAxis
                      dataKey="dayLabel"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: darkMode ? '#94A3B8' : '#64748B',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    />
                    <YAxis
                      domain={[0, Math.ceil(yMax / 200) * 200]}
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: darkMode ? '#94A3B8' : '#64748B',
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      cursor={{
                        fill: darkMode ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)',
                      }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const row = payload[0].payload as DayChartRow;
                        const overBy = row.calories - user.dailyCalorieGoal;
                        return (
                          <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 shadow-lg text-xs">
                            <p className="font-semibold text-slate-900 dark:text-slate-50">
                              {row.dayLabel}, {row.shortDate}
                            </p>
                            <p className="font-display text-base font-bold text-slate-900 dark:text-slate-50 tabular-nums mt-0.5">
                              {row.calories.toLocaleString()} kcal
                            </p>
                            <p className="text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                              {row.calories === 0
                                ? 'No meals logged'
                                : overBy > 0
                                ? `${overBy.toLocaleString()} kcal over goal`
                                : `${Math.abs(overBy).toLocaleString()} kcal under goal`}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <ReferenceLine
                      y={user.dailyCalorieGoal}
                      stroke={darkMode ? '#94A3B8' : '#475569'}
                      strokeDasharray="6 4"
                      strokeWidth={1.5}
                      label={{
                        value: `Goal ${user.dailyCalorieGoal}`,
                        position: 'insideTopRight',
                        fill: darkMode ? '#CBD5E1' : '#475569',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <Bar dataKey="calories" radius={[8, 8, 2, 2]} maxBarSize={44}>
                      {weekData.map((entry) => (
                        <Cell key={entry.dateKey} fill={getBarFill(entry.status)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Daily Breakdown List */}
          <section
            aria-label="Day by day breakdown"
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                Daily breakdown
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {[...weekData].reverse().map((row) => (
                <button
                  key={row.dateKey}
                  type="button"
                  onClick={() => onInspectDate(row.dateKey)}
                  className="w-full min-h-[56px] px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {row.dayLabel}, {row.shortDate}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {row.mealCount === 0
                        ? 'No meals logged'
                        : `${row.mealCount} ${row.mealCount === 1 ? 'meal' : 'meals'}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-slate-50 tabular-nums">
                      {row.calories > 0 ? `${row.calories.toLocaleString()} kcal` : '—'}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-slate-400 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
        Calorie estimates are approximate and not medical advice.
      </p>
    </div>
  );
};
