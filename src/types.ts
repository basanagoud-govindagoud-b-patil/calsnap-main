export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export type AppTab = 'home' | 'log' | 'reports' | 'profile';

export type AuthViewMode = 'login' | 'signup';

export interface FoodPrediction {
  label: string;
  confidence: number; // 0 to 1
  defaultGrams: number;
  kcalPer100g: number;
}

export interface MealItem {
  id: string;
  name: string;
  grams: number;
  defaultGrams: number;
  kcalPer100g: number;
  confidence?: number;
  predictions?: FoodPrediction[];
}

export interface MealEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD local date
  time: string; // HH:mm 24h
  mealType: MealType;
  photoUrl?: string;
  items: MealItem[];
  overrideCalories?: number | null;
  totalCalories: number;
  isManual?: boolean;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Prototype client-side encoded string
  dailyCalorieGoal: number; // 800 - 6000
  allowPhotoModelImprovement: boolean; // default false
  darkMode: boolean;
  onboardingCompleted: boolean;
  createdAt: number;
}

export interface FoodCatalogItem {
  id: string;
  name: string;
  category: string;
  defaultGrams: number;
  kcalPer100g: number;
}

export interface AnalyzeMealResponse {
  foodDetected: boolean;
  suggestedMealType?: MealType;
  items: Array<{
    predictions: FoodPrediction[];
  }>;
}

export function calculateItemCalories(kcalPer100g: number, grams: number): number {
  const safeKcal = Math.max(0, Number.isFinite(kcalPer100g) ? kcalPer100g : 0);
  const safeGrams = Math.max(0, Number.isFinite(grams) ? grams : 0);
  return Math.round(safeKcal * (safeGrams / 100));
}

export function calculateItemsTotalCalories(items: MealItem[]): number {
  return items.reduce((sum, item) => sum + calculateItemCalories(item.kcalPer100g, item.grams), 0);
}
