import React, { useState } from 'react';
import {
  Camera,
  SlidersHorizontal,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { FoodImage } from '../components/FoodImage';
import { SAMPLE_MEAL_IMAGES } from '../data/foodCatalog';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogIn: () => void;
  onTryDemo: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const PORTION_PREVIEWS = [
  { label: 'Small', grams: 240, kcal: 390 },
  { label: 'Medium', grams: 365, kcal: 595 },
  { label: 'Large', grams: 480, kcal: 782 },
] as const;

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onLogIn,
  onTryDemo,
  darkMode,
  onToggleDarkMode,
}) => {
  const [previewPortionIdx, setPreviewPortionIdx] = useState(1);
  const currentPortion = PORTION_PREVIEWS[previewPortionIdx];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar — 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a href="#top" aria-label="SnapCal home" className="whitespace-nowrap shrink-0">
            <BrandMark />
          </a>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#how-it-works"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-2"
            >
              How it works
            </a>
            <a
              href="#features"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-2"
            >
              Features
            </a>
            <a
              href="#privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-2"
            >
              Privacy
            </a>
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={onGetStarted}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 lg:pt-20 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Calm, photo-first nutrition tracking
              </p>

              <h1
                className="font-display font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.1]"
                style={{
                  fontSize: 'clamp(2.25rem, 4.2vw, 3.5rem)',
                  textWrap: 'balance',
                }}
              >
                Snap your meal. Know your calories.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Take a quick photo of what you are eating. SnapCal identifies the foods on your plate, estimates portions in seconds, and keeps a clear daily log without guilt or guesswork.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="min-h-[48px] px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-semibold text-sm sm:text-base inline-flex items-center gap-2 shadow-sm transition-all whitespace-nowrap shrink-0"
                >
                  Get started
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onLogIn}
                  className="min-h-[48px] px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold text-sm sm:text-base transition-colors whitespace-nowrap shrink-0"
                >
                  Log in
                </button>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={onTryDemo}
                  className="min-h-[44px] inline-flex items-center font-medium text-green-700 dark:text-green-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  Try interactive demo account
                </button>
                <span aria-hidden="true">·</span>
                <span>Works with camera or gallery</span>
                <span aria-hidden="true">·</span>
                <span>No guilt messaging</span>
              </div>
            </div>

            {/* Right Interactive Phone Mockup */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-[356px] rounded-[36px] bg-slate-900 dark:bg-slate-800 p-3 shadow-2xl shadow-slate-900/15 dark:shadow-black/50 border border-slate-800 dark:border-slate-700">
                <div className="rounded-[28px] bg-white dark:bg-slate-900 overflow-hidden">
                  {/* Mockup Status Bar */}
                  <div className="px-5 pt-3.5 pb-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    <span>12:48</span>
                    <span className="w-16 h-4 rounded-full bg-slate-900 dark:bg-slate-950" aria-hidden="true" />
                    <span>SnapCal</span>
                  </div>

                  {/* Meal Photo */}
                  <div className="px-4">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                      <FoodImage
                        src={SAMPLE_MEAL_IMAGES.salmonBowl}
                        alt="Mediterranean grilled salmon and quinoa bowl"
                        className="w-full h-full"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-3.5 text-white">
                        <p className="text-xs text-white/80">Identified · 94% match</p>
                        <p className="font-display font-semibold text-sm">
                          Salmon, Quinoa & Avocado Bowl
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Portion & Calorie Estimate */}
                  <div className="p-4 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Approximate total
                        </p>
                        <p className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 tabular-nums">
                          {currentPortion.kcal}{' '}
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            kcal
                          </span>
                        </p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                        {currentPortion.grams} g serving
                      </p>
                    </div>

                    {/* Interactive Portion Selector inside Mockup */}
                    <div
                      className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
                      role="group"
                      aria-label="Preview portion size"
                    >
                      {PORTION_PREVIEWS.map((preset, idx) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setPreviewPortionIdx(idx)}
                          className={`min-h-[38px] rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                            previewPortionIdx === idx
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Mini Daily Progress Summary */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">
                        Daily goal progress
                      </span>
                      <span className="font-semibold text-green-700 dark:text-green-400 tabular-nums">
                        {(760 + currentPortion.kcal).toLocaleString()} / 2,000 kcal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — 3 Steps */}
        <section
          id="how-it-works"
          className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-16 sm:py-20"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                style={{ textWrap: 'balance' }}
              >
                Three quick steps from plate to daily log
              </h2>
              <p className="mt-2.5 text-slate-600 dark:text-slate-300 text-base">
                Designed to take less than ten seconds at mealtime, with full control whenever you want to adjust details.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <span className="font-display text-sm font-semibold text-green-700 dark:text-green-400 tabular-nums">
                  01. Snap
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Take or upload a meal photo
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Use your camera on mobile or drag and drop a photo from your library. Supports JPEG, PNG, and HEIC photos up to 10 MB.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <span className="font-display text-sm font-semibold text-green-700 dark:text-green-400 tabular-nums">
                  02. Confirm
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Review foods and portions
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  See top AI matches with confidence scores, adjust Small, Medium, or Large servings by grams, or override calories directly.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
                <span className="font-display text-sm font-semibold text-green-700 dark:text-green-400 tabular-nums">
                  03. Track
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Follow calm daily and weekly trends
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Watch your daily ring update live and review 7-day bar charts with neutral, encouraging context—never red-alert guilt.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Asymmetric Bento Grid */}
        <section id="features" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
                style={{ textWrap: 'balance' }}
              >
                Built for real plates, not laboratory portions
              </h2>
              <p className="mt-2.5 text-slate-600 dark:text-slate-300 text-base">
                Every control is tuned for clarity, speed, and honest approximation.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Wide Feature 1 */}
              <div className="md:col-span-2 p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
                    <Layers size={22} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                      Multi-item meal recognition
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Plates rarely contain a single ingredient. SnapCal breaks bowls and dinners into individual editable rows—each with its top three food guesses, live gram slider, and instant search replacement.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <FoodImage
                    src={SAMPLE_MEAL_IMAGES.oatmeal}
                    alt="Oatmeal with berries"
                    className="w-full h-24 sm:h-28 rounded-xl"
                  />
                  <FoodImage
                    src={SAMPLE_MEAL_IMAGES.avocadoToast}
                    alt="Avocado toast with eggs"
                    className="w-full h-24 sm:h-28 rounded-xl"
                  />
                  <FoodImage
                    src={SAMPLE_MEAL_IMAGES.grilledChicken}
                    alt="Grilled chicken and sweet potatoes"
                    className="w-full h-24 sm:h-28 rounded-xl"
                  />
                </div>
              </div>

              {/* Narrow Feature 2 */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <SlidersHorizontal size={22} aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Live gram & portion controls
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Switch between Small, Medium, and Large presets or fine-tune exact grams. Calories recalculate live as you slide, with an override field whenever you know the exact label value.
                  </p>
                </div>
                <p className="mt-6 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Formula · kcal per 100 g × (grams / 100)
                </p>
              </div>

              {/* Narrow Feature 3 */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <div className="w-11 h-11 rounded-xl bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 flex items-center justify-center">
                  <BarChart3 size={22} aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Supportive weekly reports
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  See your 7-day intake alongside your daily goal line, weekly average, and days within goal—framed with calm, neutral insights.
                </p>
              </div>

              {/* Wide Feature 4 — Privacy */}
              <div
                id="privacy"
                className="md:col-span-2 p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2 max-w-lg">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <ShieldCheck size={22} aria-hidden="true" />
                  </div>
                  <h3 className="pt-1 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Your meal photos stay under your control
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Model-improvement photo sharing is off by default. Log manually without a photo anytime, and delete your account and log data in one click from Settings.
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="min-h-[48px] px-5 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Camera size={18} aria-hidden="true" />
                    Start logging free
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <BrandMark size="sm" />
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Calorie estimates are approximate and not medical advice. SnapCal is intended for general wellness awareness and is not a substitute for professional medical or nutritional guidance.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              {darkMode ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
              {darkMode ? 'Light mode' : 'Dark mode'}
            </button>
            <button
              type="button"
              onClick={onLogIn}
              className="min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-green-700 dark:hover:text-green-400 transition-colors whitespace-nowrap shrink-0"
            >
              Log in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
