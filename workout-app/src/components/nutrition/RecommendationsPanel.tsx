import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Lightbulb, Plus, SearchX } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useNutritionStore } from '../../stores/nutritionStore';
import { toast } from '../../stores/toastStore';
import { recommendFoods, totalsForEntries, type GapMacro } from './recommend';
import { entryFromFood } from './FoodPicker';
import { MEAL_ORDER, MEAL_LABELS, g } from './labels';
import type { MacroTargets } from '../../utils/nutritionCalc';
import type { MealType, NutritionLogEntry } from '../../types';

const GAP_HEADLINE: Record<GapMacro, string> = {
  protein: 'Protein is your biggest gap',
  carbs: 'Carbs are your biggest gap',
  fat: 'Fat is your biggest gap',
};

/** First meal of the day with no entries; snacks as fallback. */
function nextUnloggedMeal(entries: NutritionLogEntry[]): MealType {
  const logged = new Set(entries.map((e) => e.mealType));
  return MEAL_ORDER.find((m) => !logged.has(m)) ?? 'snack';
}

interface RecommendationsPanelProps {
  date: Date;
  entries: NutritionLogEntry[];
  targets: MacroTargets;
}

export function RecommendationsPanel({ date, entries, targets }: RecommendationsPanelProps) {
  const foods = useNutritionStore((s) => s.foods);
  const preferences = useNutritionStore((s) => s.preferences);
  const saveLog = useNutritionStore((s) => s.saveLog);

  const [meal, setMeal] = useState<MealType>(() => nextUnloggedMeal(entries));

  // Follow the day's log as it changes (e.g. after "Log it" or date navigation).
  useEffect(() => {
    setMeal(nextUnloggedMeal(entries));
  }, [entries]);

  const consumed = useMemo(() => totalsForEntries(entries), [entries]);
  const { gap, recommendations } = useMemo(
    () => recommendFoods(foods, targets, consumed, preferences),
    [foods, targets, consumed, preferences],
  );

  const handleLog = async (rec: (typeof recommendations)[number]) => {
    await saveLog(entryFromFood(rec.food, 1, date, meal));
    toast('success', `Logged ${rec.food.name} — ${MEAL_LABELS[meal]}`);
  };

  return (
    <Card>
      <CardHeader
        title="Suggestions"
        action={
          gap !== null && (
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value as MealType)}
              className="bg-surface-alt border border-border rounded-sm px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
              aria-label="Meal to log suggestions to"
            >
              {MEAL_ORDER.map((m) => (
                <option key={m} value={m}>
                  {MEAL_LABELS[m]}
                </option>
              ))}
            </select>
          )
        }
      />
      {gap === null ? (
        <div className="flex flex-col items-center text-center py-8 px-4">
          <CheckCircle2 size={32} className="text-success mb-3" />
          <p className="text-sm font-bold text-text-primary mb-1">You've hit your targets</p>
          <p className="text-xs text-text-secondary">
            Nothing left in the budget for today. Nice work — see you tomorrow.
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center text-center py-8 px-4">
          <SearchX size={32} className="text-text-muted mb-3" />
          <p className="text-sm font-bold text-text-primary mb-1">No foods fit the remaining budget</p>
          <p className="text-xs text-text-secondary">
            Try a smaller portion via the food log, or loosen your preferences.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-2">
            <Lightbulb size={13} className="text-warning shrink-0" />
            <span>{GAP_HEADLINE[gap]} — these fit your remaining calories.</span>
          </div>
          {recommendations.map((rec) => (
            <div key={rec.food.id} className="bg-surface-alt border border-border rounded-sm p-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-text-primary truncate">{rec.food.name}</span>
                <Badge color={gap === 'protein' ? 'green' : gap === 'carbs' ? 'blue' : 'yellow'}>
                  {rec.reason}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[11px] text-text-secondary truncate">
                  {rec.food.servingLabel} · <span className="text-text-primary font-bold">{rec.food.calories}</span> kcal
                  · P{g(rec.food.proteinG)} C{g(rec.food.carbsG)} F{g(rec.food.fatG)}
                </p>
                <Button variant="secondary" size="sm" onClick={() => handleLog(rec)}>
                  <Plus size={11} /> Log it
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
