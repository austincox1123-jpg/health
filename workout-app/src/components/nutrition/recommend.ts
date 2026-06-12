import type { FoodItem, NutritionLogEntry, NutritionPreferences } from '../../types';
import type { MacroTargets } from '../../utils/nutritionCalc';

export interface MacroTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type GapMacro = 'protein' | 'carbs' | 'fat';

export interface Recommendation {
  food: FoodItem;
  /** Short why-chip, e.g. "+38g protein". */
  reason: string;
}

export interface RecommendationResult {
  /** The proportionally largest remaining macro gap, or null when targets are met. */
  gap: GapMacro | null;
  recommendations: Recommendation[];
}

/** Sum the denormalized macro totals of a day's log entries. */
export function totalsForEntries(entries: NutritionLogEntry[]): MacroTotals {
  const out: MacroTotals = { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
  for (const e of entries) {
    out.calories += e.calories;
    out.proteinG += e.proteinG;
    out.carbsG += e.carbsG;
    out.fatG += e.fatG;
  }
  return out;
}

/** Targets minus consumed (can be negative when over). */
export function remainingMacros(targets: MacroTargets, consumed: MacroTotals): MacroTotals {
  return {
    calories: targets.calories - consumed.calories,
    proteinG: targets.proteinG - consumed.proteinG,
    carbsG: targets.carbsG - consumed.carbsG,
    fatG: targets.fatG - consumed.fatG,
  };
}

/** True when the food conflicts with the user's allergens or dislike keywords. */
export function violatesPreferences(food: FoodItem, prefs: NutritionPreferences): boolean {
  if (food.allergens.some((a) => prefs.allergens.includes(a))) return true;
  const name = food.name.toLowerCase();
  return prefs.dislikes.some((d) => {
    const keyword = d.trim().toLowerCase();
    return keyword.length > 0 && name.includes(keyword);
  });
}

/**
 * The macro with the proportionally biggest remaining gap (remaining ÷ target).
 * Returns null when no macro is still under target — i.e. targets are met.
 */
export function largestGap(remaining: MacroTotals, targets: MacroTargets): GapMacro | null {
  const ratios: { macro: GapMacro; ratio: number }[] = [
    { macro: 'protein', ratio: targets.proteinG > 0 ? remaining.proteinG / targets.proteinG : 0 },
    { macro: 'carbs', ratio: targets.carbsG > 0 ? remaining.carbsG / targets.carbsG : 0 },
    { macro: 'fat', ratio: targets.fatG > 0 ? remaining.fatG / targets.fatG : 0 },
  ];
  let best: { macro: GapMacro; ratio: number } | null = null;
  for (const r of ratios) {
    if (r.ratio > 0 && (!best || r.ratio > best.ratio)) best = r;
  }
  return best?.macro ?? null;
}

const PREFERRED_CATEGORIES: Record<GapMacro, string[]> = {
  protein: ['protein'],
  carbs: ['grain', 'fruit'],
  fat: ['fat'],
};

function gapValue(food: FoodItem, gap: GapMacro): number {
  switch (gap) {
    case 'protein': return food.proteinG;
    case 'carbs': return food.carbsG;
    case 'fat': return food.fatG;
  }
}

function gapReason(food: FoodItem, gap: GapMacro): string {
  switch (gap) {
    case 'protein': return `+${Math.round(food.proteinG)}g protein`;
    case 'carbs': return `+${Math.round(food.carbsG)}g carbs`;
    case 'fat': return `+${Math.round(food.fatG)}g fat`;
  }
}

/** Boost ranking for foods tagged/categorized to address the gap. */
function preferenceScore(food: FoodItem, gap: GapMacro): number {
  let score = 0;
  if (PREFERRED_CATEGORIES[gap].includes(food.category)) score += 1;
  if (gap === 'protein' && food.tags.includes('high_protein')) score += 2;
  return score;
}

/**
 * Deterministic, rule-based food recommendations:
 * 1. exclude allergen conflicts and disliked foods,
 * 2. exclude foods that blow the remaining calorie budget (> remaining + 50),
 * 3. target the proportionally largest macro gap, excluding foods that
 *    contribute nothing to it,
 * 4. rank by preferred category/tag, then by gap-macro grams desc,
 *    then fewest calories, then name.
 */
export function recommendFoods(
  foods: FoodItem[],
  targets: MacroTargets,
  consumed: MacroTotals,
  prefs: NutritionPreferences,
  limit = 6,
): RecommendationResult {
  const remaining = remainingMacros(targets, consumed);
  const gap = remaining.calories <= 0 ? null : largestGap(remaining, targets);
  if (!gap) return { gap: null, recommendations: [] };

  const candidates = foods.filter(
    (f) =>
      !violatesPreferences(f, prefs) &&
      f.calories > 0 &&
      f.calories <= remaining.calories + 50 &&
      gapValue(f, gap) > 0,
  );

  candidates.sort((a, b) => {
    const pref = preferenceScore(b, gap) - preferenceScore(a, gap);
    if (pref !== 0) return pref;
    const grams = gapValue(b, gap) - gapValue(a, gap);
    if (grams !== 0) return grams;
    if (a.calories !== b.calories) return a.calories - b.calories;
    return a.name.localeCompare(b.name);
  });

  return {
    gap,
    recommendations: candidates.slice(0, limit).map((food) => ({ food, reason: gapReason(food, gap) })),
  };
}
