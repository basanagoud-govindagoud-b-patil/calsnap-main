import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import { AppTab, AuthViewMode, MealEntry, MealType, UserProfile } from './types';
import { formatDateKey } from './data/foodCatalog';
import {
  deleteUserAndAllData,
  ensureDemoAccount,
  getActiveUserId,
  loadMeals,
  loadThemePreference,
  loadUsers,
  saveMeals,
  saveThemePreference,
  setActiveUserId,
  updateUserProfile,
} from './utils/storage';
import { AppShell } from './components/AppShell';
import { LandingPage } from './screens/LandingPage';
import { AuthScreen, OnboardingGoalStep } from './screens/AuthScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { DailyLogScreen } from './screens/DailyLogScreen';
import { WeeklyReportsScreen } from './screens/WeeklyReportsScreen';
import { ProfileSettingsScreen } from './screens/ProfileSettingsScreen';
import { AddMealFlow } from './screens/AddMealFlow';

type UnauthView = 'landing' | 'auth';

interface AddMealModalState {
  open: boolean;
  date?: string;
  mealType?: MealType;
  manual?: boolean;
  editingMeal?: MealEntry | null;
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => loadThemePreference());
  const [unauthView, setUnauthView] = useState<UnauthView>('landing');
  const [authMode, setAuthMode] = useState<AuthViewMode>('signup');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedLogDate, setSelectedLogDate] = useState<string>(() =>
    formatDateKey(new Date())
  );
  const [addMealModal, setAddMealModal] = useState<AddMealModalState>({
    open: false,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveThemePreference(darkMode);
  }, [darkMode]);

  // Restore active session on mount
  useEffect(() => {
    const activeId = getActiveUserId();
    if (!activeId) return;
    const users = loadUsers();
    const found = users.find((u) => u.id === activeId);
    if (found) {
      setCurrentUser(found);
      setShowOnboarding(!found.onboardingCompleted);
      const allMeals = loadMeals();
      setMeals(allMeals.filter((m) => m.userId === found.id));
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (currentUser) {
        const updated = { ...currentUser, darkMode: next };
        setCurrentUser(updated);
        updateUserProfile(updated);
      }
      return next;
    });
  };

  const handleOpenAuth = (mode: AuthViewMode) => {
    setAuthMode(mode);
    setUnauthView('auth');
  };

  const handleTryDemo = () => {
    const { user, meals: demoMeals } = ensureDemoAccount();
    setActiveUserId(user.id);
    setCurrentUser(user);
    setMeals(demoMeals);
    setShowOnboarding(false);
    setActiveTab('home');
    setSelectedLogDate(formatDateKey(new Date()));
    showToast('Signed in to demo account');
  };

  const handleAuthSuccess = (user: UserProfile, isNewSignup: boolean) => {
    setCurrentUser(user);
    const allMeals = loadMeals();
    setMeals(allMeals.filter((m) => m.userId === user.id));
    setShowOnboarding(isNewSignup && !user.onboardingCompleted);
    setActiveTab('home');
    setSelectedLogDate(formatDateKey(new Date()));
  };

  const handleCompleteOnboarding = (goal: number) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      dailyCalorieGoal: goal,
      onboardingCompleted: true,
    };
    setCurrentUser(updated);
    updateUserProfile(updated);
    setShowOnboarding(false);
    showToast(`Daily goal set to ${goal.toLocaleString()} kcal`);
  };

  const handleSkipOnboarding = () => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      onboardingCompleted: true,
    };
    setCurrentUser(updated);
    updateUserProfile(updated);
    setShowOnboarding(false);
  };

  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    updateUserProfile(updated);
  };

  const persistUserMeals = (nextUserMeals: MealEntry[], userId: string): boolean => {
    const otherUsersMeals = loadMeals().filter((m) => m.userId !== userId);
    const combined = [...otherUsersMeals, ...nextUserMeals];
    const ok = saveMeals(combined);
    if (ok) return true;

    // If localStorage quota was exceeded due to a large inline photo, strip inline data URL from newest photo
    const trimmed = nextUserMeals.map((m, idx) =>
      idx === nextUserMeals.length - 1 && m.photoUrl?.startsWith('data:')
        ? { ...m, photoUrl: undefined }
        : m
    );
    return saveMeals([...otherUsersMeals, ...trimmed]);
  };

  const handleSaveMeal = (meal: MealEntry, isEdit: boolean) => {
    if (!currentUser) return;
    const nextUserMeals = isEdit
      ? meals.map((m) => (m.id === meal.id ? meal : m))
      : [...meals, meal];

    setMeals(nextUserMeals);
    persistUserMeals(nextUserMeals, currentUser.id);
    setAddMealModal({ open: false });
    showToast(isEdit ? 'Meal updated' : 'Meal saved to your log');
  };

  const handleDeleteMeal = (mealId: string) => {
    if (!currentUser) return;
    const nextUserMeals = meals.filter((m) => m.id !== mealId);
    setMeals(nextUserMeals);
    persistUserMeals(nextUserMeals, currentUser.id);
    showToast('Meal removed');
  };

  const handleLogout = () => {
    setActiveUserId(null);
    setCurrentUser(null);
    setMeals([]);
    setShowOnboarding(false);
    setUnauthView('landing');
    showToast('You have been logged out');
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    deleteUserAndAllData(currentUser.id);
    setCurrentUser(null);
    setMeals([]);
    setShowOnboarding(false);
    setUnauthView('landing');
    showToast('Your account and meal data were deleted');
  };

  const openAddMeal = (options?: {
    date?: string;
    mealType?: MealType;
    manual?: boolean;
    editingMeal?: MealEntry | null;
  }) => {
    setAddMealModal({
      open: true,
      date: options?.date,
      mealType: options?.mealType,
      manual: options?.manual,
      editingMeal: options?.editingMeal ?? null,
    });
  };

  const handleInspectReportDate = (dateKey: string) => {
    setSelectedLogDate(dateKey);
    setActiveTab('log');
  };

  return (
    <>
      {!currentUser ? (
        unauthView === 'landing' ? (
          <LandingPage
            onGetStarted={() => handleOpenAuth('signup')}
            onLogIn={() => handleOpenAuth('login')}
            onTryDemo={handleTryDemo}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
          />
        ) : (
          <AuthScreen
            initialMode={authMode}
            darkMode={darkMode}
            onBackToLanding={() => setUnauthView('landing')}
            onAuthSuccess={handleAuthSuccess}
            onTryDemo={handleTryDemo}
          />
        )
      ) : showOnboarding ? (
        <OnboardingGoalStep
          userName={currentUser.name.split(' ')[0] || 'there'}
          initialGoal={currentUser.dailyCalorieGoal}
          onComplete={handleCompleteOnboarding}
          onSkip={handleSkipOnboarding}
        />
      ) : (
        <AppShell
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddMeal={() => openAddMeal()}
          user={currentUser}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'home' && (
                <DashboardScreen
                  user={currentUser}
                  meals={meals}
                  onAddMeal={(mealType) => openAddMeal({ mealType })}
                  onEditMeal={(meal) => openAddMeal({ editingMeal: meal })}
                  onDeleteMeal={handleDeleteMeal}
                  onOpenLog={() => {
                    setSelectedLogDate(formatDateKey(new Date()));
                    setActiveTab('log');
                  }}
                />
              )}

              {activeTab === 'log' && (
                <DailyLogScreen
                  user={currentUser}
                  meals={meals}
                  selectedDate={selectedLogDate}
                  onSelectDate={setSelectedLogDate}
                  onSnapMeal={(dateKey) => openAddMeal({ date: dateKey })}
                  onAddManual={(dateKey) => openAddMeal({ date: dateKey, manual: true })}
                  onEditMeal={(meal) => openAddMeal({ editingMeal: meal })}
                  onDeleteMeal={handleDeleteMeal}
                />
              )}

              {activeTab === 'reports' && (
                <WeeklyReportsScreen
                  user={currentUser}
                  meals={meals}
                  darkMode={darkMode}
                  onInspectDate={handleInspectReportDate}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileSettingsScreen
                  user={currentUser}
                  darkMode={darkMode}
                  onUpdateUser={handleUpdateUser}
                  onToggleDarkMode={handleToggleDarkMode}
                  onLogout={handleLogout}
                  onDeleteAccount={handleDeleteAccount}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </AppShell>
      )}

      {/* Add / Edit Meal Modal */}
      {currentUser && addMealModal.open && (
        <AddMealFlow
          userId={currentUser.id}
          initialDate={addMealModal.date}
          initialMealType={addMealModal.mealType}
          initialManual={addMealModal.manual}
          editingMeal={addMealModal.editingMeal}
          onClose={() => setAddMealModal({ open: false })}
          onSaveMeal={handleSaveMeal}
        />
      )}

      {/* Calm Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium shadow-xl flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 size={16} className="text-green-400 dark:text-green-600 shrink-0" aria-hidden="true" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
