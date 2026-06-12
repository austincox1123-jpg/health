import type { ActivityLevel, NutritionGoal, NutritionProfile } from '../types';

export interface MacroTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (desk job, little exercise)',
  light: 'Light (1-3 sessions/wk)',
  moderate: 'Moderate (3-5 sessions/wk)',
  very_active: 'Very Active (6-7 sessions/wk)',
  extra_active: 'Extra Active (2-a-days / physical job)',
};

const GOAL_CALORIE_DELTA: Record<NutritionGoal, number> = {
  cut: -500,
  maintain: 0,
  bulk: 300,
};

export const GOAL_LABELS_NUTRITION: Record<NutritionGoal, string> = {
  cut: 'Cut (fat loss)',
  maintain: 'Maintain',
  bulk: 'Bulk (muscle gain)',
};

/** Mifflin-St Jeor BMR. Height in inches, weight in lbs. */
export function mifflinStJeorBMR(profile: Pick<NutritionProfile, 'sex' | 'age' | 'heightInches' | 'weightLbs'>): number {
  const kg = profile.weightLbs * 0.4536;
  const cm = profile.heightInches * 2.54;
  const base = 10 * kg + 6.25 * cm - 5 * profile.age;
  return Math.round(profile.sex === 'male' ? base + 5 : base - 161);
}

export function tdee(profile: NutritionProfile): number {
  return Math.round(mifflinStJeorBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

/**
 * Rule-based macro targets: goal-adjusted calories, protein from bodyweight,
 * fat at 25% of calories, remainder to carbs.
 */
export function macroTargets(profile: NutritionProfile): MacroTargets {
  const calories = Math.max(1200, tdee(profile) + GOAL_CALORIE_DELTA[profile.goal]);
  const proteinG = Math.round(profile.weightLbs * profile.proteinPerLb);
  const fatG = Math.round((calories * 0.25) / 9);
  const carbsG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
  return { calories, proteinG, carbsG, fatG };
}
