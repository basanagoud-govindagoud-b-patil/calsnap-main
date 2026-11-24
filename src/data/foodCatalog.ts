import { AnalyzeMealResponse, FoodCatalogItem, MealEntry, MealType } from '../types';

export const SAMPLE_MEAL_IMAGES = {
  salmonBowl: '/src/assets/images/hero_bowl_photo_1795497600952.jpg',
  oatmeal: '/src/assets/images/meal_oatmeal_berries_1795497596577.jpg',
  avocadoToast: '/src/assets/images/meal_avocado_toast_1795497596777.jpg',
  grilledChicken: '/src/assets/images/meal_grilled_chicken_1795497619035.jpg',
  greekYogurt: '/src/assets/images/meal_greek_yogurt_1795497596611.jpg',
} as const;

export interface SamplePhotoOption {
  id: string;
  title: string;
  subtitle: string;
  mealType: MealType;
  imageUrl: string;
  fallbackResponse: AnalyzeMealResponse;
}

export const SAMPLE_PHOTO_OPTIONS: SamplePhotoOption[] = [
  {
    id: 'salmon-bowl',
    title: 'Salmon & Quinoa Bowl',
    subtitle: 'Lunch · Multi-item plate',
    mealType: 'Lunch',
    imageUrl: SAMPLE_MEAL_IMAGES.salmonBowl,
    fallbackResponse: {
      foodDetected: true,
      suggestedMealType: 'Lunch',
      items: [
        {
          predictions: [
            { label: 'Grilled Salmon Fillet', confidence: 0.94, defaultGrams: 140, kcalPer100g: 208 },
            { label: 'Baked Trout Fillet', confidence: 0.68, defaultGrams: 140, kcalPer100g: 190 },
            { label: 'Seared Tuna Steak', confidence: 0.34, defaultGrams: 140, kcalPer100g: 184 },
          ],
        },
        {
          predictions: [
            { label: 'Cooked Quinoa & Chickpea Salad', confidence: 0.89, defaultGrams: 160, kcalPer100g: 132 },
            { label: 'Couscous Herb Salad', confidence: 0.54, defaultGrams: 160, kcalPer100g: 145 },
            { label: 'Brown Rice Pilaf', confidence: 0.31, defaultGrams: 160, kcalPer100g: 123 },
          ],
        },
        {
          predictions: [
            { label: 'Sliced Fresh Avocado', confidence: 0.96, defaultGrams: 65, kcalPer100g: 160 },
            { label: 'Guacamole', confidence: 0.42, defaultGrams: 65, kcalPer100g: 155 },
            { label: 'Edamame Beans', confidence: 0.18, defaultGrams: 65, kcalPer100g: 121 },
          ],
        },
      ],
    },
  },
  {
    id: 'avocado-toast',
    title: 'Avocado Toast & Eggs',
    subtitle: 'Breakfast · Sourdough & poached eggs',
    mealType: 'Breakfast',
    imageUrl: SAMPLE_MEAL_IMAGES.avocadoToast,
    fallbackResponse: {
      foodDetected: true,
      suggestedMealType: 'Breakfast',
      items: [
        {
          predictions: [
            { label: 'Sourdough Avocado Toast', confidence: 0.93, defaultGrams: 150, kcalPer100g: 215 },
            { label: 'Whole Grain Toast with Guacamole', confidence: 0.71, defaultGrams: 150, kcalPer100g: 205 },
            { label: 'Rye Bread with Herb Spread', confidence: 0.29, defaultGrams: 140, kcalPer100g: 195 },
          ],
        },
        {
          predictions: [
            { label: 'Poached Eggs (2 large)', confidence: 0.95, defaultGrams: 100, kcalPer100g: 143 },
            { label: 'Soft-Boiled Eggs', confidence: 0.76, defaultGrams: 100, kcalPer100g: 155 },
            { label: 'Fried Eggs', confidence: 0.38, defaultGrams: 100, kcalPer100g: 196 },
          ],
        },
      ],
    },
  },
  {
    id: 'grilled-chicken',
    title: 'Herb Chicken & Sweet Potato',
    subtitle: 'Dinner · Balanced plate',
    mealType: 'Dinner',
    imageUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
    fallbackResponse: {
      foodDetected: true,
      suggestedMealType: 'Dinner',
      items: [
        {
          predictions: [
            { label: 'Herb-Grilled Chicken Breast', confidence: 0.95, defaultGrams: 165, kcalPer100g: 165 },
            { label: 'Roasted Turkey Breast', confidence: 0.64, defaultGrams: 165, kcalPer100g: 147 },
            { label: 'Pan-Seared Pork Tenderloin', confidence: 0.28, defaultGrams: 165, kcalPer100g: 143 },
          ],
        },
        {
          predictions: [
            { label: 'Roasted Sweet Potato Cubes', confidence: 0.91, defaultGrams: 130, kcalPer100g: 112 },
            { label: 'Roasted Butternut Squash', confidence: 0.58, defaultGrams: 130, kcalPer100g: 76 },
            { label: 'Roasted Carrots', confidence: 0.25, defaultGrams: 120, kcalPer100g: 68 },
          ],
        },
        {
          predictions: [
            { label: 'Steamed Broccoli Florets', confidence: 0.97, defaultGrams: 95, kcalPer100g: 35 },
            { label: 'Roasted Broccolini', confidence: 0.62, defaultGrams: 95, kcalPer100g: 48 },
            { label: 'Steamed Green Beans', confidence: 0.21, defaultGrams: 95, kcalPer100g: 31 },
          ],
        },
      ],
    },
  },
  {
    id: 'greek-yogurt',
    title: 'Greek Yogurt Parfait',
    subtitle: 'Snack · Granola, almonds & berries',
    mealType: 'Snack',
    imageUrl: SAMPLE_MEAL_IMAGES.greekYogurt,
    fallbackResponse: {
      foodDetected: true,
      suggestedMealType: 'Snack',
      items: [
        {
          predictions: [
            { label: 'Plain Greek Yogurt with Honey', confidence: 0.92, defaultGrams: 170, kcalPer100g: 97 },
            { label: 'Vanilla Skyr Yogurt', confidence: 0.69, defaultGrams: 170, kcalPer100g: 85 },
            { label: 'Cottage Cheese Bowl', confidence: 0.32, defaultGrams: 170, kcalPer100g: 98 },
          ],
        },
        {
          predictions: [
            { label: 'Toasted Oat Granola & Almonds', confidence: 0.87, defaultGrams: 40, kcalPer100g: 471 },
            { label: 'Muesli Crunch', confidence: 0.61, defaultGrams: 40, kcalPer100g: 390 },
            { label: 'Trail Mix', confidence: 0.35, defaultGrams: 40, kcalPer100g: 462 },
          ],
        },
      ],
    },
  },
];

export const FOOD_CATALOG: FoodCatalogItem[] = [
  // Breakfast
  { id: 'oatmeal-berries', name: 'Oatmeal with Fresh Berries & Chia', category: 'Breakfast', defaultGrams: 280, kcalPer100g: 92 },
  { id: 'avocado-toast', name: 'Sourdough Avocado Toast', category: 'Breakfast', defaultGrams: 150, kcalPer100g: 215 },
  { id: 'poached-eggs', name: 'Poached Eggs', category: 'Breakfast', defaultGrams: 100, kcalPer100g: 143 },
  { id: 'scrambled-eggs', name: 'Scrambled Eggs', category: 'Breakfast', defaultGrams: 120, kcalPer100g: 149 },
  { id: 'omelette-veggie', name: 'Vegetable Omelette', category: 'Breakfast', defaultGrams: 180, kcalPer100g: 132 },
  { id: 'greek-yogurt', name: 'Greek Yogurt (2% Plain)', category: 'Breakfast', defaultGrams: 170, kcalPer100g: 73 },
  { id: 'granola', name: 'Toasted Oat Granola', category: 'Breakfast', defaultGrams: 45, kcalPer100g: 471 },
  { id: 'pancakes', name: 'Buttermilk Pancakes', category: 'Breakfast', defaultGrams: 150, kcalPer100g: 227 },
  { id: 'french-toast', name: 'Whole Wheat French Toast', category: 'Breakfast', defaultGrams: 140, kcalPer100g: 229 },
  { id: 'bagel-cream-cheese', name: 'Bagel with Cream Cheese', category: 'Breakfast', defaultGrams: 130, kcalPer100g: 285 },
  { id: 'smoothie-berry', name: 'Mixed Berry Protein Smoothie', category: 'Breakfast', defaultGrams: 350, kcalPer100g: 74 },
  { id: 'overnight-oats', name: 'Peanut Butter Overnight Oats', category: 'Breakfast', defaultGrams: 250, kcalPer100g: 148 },
  { id: 'cottage-cheese', name: 'Low-Fat Cottage Cheese', category: 'Breakfast', defaultGrams: 150, kcalPer100g: 82 },
  { id: 'latte-oat', name: 'Oat Milk Latte', category: 'Beverages', defaultGrams: 300, kcalPer100g: 45 },
  { id: 'black-coffee', name: 'Black Coffee / Americano', category: 'Beverages', defaultGrams: 240, kcalPer100g: 2 },

  // Proteins
  { id: 'grilled-chicken', name: 'Herb-Grilled Chicken Breast', category: 'Protein', defaultGrams: 165, kcalPer100g: 165 },
  { id: 'grilled-salmon', name: 'Grilled Salmon Fillet', category: 'Protein', defaultGrams: 140, kcalPer100g: 208 },
  { id: 'baked-cod', name: 'Lemon Baked Cod', category: 'Protein', defaultGrams: 150, kcalPer100g: 105 },
  { id: 'tofu-stirfry', name: 'Crispy Baked Tofu', category: 'Protein', defaultGrams: 140, kcalPer100g: 144 },
  { id: 'turkey-breast', name: 'Roasted Turkey Breast', category: 'Protein', defaultGrams: 140, kcalPer100g: 147 },
  { id: 'steak-sirloin', name: 'Grilled Sirloin Steak', category: 'Protein', defaultGrams: 170, kcalPer100g: 244 },
  { id: 'shrimp-garlic', name: 'Garlic Sauteed Shrimp', category: 'Protein', defaultGrams: 130, kcalPer100g: 119 },
  { id: 'lentil-soup', name: 'Red Lentil Soup', category: 'Protein', defaultGrams: 300, kcalPer100g: 76 },
  { id: 'chickpea-curry', name: 'Chickpea & Spinach Curry', category: 'Protein', defaultGrams: 260, kcalPer100g: 138 },
  { id: 'black-beans', name: 'Seasoned Black Beans', category: 'Protein', defaultGrams: 130, kcalPer100g: 132 },

  // Bowls, Salads & Mains
  { id: 'caesar-salad', name: 'Grilled Chicken Caesar Salad', category: 'Meals', defaultGrams: 280, kcalPer100g: 158 },
  { id: 'med-bowl', name: 'Mediterranean Grain Bowl', category: 'Meals', defaultGrams: 360, kcalPer100g: 146 },
  { id: 'poke-bowl', name: 'Salmon Poke Bowl', category: 'Meals', defaultGrams: 380, kcalPer100g: 152 },
  { id: 'burrito-bowl', name: 'Chicken Burrito Bowl', category: 'Meals', defaultGrams: 400, kcalPer100g: 148 },
  { id: 'pasta-marinara', name: 'Spaghetti with Marinara & Basil', category: 'Meals', defaultGrams: 280, kcalPer100g: 134 },
  { id: 'pasta-pesto', name: 'Penne with Basil Pesto', category: 'Meals', defaultGrams: 260, kcalPer100g: 215 },
  { id: 'margherita-pizza', name: 'Margherita Pizza (2 slices)', category: 'Meals', defaultGrams: 210, kcalPer100g: 256 },
  { id: 'turkey-sandwich', name: 'Turkey & Avocado Sandwich', category: 'Meals', defaultGrams: 230, kcalPer100g: 212 },
  { id: 'veggie-wrap', name: 'Hummus & Roasted Veggie Wrap', category: 'Meals', defaultGrams: 220, kcalPer100g: 178 },
  { id: 'chicken-tikka', name: 'Chicken Tikka Masala', category: 'Meals', defaultGrams: 280, kcalPer100g: 154 },
  { id: 'ramen-bowl', name: 'Miso Ramen with Soft Egg', category: 'Meals', defaultGrams: 480, kcalPer100g: 112 },
  { id: 'sushi-rolls', name: 'Salmon Avocado Sushi Roll (8 pcs)', category: 'Meals', defaultGrams: 220, kcalPer100g: 156 },
  { id: 'pad-thai', name: 'Chicken Pad Thai', category: 'Meals', defaultGrams: 320, kcalPer100g: 165 },
  { id: 'burger-classic', name: 'Classic Cheeseburger', category: 'Meals', defaultGrams: 230, kcalPer100g: 263 },
  { id: 'tacos-chicken', name: 'Grilled Chicken Street Tacos (2)', category: 'Meals', defaultGrams: 200, kcalPer100g: 192 },
  { id: 'falafel-plate', name: 'Falafel & Tabouli Plate', category: 'Meals', defaultGrams: 270, kcalPer100g: 189 },
  { id: 'stirfry-veggie', name: 'Tofu & Broccoli Stir-Fry', category: 'Meals', defaultGrams: 300, kcalPer100g: 118 },
  { id: 'tomato-soup', name: 'Roasted Tomato Basil Soup', category: 'Meals', defaultGrams: 300, kcalPer100g: 62 },

  // Grains & Sides
  { id: 'quinoa-cooked', name: 'Cooked Quinoa', category: 'Sides', defaultGrams: 150, kcalPer100g: 120 },
  { id: 'brown-rice', name: 'Steamed Brown Rice', category: 'Sides', defaultGrams: 160, kcalPer100g: 112 },
  { id: 'white-rice', name: 'Steamed Jasmine Rice', category: 'Sides', defaultGrams: 160, kcalPer100g: 130 },
  { id: 'sweet-potato', name: 'Roasted Sweet Potato Cubes', category: 'Sides', defaultGrams: 130, kcalPer100g: 112 },
  { id: 'roasted-potatoes', name: 'Herb Roasted Baby Potatoes', category: 'Sides', defaultGrams: 150, kcalPer100g: 125 },
  { id: 'french-fries', name: 'Oven-Baked Fries', category: 'Sides', defaultGrams: 120, kcalPer100g: 220 },
  { id: 'broccoli-steamed', name: 'Steamed Broccoli Florets', category: 'Sides', defaultGrams: 100, kcalPer100g: 35 },
  { id: 'mixed-greens', name: 'Mixed Greens Side Salad', category: 'Sides', defaultGrams: 110, kcalPer100g: 42 },
  { id: 'roasted-veggies', name: 'Roasted Mediterranean Vegetables', category: 'Sides', defaultGrams: 150, kcalPer100g: 78 },
  { id: 'sourdough-slice', name: 'Sourdough Bread Slice', category: 'Sides', defaultGrams: 55, kcalPer100g: 272 },
  { id: 'avocado-sliced', name: 'Sliced Fresh Avocado', category: 'Sides', defaultGrams: 65, kcalPer100g: 160 },
  { id: 'hummus', name: 'Classic Chickpea Hummus', category: 'Sides', defaultGrams: 60, kcalPer100g: 166 },

  // Snacks & Fruits
  { id: 'apple-medium', name: 'Crisp Honeycrisp Apple', category: 'Snacks', defaultGrams: 180, kcalPer100g: 52 },
  { id: 'banana-medium', name: 'Medium Banana', category: 'Snacks', defaultGrams: 118, kcalPer100g: 89 },
  { id: 'mixed-berries', name: 'Fresh Mixed Berries', category: 'Snacks', defaultGrams: 120, kcalPer100g: 48 },
  { id: 'almonds-roasted', name: 'Roasted Almonds', category: 'Snacks', defaultGrams: 30, kcalPer100g: 579 },
  { id: 'walnuts', name: 'Raw Walnuts', category: 'Snacks', defaultGrams: 30, kcalPer100g: 654 },
  { id: 'peanut-butter', name: 'Natural Peanut Butter', category: 'Snacks', defaultGrams: 32, kcalPer100g: 588 },
  { id: 'protein-bar', name: 'Chocolate Almond Protein Bar', category: 'Snacks', defaultGrams: 60, kcalPer100g: 365 },
  { id: 'dark-chocolate', name: 'Dark Chocolate (70% Cacao)', category: 'Snacks', defaultGrams: 28, kcalPer100g: 598 },
  { id: 'popcorn', name: 'Air-Popped Popcorn', category: 'Snacks', defaultGrams: 30, kcalPer100g: 387 },
  { id: 'carrots-hummus', name: 'Baby Carrots & Hummus', category: 'Snacks', defaultGrams: 140, kcalPer100g: 95 },
  { id: 'edamame', name: 'Steamed Sea-Salt Edamame', category: 'Snacks', defaultGrams: 120, kcalPer100g: 121 },
  { id: 'rice-cakes', name: 'Rice Cakes with Almond Butter', category: 'Snacks', defaultGrams: 50, kcalPer100g: 440 },
  { id: 'orange-fresh', name: 'Navel Orange', category: 'Snacks', defaultGrams: 140, kcalPer100g: 47 },
  { id: 'grapes', name: 'Red Seedless Grapes', category: 'Snacks', defaultGrams: 120, kcalPer100g: 69 },
  { id: 'cheese-crackers', name: 'Cheddar & Whole Grain Crackers', category: 'Snacks', defaultGrams: 65, kcalPer100g: 418 },
];

export function searchFoodCatalog(query: string): FoodCatalogItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOOD_CATALOG.slice(0, 8);
  return FOOD_CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  ).slice(0, 12);
}

/**
 * Fallback analyzer used only when the server Gemini endpoint is unreachable,
 * ensuring the full meal-review workflow remains demonstrable.
 */
export function buildFallbackAnalysis(hintUrl?: string): AnalyzeMealResponse {
  if (hintUrl) {
    const matchedSample = SAMPLE_PHOTO_OPTIONS.find((s) => s.imageUrl === hintUrl);
    if (matchedSample) {
      return matchedSample.fallbackResponse;
    }
  }
  return {
    foodDetected: true,
    suggestedMealType: inferMealTypeByClock(),
    items: [
      {
        predictions: [
          { label: 'Mediterranean Grain Bowl', confidence: 0.46, defaultGrams: 320, kcalPer100g: 146 },
          { label: 'Grilled Chicken Salad', confidence: 0.39, defaultGrams: 280, kcalPer100g: 158 },
          { label: 'Roasted Vegetable Plate', confidence: 0.24, defaultGrams: 260, kcalPer100g: 112 },
        ],
      },
    ],
  };
}

export function inferMealTypeByClock(): MealType {
  const hour = new Date().getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 15) return 'Lunch';
  if (hour < 18) return 'Snack';
  return 'Dinner';
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysToDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + deltaDays);
  return formatDateKey(dt);
}

export function generateDemoMeals(userId: string): MealEntry[] {
  const today = formatDateKey(new Date());
  const d1 = addDaysToDateKey(today, -1);
  const d2 = addDaysToDateKey(today, -2);
  const d3 = addDaysToDateKey(today, -3);
  const d4 = addDaysToDateKey(today, -4);
  const d5 = addDaysToDateKey(today, -5);
  const d6 = addDaysToDateKey(today, -6);

  const now = Date.now();

  return [
    // Today (around 1,350 kcal of 2,000 goal — calm green progress ring)
    {
      id: 'demo-today-1',
      userId,
      date: today,
      time: '08:25',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.oatmeal,
      items: [
        {
          id: 'item-t1',
          name: 'Oatmeal with Berries, Banana & Chia',
          grams: 310,
          defaultGrams: 280,
          kcalPer100g: 115,
          confidence: 0.93,
        },
      ],
      totalCalories: 357,
      createdAt: now - 1000 * 60 * 300,
    },
    {
      id: 'demo-today-2',
      userId,
      date: today,
      time: '12:50',
      mealType: 'Lunch',
      photoUrl: SAMPLE_MEAL_IMAGES.salmonBowl,
      items: [
        {
          id: 'item-t2a',
          name: 'Grilled Salmon Fillet',
          grams: 140,
          defaultGrams: 140,
          kcalPer100g: 208,
          confidence: 0.94,
        },
        {
          id: 'item-t2b',
          name: 'Quinoa & Chickpea Salad',
          grams: 160,
          defaultGrams: 160,
          kcalPer100g: 132,
          confidence: 0.89,
        },
        {
          id: 'item-t2c',
          name: 'Sliced Avocado',
          grams: 65,
          defaultGrams: 65,
          kcalPer100g: 160,
          confidence: 0.96,
        },
      ],
      totalCalories: 606,
      createdAt: now - 1000 * 60 * 140,
    },
    {
      id: 'demo-today-3',
      userId,
      date: today,
      time: '16:15',
      mealType: 'Snack',
      photoUrl: SAMPLE_MEAL_IMAGES.greekYogurt,
      items: [
        {
          id: 'item-t3a',
          name: 'Greek Yogurt with Raspberries & Honey',
          grams: 170,
          defaultGrams: 170,
          kcalPer100g: 97,
          confidence: 0.92,
        },
        {
          id: 'item-t3b',
          name: 'Toasted Oat Granola & Almonds',
          grams: 35,
          defaultGrams: 40,
          kcalPer100g: 471,
          confidence: 0.87,
        },
      ],
      totalCalories: 330,
      createdAt: now - 1000 * 60 * 45,
    },

    // Yesterday (1,915 kcal — warm amber near goal)
    {
      id: 'demo-d1-1',
      userId,
      date: d1,
      time: '08:10',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.avocadoToast,
      items: [
        { id: 'item-d1a', name: 'Sourdough Avocado Toast', grams: 150, defaultGrams: 150, kcalPer100g: 215, confidence: 0.93 },
        { id: 'item-d1b', name: 'Poached Eggs (2)', grams: 100, defaultGrams: 100, kcalPer100g: 143, confidence: 0.95 },
      ],
      totalCalories: 466,
      createdAt: now - 86400000,
    },
    {
      id: 'demo-d1-2',
      userId,
      date: d1,
      time: '13:15',
      mealType: 'Lunch',
      photoUrl: SAMPLE_MEAL_IMAGES.salmonBowl,
      items: [
        { id: 'item-d1c', name: 'Mediterranean Salmon Quinoa Bowl', grams: 390, defaultGrams: 360, kcalPer100g: 162, confidence: 0.91 },
      ],
      totalCalories: 632,
      createdAt: now - 86400000 + 1000,
    },
    {
      id: 'demo-d1-3',
      userId,
      date: d1,
      time: '19:00',
      mealType: 'Dinner',
      photoUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
      items: [
        { id: 'item-d1d', name: 'Herb-Grilled Chicken Breast', grams: 180, defaultGrams: 165, kcalPer100g: 165, confidence: 0.95 },
        { id: 'item-d1e', name: 'Roasted Sweet Potato & Broccoli', grams: 240, defaultGrams: 225, kcalPer100g: 98, confidence: 0.89 },
      ],
      totalCalories: 532,
      createdAt: now - 86400000 + 2000,
    },
    {
      id: 'demo-d1-4',
      userId,
      date: d1,
      time: '16:00',
      mealType: 'Snack',
      isManual: true,
      items: [
        { id: 'item-d1f', name: 'Roasted Almonds & Honeycrisp Apple', grams: 210, defaultGrams: 210, kcalPer100g: 136 },
      ],
      totalCalories: 285,
      createdAt: now - 86400000 + 1500,
    },

    // 2 days ago (2,140 kcal — slightly over goal)
    {
      id: 'demo-d2-1',
      userId,
      date: d2,
      time: '09:00',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.oatmeal,
      items: [{ id: 'item-d2a', name: 'Oatmeal with Berries & Nut Butter', grams: 340, defaultGrams: 300, kcalPer100g: 138 }],
      totalCalories: 469,
      createdAt: now - 86400000 * 2,
    },
    {
      id: 'demo-d2-2',
      userId,
      date: d2,
      time: '13:30',
      mealType: 'Lunch',
      isManual: true,
      items: [{ id: 'item-d2b', name: 'Chicken Burrito Bowl with Guacamole', grams: 460, defaultGrams: 420, kcalPer100g: 162 }],
      totalCalories: 745,
      createdAt: now - 86400000 * 2 + 1000,
    },
    {
      id: 'demo-d2-3',
      userId,
      date: d2,
      time: '19:45',
      mealType: 'Dinner',
      photoUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
      items: [{ id: 'item-d2c', name: 'Penne with Pesto & Grilled Chicken', grams: 390, defaultGrams: 350, kcalPer100g: 237 }],
      totalCalories: 926,
      createdAt: now - 86400000 * 2 + 2000,
    },

    // 3 days ago (1,760 kcal)
    {
      id: 'demo-d3-1',
      userId,
      date: d3,
      time: '08:15',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.avocadoToast,
      items: [{ id: 'item-d3a', name: 'Avocado Toast with Poached Eggs', grams: 240, defaultGrams: 240, kcalPer100g: 192 }],
      totalCalories: 461,
      createdAt: now - 86400000 * 3,
    },
    {
      id: 'demo-d3-2',
      userId,
      date: d3,
      time: '12:40',
      mealType: 'Lunch',
      photoUrl: SAMPLE_MEAL_IMAGES.salmonBowl,
      items: [{ id: 'item-d3b', name: 'Salmon Quinoa Salad Bowl', grams: 350, defaultGrams: 350, kcalPer100g: 168 }],
      totalCalories: 588,
      createdAt: now - 86400000 * 3 + 1000,
    },
    {
      id: 'demo-d3-3',
      userId,
      date: d3,
      time: '18:50',
      mealType: 'Dinner',
      photoUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
      items: [{ id: 'item-d3c', name: 'Herb Chicken, Sweet Potato & Broccoli', grams: 430, defaultGrams: 400, kcalPer100g: 165 }],
      totalCalories: 711,
      createdAt: now - 86400000 * 3 + 2000,
    },

    // 4 days ago (1,840 kcal)
    {
      id: 'demo-d4-1',
      userId,
      date: d4,
      time: '08:40',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.greekYogurt,
      items: [{ id: 'item-d4a', name: 'Greek Yogurt Granola Parfait', grams: 260, defaultGrams: 240, kcalPer100g: 168 }],
      totalCalories: 437,
      createdAt: now - 86400000 * 4,
    },
    {
      id: 'demo-d4-2',
      userId,
      date: d4,
      time: '13:00',
      mealType: 'Lunch',
      isManual: true,
      items: [{ id: 'item-d4b', name: 'Turkey & Avocado Sourdough Sandwich', grams: 320, defaultGrams: 280, kcalPer100g: 215 }],
      totalCalories: 688,
      createdAt: now - 86400000 * 4 + 1000,
    },
    {
      id: 'demo-d4-3',
      userId,
      date: d4,
      time: '19:20',
      mealType: 'Dinner',
      photoUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
      items: [{ id: 'item-d4c', name: 'Chicken & Vegetable Stir-Fry with Rice', grams: 450, defaultGrams: 420, kcalPer100g: 159 }],
      totalCalories: 715,
      createdAt: now - 86400000 * 4 + 2000,
    },

    // 5 days ago (1,620 kcal)
    {
      id: 'demo-d5-1',
      userId,
      date: d5,
      time: '08:30',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.oatmeal,
      items: [{ id: 'item-d5a', name: 'Berry Chia Oatmeal Bowl', grams: 300, defaultGrams: 280, kcalPer100g: 122 }],
      totalCalories: 366,
      createdAt: now - 86400000 * 5,
    },
    {
      id: 'demo-d5-2',
      userId,
      date: d5,
      time: '13:10',
      mealType: 'Lunch',
      photoUrl: SAMPLE_MEAL_IMAGES.salmonBowl,
      items: [{ id: 'item-d5b', name: 'Mediterranean Grain & Falafel Bowl', grams: 390, defaultGrams: 360, kcalPer100g: 158 }],
      totalCalories: 616,
      createdAt: now - 86400000 * 5 + 1000,
    },
    {
      id: 'demo-d5-3',
      userId,
      date: d5,
      time: '19:15',
      mealType: 'Dinner',
      photoUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
      items: [{ id: 'item-d5c', name: 'Baked Salmon & Roasted Veggies', grams: 380, defaultGrams: 360, kcalPer100g: 168 }],
      totalCalories: 638,
      createdAt: now - 86400000 * 5 + 2000,
    },

    // 6 days ago (1,960 kcal — warm amber)
    {
      id: 'demo-d6-1',
      userId,
      date: d6,
      time: '09:15',
      mealType: 'Breakfast',
      photoUrl: SAMPLE_MEAL_IMAGES.avocadoToast,
      items: [{ id: 'item-d6a', name: 'Sourdough Avocado Toast & Eggs', grams: 280, defaultGrams: 250, kcalPer100g: 196 }],
      totalCalories: 549,
      createdAt: now - 86400000 * 6,
    },
    {
      id: 'demo-d6-2',
      userId,
      date: d6,
      time: '13:45',
      mealType: 'Lunch',
      isManual: true,
      items: [{ id: 'item-d6b', name: 'Miso Ramen with Soft Egg', grams: 520, defaultGrams: 480, kcalPer100g: 128 }],
      totalCalories: 666,
      createdAt: now - 86400000 * 6 + 1000,
    },
    {
      id: 'demo-d6-3',
      userId,
      date: d6,
      time: '19:30',
      mealType: 'Dinner',
      photoUrl: SAMPLE_MEAL_IMAGES.grilledChicken,
      items: [{ id: 'item-d6c', name: 'Herb Chicken & Sweet Potato Plate', grams: 450, defaultGrams: 400, kcalPer100g: 166 }],
      totalCalories: 745,
      createdAt: now - 86400000 * 6 + 2000,
    },
  ];
}
