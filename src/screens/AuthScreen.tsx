import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AuthViewMode, UserProfile } from '../types';
import { BrandMark } from '../components/BrandMark';
import { authenticateUser, registerUser } from '../utils/storage';

interface AuthScreenProps {
  initialMode: AuthViewMode;
  darkMode: boolean;
  onBackToLanding: () => void;
  onAuthSuccess: (user: UserProfile, isNewSignup: boolean) => void;
  onTryDemo: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode,
  darkMode,
  onBackToLanding,
  onAuthSuccess,
  onTryDemo,
}) => {
  const [mode, setMode] = useState<AuthViewMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password inline view
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const validateFields = () => {
    const errors: { email?: string; password?: string } = {};
    if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateFields()) return;

    if (mode === 'signup') {
      const result = registerUser({
        name,
        email,
        password,
        darkMode,
      });
      if (result.error || !result.user) {
        setFormError(result.error || 'Could not create your account.');
        return;
      }
      onAuthSuccess(result.user, true);
    } else {
      const result = authenticateUser({ email, password });
      if (result.error || !result.user) {
        setFormError(result.error || 'Could not log in.');
        return;
      }
      onAuthSuccess(result.user, false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!EMAIL_REGEX.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setForgotSent(true);
  };

  const switchMode = (nextMode: AuthViewMode) => {
    setMode(nextMode);
    setFormError(null);
    setFieldErrors({});
    setShowForgot(false);
    setForgotSent(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="max-w-5xl w-full mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLanding}
          className="min-h-[44px] px-2 -ml-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>
        <BrandMark size="sm" />
        <div className="w-16" aria-hidden="true" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-6 sm:p-8 shadow-sm">
          {showForgot ? (
            <div className="space-y-5">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
                  Reset your password
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  Enter your email and we will send instructions to set a new password.
                </p>
              </div>

              {forgotSent ? (
                <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="text-green-700 dark:text-green-400 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm text-green-900 dark:text-green-200">
                    <p className="font-semibold">Reset link sent</p>
                    <p className="mt-1 text-green-800/90 dark:text-green-300/90">
                      If an account exists for <span className="font-medium">{forgotEmail}</span>, check your inbox for a password reset link.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Email address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setForgotError(null);
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm"
                    />
                    {forgotError && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle size={13} aria-hidden="true" />
                        {forgotError}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
                  >
                    Send reset instructions
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setForgotSent(false);
                }}
                className="w-full min-h-[44px] rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Return to log in
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {mode === 'signup' ? 'Create your SnapCal account' : 'Welcome back'}
                </h1>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  {mode === 'signup'
                    ? 'Start tracking meals with calm, photo-first clarity.'
                    : 'Log in to pick up right where you left off.'}
                </p>
              </div>

              {/* Mode toggle */}
              <div
                className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
                role="tablist"
                aria-label="Authentication mode"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'signup'}
                  onClick={() => switchMode('signup')}
                  className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Sign up
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === 'login'}
                  onClick={() => switchMode('login')}
                  className={`min-h-[44px] rounded-lg text-sm font-semibold transition-colors ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Log in
                </button>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-sm text-red-700 dark:text-red-300 flex items-start gap-2.5"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      First name <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex"
                      autoComplete="given-name"
                      className="w-full min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email address
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm ${
                      fieldErrors.email
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={13} aria-hidden="true" />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password"
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setShowForgot(true);
                        }}
                        className="text-xs font-medium text-green-700 dark:text-green-400 hover:underline py-1"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="auth-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="At least 8 characters"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      aria-invalid={Boolean(fieldErrors.password)}
                      className={`w-full min-h-[48px] pl-4 pr-12 rounded-xl bg-slate-50 dark:bg-slate-950 border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm ${
                        fieldErrors.password
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg"
                    >
                      {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                    </button>
                  </div>
                  {fieldErrors.password ? (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={13} aria-hidden="true" />
                      {fieldErrors.password}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Minimum 8 characters.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm"
                >
                  {mode === 'signup' ? 'Create account' : 'Log in'}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
                    or explore instantly
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onTryDemo}
                className="w-full min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles size={16} className="text-green-600 dark:text-green-400" aria-hidden="true" />
                Continue with demo account
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface OnboardingGoalModalProps {
  userName: string;
  initialGoal: number;
  onComplete: (goal: number) => void;
  onSkip: () => void;
}

const GOAL_PRESETS = [
  { label: 'Lighter', kcal: 1600 },
  { label: 'Balanced', kcal: 2000 },
  { label: 'Active', kcal: 2400 },
  { label: 'High energy', kcal: 2800 },
];

export const OnboardingGoalStep: React.FC<OnboardingGoalModalProps> = ({
  userName,
  initialGoal,
  onComplete,
  onSkip,
}) => {
  const [goal, setGoal] = useState(initialGoal);
  const [error, setError] = useState<string | null>(null);

  const handleNumberChange = (val: string) => {
    const num = Number(val);
    setGoal(Number.isNaN(num) ? 0 : num);
    if (num < 800 || num > 6000) {
      setError('Please choose a goal between 800 and 6,000 kcal.');
    } else {
      setError(null);
    }
  };

  const handleContinue = () => {
    if (goal < 800 || goal > 6000) {
      setError('Please choose a goal between 800 and 6,000 kcal.');
      return;
    }
    onComplete(Math.round(goal));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <BrandMark size="sm" />
          <button
            type="button"
            onClick={onSkip}
            className="min-h-[44px] px-3 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Skip for now
          </button>
        </div>

        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Set a daily calorie target, {userName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Pick a comfortable starting point. You can adjust this anytime in Profile & Settings.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800 text-center">
          <div className="font-display text-4xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
            {goal.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            kcal per day
          </div>

          <input
            type="range"
            min={800}
            max={6000}
            step={50}
            value={Math.min(6000, Math.max(800, goal))}
            onChange={(e) => {
              setGoal(Number(e.target.value));
              setError(null);
            }}
            aria-label="Daily calorie goal slider"
            className="w-full mt-5 accent-green-600 h-2 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-400 tabular-nums mt-1.5">
            <span>800 kcal</span>
            <span>6,000 kcal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GOAL_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setGoal(preset.kcal);
                setError(null);
              }}
              className={`min-h-[48px] px-3 py-2 rounded-xl border text-center transition-colors ${
                goal === preset.kcal
                  ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="block text-xs font-medium">{preset.label}</span>
              <span className="block text-xs font-semibold tabular-nums mt-0.5">
                {preset.kcal.toLocaleString()}
              </span>
            </button>
          ))}
        </div>

        <div>
          <label
            htmlFor="onboarding-goal-input"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5"
          >
            Or type an exact daily goal (800 – 6,000 kcal)
          </label>
          <input
            id="onboarding-goal-input"
            type="number"
            min={800}
            max={6000}
            value={goal || ''}
            onChange={(e) => handleNumberChange(e.target.value)}
            className="w-full min-h-[48px] px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm tabular-nums"
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 min-h-[48px] rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
          >
            Save goal and continue
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Calorie estimates are approximate and not medical advice.
        </p>
      </div>
    </div>
  );
};
