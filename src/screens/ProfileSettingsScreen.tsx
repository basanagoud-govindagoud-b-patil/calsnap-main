import React, { useState } from 'react';
import {
  Check,
  AlertCircle,
  Moon,
  Sun,
  Shield,
  LogOut,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileSettingsScreenProps {
  user: UserProfile;
  darkMode: boolean;
  onUpdateUser: (updated: UserProfile) => void;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const MIN_GOAL = 800;
const MAX_GOAL = 6000;

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  user,
  darkMode,
  onUpdateUser,
  onToggleDarkMode,
  onLogout,
  onDeleteAccount,
}) => {
  const [goalInput, setGoalInput] = useState<string>(String(user.dailyCalorieGoal));
  const [goalError, setGoalError] = useState<string | null>(null);
  const [goalSaved, setGoalSaved] = useState(false);

  const [nameInput, setNameInput] = useState<string>(user.name);
  const [nameSaved, setNameSaved] = useState(false);

  const [helpOpen, setHelpOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const numericGoal = Number(goalInput);
  const isGoalValid =
    goalInput.trim() !== '' &&
    !Number.isNaN(numericGoal) &&
    numericGoal >= MIN_GOAL &&
    numericGoal <= MAX_GOAL;

  const handleGoalChange = (nextVal: string) => {
    setGoalInput(nextVal);
    setGoalSaved(false);
    const num = Number(nextVal);
    if (nextVal.trim() === '' || Number.isNaN(num)) {
      setGoalError('Please enter a number between 800 and 6,000 kcal.');
    } else if (num < MIN_GOAL || num > MAX_GOAL) {
      setGoalError(`Daily goal must be between ${MIN_GOAL.toLocaleString()} and ${MAX_GOAL.toLocaleString()} kcal.`);
    } else {
      setGoalError(null);
    }
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGoalValid) {
      setGoalError(`Daily goal must be between ${MIN_GOAL.toLocaleString()} and ${MAX_GOAL.toLocaleString()} kcal.`);
      return;
    }
    onUpdateUser({
      ...user,
      dailyCalorieGoal: Math.round(numericGoal),
    });
    setGoalSaved(true);
    window.setTimeout(() => setGoalSaved(false), 2400);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = nameInput.trim();
    if (!cleaned) return;
    onUpdateUser({
      ...user,
      name: cleaned,
    });
    setNameSaved(true);
    window.setTimeout(() => setNameSaved(false), 2400);
  };

  const handleTogglePrivacy = () => {
    onUpdateUser({
      ...user,
      allowPhotoModelImprovement: !user.allowPhotoModelImprovement,
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Profile &amp; settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your daily goal, appearance, and privacy preferences.
        </p>
      </div>

      {/* Daily Calorie Goal */}
      <section
        aria-label="Daily calorie goal"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-5 sm:p-6"
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                Daily calorie goal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Allowed range: 800 – 6,000 kcal per day
              </p>
            </div>
            <div className="font-display text-2xl font-bold text-green-700 dark:text-green-400 tabular-nums">
              {isGoalValid ? Math.round(numericGoal).toLocaleString() : '—'}{' '}
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                kcal
              </span>
            </div>
          </div>

          <input
            type="range"
            min={MIN_GOAL}
            max={MAX_GOAL}
            step={50}
            value={Math.min(MAX_GOAL, Math.max(MIN_GOAL, Number.isNaN(numericGoal) ? 2000 : numericGoal))}
            onChange={(e) => handleGoalChange(e.target.value)}
            aria-label="Daily calorie goal slider"
            className="w-full accent-green-600 h-2 cursor-pointer"
          />

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <label htmlFor="settings-goal-number" className="sr-only">
                Daily calorie goal number
              </label>
              <input
                id="settings-goal-number"
                type="number"
                min={MIN_GOAL}
                max={MAX_GOAL}
                value={goalInput}
                onChange={(e) => handleGoalChange(e.target.value)}
                aria-invalid={Boolean(goalError)}
                className={`w-full min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums ${
                  goalError
                    ? 'border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={!isGoalValid || Math.round(numericGoal) === user.dailyCalorieGoal}
              className="min-h-[48px] px-5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {goalSaved ? (
                <>
                  <Check size={16} aria-hidden="true" />
                  Saved
                </>
              ) : (
                'Save goal'
              )}
            </button>
          </div>

          {goalError && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <AlertCircle size={14} aria-hidden="true" />
              {goalError}
            </p>
          )}
        </form>
      </section>

      {/* Account Info */}
      <section
        aria-label="Account information"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-5 sm:p-6 space-y-4"
      >
        <h2 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
          Account
        </h2>

        <form onSubmit={handleSaveName} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="settings-name"
                className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Display name
              </label>
              <input
                id="settings-name"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameSaved(false);
                }}
                className="w-full min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="settings-email"
                className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Email address
              </label>
              <input
                id="settings-email"
                type="email"
                value={user.email}
                readOnly
                className="w-full min-h-[48px] px-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {nameInput.trim() !== user.name && nameInput.trim().length > 0 && (
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-colors"
            >
              Update display name
            </button>
          )}
          {nameSaved && (
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              Display name updated.
            </p>
          )}
        </form>
      </section>

      {/* Appearance & Privacy */}
      <section
        aria-label="Appearance and privacy"
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] divide-y divide-slate-100 dark:divide-slate-800"
      >
        {/* Dark Mode Toggle */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              {darkMode ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Dark mode
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Comfortable low-glare palette for evening logging.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            aria-label="Toggle dark mode"
            onClick={onToggleDarkMode}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              darkMode ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Privacy Toggle (Off by default) */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
              <Shield size={18} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Allow my photos to improve the model
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Off by default. When turned off, your meal photos are only used to estimate your current meal and are not shared for training.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={user.allowPhotoModelImprovement}
            aria-label="Allow my photos to improve the model"
            onClick={handleTogglePrivacy}
            className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              user.allowPhotoModelImprovement
                ? 'bg-green-600'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform ${
                user.allowPhotoModelImprovement ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Help Resources */}
        <div className="p-5 sm:p-6">
          <button
            type="button"
            onClick={() => setHelpOpen((prev) => !prev)}
            aria-expanded={helpOpen}
            className="w-full min-h-[44px] flex items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <HelpCircle size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Help &amp; nutrition resources
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  How estimates work, portion tips, and supportive care links
                </span>
              </span>
            </span>
            {helpOpen ? (
              <ChevronUp size={18} className="text-slate-400 shrink-0" aria-hidden="true" />
            ) : (
              <ChevronDown size={18} className="text-slate-400 shrink-0" aria-hidden="true" />
            )}
          </button>

          {helpOpen && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="font-semibold text-slate-900 dark:text-slate-100">
                  How SnapCal estimates calories:
                </strong>{' '}
                Visual food recognition identifies visible ingredients and estimates a default gram weight, then multiplies calories per 100 g by your chosen portion. Cooking oils, sauces, and hidden ingredients can affect accuracy—feel free to adjust grams or override calories anytime.
              </p>
              <p>
                <strong className="font-semibold text-slate-900 dark:text-slate-100">
                  Supportive nutrition guidance:
                </strong>{' '}
                For personalized medical or dietary advice, consider speaking with a Registered Dietitian (RD). If tracking food ever feels stressful, take a break—your wellbeing comes before any number.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                <a
                  href="https://www.eatright.org/find-a-nutrition-expert"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 dark:text-green-400 hover:underline py-1"
                >
                  Find a Registered Dietitian
                </a>
                <a
                  href="https://fdc.nal.usda.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 dark:text-green-400 hover:underline py-1"
                >
                  USDA FoodData Central
                </a>
                <a
                  href="https://www.nationaleatingdisorders.org/get-help/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 dark:text-green-400 hover:underline py-1"
                >
                  Supportive Eating Help Resources
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Account Actions */}
      <section
        aria-label="Session and data actions"
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2"
      >
        <button
          type="button"
          onClick={onLogout}
          className="min-h-[48px] px-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <LogOut size={17} aria-hidden="true" />
          Log out
        </button>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="min-h-[48px] px-5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100/70 dark:hover:bg-red-950/40 text-red-700 dark:text-red-400 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <Trash2 size={17} aria-hidden="true" />
          Delete account and data
        </button>
      </section>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center pt-2">
        Calorie estimates are approximate and not medical advice.
      </p>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-heading"
        >
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[20px] p-6 space-y-4 shadow-xl">
            <h3
              id="delete-account-heading"
              className="font-display text-lg font-bold text-slate-900 dark:text-slate-50"
            >
              Delete account and all meal data?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              This will permanently remove your profile, daily goal, and all saved meals from this device. This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Keep my account
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  onDeleteAccount();
                }}
                className="flex-1 min-h-[48px] rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
