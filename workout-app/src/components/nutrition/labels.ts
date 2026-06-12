import type { Allergen, FoodCategory, MealType } from '../../types';

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: 'Dairy',
  gluten: 'Gluten',
  tree_nuts: 'Tree Nuts',
  peanuts: 'Peanuts',
  shellfish: 'Shellfish',
  fish: 'Fish',
  eggs: 'Eggs',
  soy: 'Soy',
  sesame: 'Sesame',
};

export const ALL_ALLERGENS = Object.keys(ALLERGEN_LABELS) as Allergen[];

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  protein: 'Protein',
  grain: 'Grain',
  fruit: 'Fruit',
  vegetable: 'Vegetable',
  dairy: 'Dairy',
  fat: 'Fat',
  snack: 'Snack',
  beverage: 'Beverage',
  meal: 'Meal',
};

export const ALL_FOOD_CATEGORIES = Object.keys(FOOD_CATEGORY_LABELS) as FoodCategory[];

/** Round grams for display. */
export function g(value: number): string {
  return String(Math.round(value));
}
