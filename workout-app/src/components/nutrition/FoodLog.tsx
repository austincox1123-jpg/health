import { useState } from 'react';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FoodPicker } from './FoodPicker';
import { useNutritionStore } from '../../stores/nutritionStore';
import { toast } from '../../stores/toastStore';
import { MEAL_ORDER, MEAL_LABELS, g } from './labels';
import type { MealType, NutritionLogEntry } from '../../types';

function MealSection({ mealType, entries, onAdd }: {
  mealType: MealType;
  entries: NutritionLogEntry[];
  onAdd: () => void;
}) {
  const removeLog = useNutritionStore((s) => s.removeLog);
  const mealCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  const handleDelete = async (entry: NutritionLogEntry) => {
    await removeLog(entry.id);
    toast('info', `Removed ${entry.name}`);
  };

  return (
    <div className="border-b border-border last:border-b-0 py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-2.5">
          <h4 className="section-label">{MEAL_LABELS[mealType]}</h4>
          {entries.length > 0 && (
            <span className="font-mono text-xs text-text-secondary">{mealCalories.toLocaleString()} kcal</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onAdd}>
          <Plus size={12} /> Add Food
        </Button>
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-text-muted py-1">Nothing logged.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="section-label font-normal pb-1.5">Food</th>
              <th className="section-label font-normal pb-1.5 text-right">Srv</th>
              <th className="section-label font-normal pb-1.5 text-right">Cals</th>
              <th className="section-label font-normal pb-1.5 text-right hidden sm:table-cell">P</th>
              <th className="section-label font-normal pb-1.5 text-right hidden sm:table-cell">C</th>
              <th className="section-label font-normal pb-1.5 text-right hidden sm:table-cell">F</th>
              <th className="pb-1.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-t border-border/60 group">
                <td className="py-1.5 pr-2 text-text-primary">{e.name}</td>
                <td className="py-1.5 font-mono text-xs text-text-secondary text-right">{e.servings}</td>
                <td className="py-1.5 font-mono text-xs text-text-primary text-right font-bold">{e.calories}</td>
                <td className="py-1.5 font-mono text-xs text-text-secondary text-right hidden sm:table-cell">{g(e.proteinG)}</td>
                <td className="py-1.5 font-mono text-xs text-text-secondary text-right hidden sm:table-cell">{g(e.carbsG)}</td>
                <td className="py-1.5 font-mono text-xs text-text-secondary text-right hidden sm:table-cell">{g(e.fatG)}</td>
                <td className="py-1.5 text-right">
                  <button
                    onClick={() => handleDelete(e)}
                    className="text-text-muted hover:text-danger transition-colors"
                    aria-label={`Delete ${e.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function FoodLog({ date, entries }: { date: Date; entries: NutritionLogEntry[] }) {
  const [pickerMeal, setPickerMeal] = useState<MealType | null>(null);

  return (
    <Card>
      {entries.length === 0 && (
        <div className="flex items-center gap-2 text-text-secondary text-xs mb-3">
          <UtensilsCrossed size={14} />
          <span>No food logged for this day yet — add your first meal below.</span>
        </div>
      )}
      {MEAL_ORDER.map((meal) => (
        <MealSection
          key={meal}
          mealType={meal}
          entries={entries.filter((e) => e.mealType === meal)}
          onAdd={() => setPickerMeal(meal)}
        />
      ))}
      {pickerMeal && (
        <FoodPicker open onClose={() => setPickerMeal(null)} date={date} mealType={pickerMeal} />
      )}
    </Card>
  );
}
