import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useNutritionStore } from '../../stores/nutritionStore';
import { toast } from '../../stores/toastStore';
import { ALL_ALLERGENS, ALLERGEN_LABELS, ALL_FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from './labels';
import type { Allergen, FoodCategory, FoodItem } from '../../types';

const CATEGORY_OPTIONS = ALL_FOOD_CATEGORIES.map((c) => ({ value: c, label: FOOD_CATEGORY_LABELS[c] }));

interface CustomFoodModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the created food so callers can e.g. pre-select it for logging. */
  onCreated?: (food: FoodItem) => void;
}

export function CustomFoodModal({ open, onClose, onCreated }: CustomFoodModalProps) {
  const addFood = useNutritionStore((s) => s.addFood);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('protein');
  const [servingLabel, setServingLabel] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [allergens, setAllergens] = useState<Allergen[]>([]);

  const reset = () => {
    setName('');
    setCategory('protein');
    setServingLabel('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setFiber('');
    setAllergens([]);
  };

  const toggleAllergen = (a: Allergen) => {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  const caloriesN = num(calories);
  const proteinN = num(protein);
  const carbsN = num(carbs);
  const fatN = num(fat);
  const valid = name.trim().length > 0 && caloriesN !== null && proteinN !== null && carbsN !== null && fatN !== null;

  const handleSave = async () => {
    if (!valid || caloriesN === null || proteinN === null || carbsN === null || fatN === null) return;
    const fiberN = fiber.trim() === '' ? undefined : num(fiber) ?? undefined;
    const food: FoodItem = {
      id: `food-custom-${crypto.randomUUID()}`,
      name: name.trim(),
      category,
      servingLabel: servingLabel.trim() || '1 serving',
      calories: caloriesN,
      proteinG: proteinN,
      carbsG: carbsN,
      fatG: fatN,
      fiberG: fiberN,
      allergens,
      tags: [],
      isCustom: true,
    };
    await addFood(food);
    toast('success', `Added "${food.name}" to your food library`);
    reset();
    onCreated?.(food);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Custom Food">
      <div className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mom's chili" />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={(e) => setCategory(e.target.value as FoodCategory)}
          />
          <Input
            label="Serving"
            value={servingLabel}
            onChange={(e) => setServingLabel(e.target.value)}
            placeholder="e.g. 1 cup"
          />
        </div>
        <div className="grid grid-cols-5 gap-2">
          <Input label="Cals" mono type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} />
          <Input label="P (g)" mono type="number" min={0} step={0.1} value={protein} onChange={(e) => setProtein(e.target.value)} />
          <Input label="C (g)" mono type="number" min={0} step={0.1} value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          <Input label="F (g)" mono type="number" min={0} step={0.1} value={fat} onChange={(e) => setFat(e.target.value)} />
          <Input label="Fiber" mono type="number" min={0} step={0.1} value={fiber} onChange={(e) => setFiber(e.target.value)} />
        </div>
        <div>
          <span className="section-label block mb-1.5">Allergens</span>
          <div className="flex flex-wrap gap-1.5">
            {ALL_ALLERGENS.map((a) => {
              const active = allergens.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergen(a)}
                  className={`px-2 py-1 rounded-sm border text-[10px] font-bold uppercase tracking-label transition-colors ${
                    active
                      ? 'bg-danger/15 text-danger border-danger/40'
                      : 'bg-surface-alt text-text-secondary border-border hover:text-text-primary'
                  }`}
                >
                  {ALLERGEN_LABELS[a]}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={handleSave}>Save Food</Button>
        </div>
      </div>
    </Modal>
  );
}
