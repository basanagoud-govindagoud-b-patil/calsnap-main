import { MealEntry, UserProfile } from '../types';
import { generateDemoMeals } from '../data/foodCatalog';

const USERS_KEY = 'snapcal_users_v1';
const SESSION_KEY = 'snapcal_session_user_id_v1';
const MEALS_KEY = 'snapcal_meals_v1';
const THEME_KEY = 'snapcal_theme_v1';

export const DEMO_USER_EMAIL = 'maya@snapcal.app';
export const DEMO_USER_ID = 'user-demo-maya';

function encodePassword(pw: string): string {
  // Simple deterministic obfuscation for local prototype only
  return btoa(unescape(encodeURIComponent(`snapcal::${pw}`)));
}

function safeReadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJSON<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadUsers(): UserProfile[] {
  return safeReadJSON<UserProfile[]>(USERS_KEY, []);
}

export function saveUsers(users: UserProfile[]): void {
  safeWriteJSON(USERS_KEY, users);
}

export function loadMeals(): MealEntry[] {
  return safeReadJSON<MealEntry[]>(MEALS_KEY, []);
}

export function saveMeals(meals: MealEntry[]): boolean {
  return safeWriteJSON(MEALS_KEY, meals);
}

export function getActiveUserId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setActiveUserId(userId: string | null): void {
  try {
    if (userId) {
      localStorage.setItem(SESSION_KEY, userId);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // Ignore storage restriction errors
  }
}

export function loadThemePreference(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return false;
  } catch {
    return false;
  }
}

export function saveThemePreference(isDark: boolean): void {
  try {
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  } catch {
    // Ignore storage restriction errors
  }
}

export function ensureDemoAccount(): { user: UserProfile; meals: MealEntry[] } {
  const users = loadUsers();
  let demoUser = users.find((u) => u.id === DEMO_USER_ID || u.email === DEMO_USER_EMAIL);

  if (!demoUser) {
    demoUser = {
      id: DEMO_USER_ID,
      name: 'Maya Chen',
      email: DEMO_USER_EMAIL,
      passwordHash: encodePassword('snapcal123'),
      dailyCalorieGoal: 2000,
      allowPhotoModelImprovement: false,
      darkMode: loadThemePreference(),
      onboardingCompleted: true,
      createdAt: Date.now() - 86400000 * 14,
    };
    saveUsers([...users, demoUser]);
  }

  const allMeals = loadMeals();
  const hasDemoMeals = allMeals.some((m) => m.userId === demoUser!.id);
  let updatedMeals = allMeals;

  if (!hasDemoMeals) {
    const seeded = generateDemoMeals(demoUser.id);
    updatedMeals = [...allMeals, ...seeded];
    saveMeals(updatedMeals);
  }

  return {
    user: demoUser,
    meals: updatedMeals.filter((m) => m.userId === demoUser!.id),
  };
}

export function registerUser(params: {
  name: string;
  email: string;
  password: string;
  darkMode: boolean;
}): { user?: UserProfile; error?: string } {
  const normalizedEmail = params.email.trim().toLowerCase();
  const users = loadUsers();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { error: 'An account with this email already exists. Try logging in instead.' };
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: params.name.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    passwordHash: encodePassword(params.password),
    dailyCalorieGoal: 2000,
    allowPhotoModelImprovement: false,
    darkMode: params.darkMode,
    onboardingCompleted: false,
    createdAt: Date.now(),
  };

  saveUsers([...users, newUser]);
  setActiveUserId(newUser.id);
  return { user: newUser };
}

export function authenticateUser(params: {
  email: string;
  password: string;
}): { user?: UserProfile; error?: string } {
  const normalizedEmail = params.email.trim().toLowerCase();

  // Ensure demo account exists if the user tries demo credentials directly
  if (normalizedEmail === DEMO_USER_EMAIL) {
    ensureDemoAccount();
  }

  const users = loadUsers();
  const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!found) {
    return { error: 'We could not find an account with that email.' };
  }

  if (found.passwordHash !== encodePassword(params.password)) {
    return { error: 'That password does not match. Please try again or reset it.' };
  }

  setActiveUserId(found.id);
  return { user: found };
}

export function updateUserProfile(updated: UserProfile): void {
  const users = loadUsers();
  const next = users.map((u) => (u.id === updated.id ? updated : u));
  saveUsers(next);
}

export function deleteUserAndAllData(userId: string): void {
  const users = loadUsers().filter((u) => u.id !== userId);
  saveUsers(users);

  const meals = loadMeals().filter((m) => m.userId !== userId);
  saveMeals(meals);

  if (getActiveUserId() === userId) {
    setActiveUserId(null);
  }
}

export function formatReadableDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatShortDay(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatMonthDay(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getCurrentTime24(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
