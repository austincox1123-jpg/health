import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs } from '../ui/Tabs';
import { CustomFoodModal } from './CustomFoodModal';
import { useNutritionStore } from '../../stores/nutritionStore';
import { toast } from '../../stores/toastStore';
import { FOOD_CATEGORY_LABELS, MEAL_LABELS, g } from './labels';
import type { FoodItem, MealType, NutritionLogEntry } from '../../types';

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Build a denormalized log entry from a food at the given servings. */
export function entryFromFood(food: FoodItem, servings: number, date: Date, mealType: MealType): NutritionLogEntry {
  return {
    id: crypto.randomUUID(),
    date,
    mealType,
    foodId: food.id,
    name: food.name,
    servings,
    calories: Math.round(food.calories * servings),
    proteinG: round1(food.proteinG * servings),
    carbsG: round1(food.carbsG * servings),
    fatG: round1(food.fatG * servings),
    notes: '',
  };
}

interface FoodPickerProps {
  open: boolean;
  onClose: () => void;
  date: Date;
  mealType: MealType;
}

type PickerTab = 'library' | 'quick';

export function FoodPicker({ open, onClose, date, mealType }: FoodPickerProps) {
  const foods = useNutritionStore((s) => s.foods);
  const saveLog = useNutritionStore((s) => s.saveLog);

  const [tab, setTab] = useState<PickerTab>('library');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState('1');
  const [customOpen, setCustomOpen] = useState(false);

  // Quick Add fields
  const [qName, setQName] = useState('');
  const [qCals, setQCals] = useState('');
  const [qProtein, setQProtein] = useState('');
  const [qCarbs, setQCarbs] = useState('');
  const [qFat, setQFat] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().replace(/_/g, ' ').includes(q) || t.toLowerCase().includes(q)),
    );
  }, [foods, query]);

  const servingsN = Number(servings);
  const servingsValid = Number.isFinite(servingsN) && servingsN > 0;

  const close = () => {
    setQuery('');
    setSelected(null);
    setServings('1');
    setQName('');
    setQCals('');
    setQProtein('');
    setQCarbs('');
    setQFat('');
    setTab('library');
    onClose();
  };

  const handleLogFood = async () => {
    if (!selected || !servingsValid) return;
    await saveLog(entryFromFood(selected, servingsN, date, mealType));
    toast('success', `Logged ${selected.name} — ${MEAL_LABELS[mealType]}`);
    close();
  };

  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const qCalsN = num(qCals);
  const quickValid = qName.trim().length > 0 && qCalsN !== null;

  const handleQuickAdd = async () => {
    if (!quickValid || qCalsN === null) return;
    const entry: NutritionLogEntry = {
      id: crypto.randomUUID(),
      date,
      mealType,
      name: qName.trim(),
      servings: 1,
      calories: qCalsN,
      proteinG: num(qProtein) ?? 0,
      carbsG: num(qCarbs) ?? 0,
      fatG: num(qFat) ?? 0,
      notes: '',
    };
    await saveLog(entry);
    toast('success', `Logged ${entry.name} — ${MEAL_LABELS[mealType]}`);
    close();
  };

  return (
    <Modal open={open} onClose={close} title={`Add Food — ${MEAL_LABELS[mealType]}`} wide>
      <div className="flex items-center justify-between mb-4">
        <Tabs<PickerTab>
          tabs={[
            { value: 'library', label: 'Library' },
            { value: 'quick', label: 'Quick Add' },
          ]}
          active={tab}
          onChange={setTab}
        />
        <Button variant="secondary" size="sm" onClick={() => setCustomOpen(true)}>
          <Plus size={12} /> New Food
        </Button>
      </div>

      {tab === 'library' ? (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              className="pl-9"
              placeholder="Search foods by name, category, or tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="max-h-72 overflow-y-auto border border-border rounded-sm divide-y divide-border">
            {results.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-8">
                No foods match{query ? ` "${query}"` : ''}. Try "New Food" to add your own.
              </p>
            ) : (
              results.map((f) => {
                const isSelected = selected?.id === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelected(isSelected ? null : f)}
                    className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                      isSelected ? 'bg-accent/10' : 'hover:bg-surface-alt'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary truncate">{f.name}</span>
                        <Badge color={f.isCustom ? 'purple' : 'gray'}>
                          {f.isCustom ? 'Custom' : FOOD_CATEGORY_LABELS[f.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-text-secondary truncate">{f.servingLabel}</p>
                    </div>
                    <div className="font-mono text-xs text-text-secondary whitespace-nowrap">
                      <span className="text-text-primary font-bold">{f.calories}</span> kcal
                      <span className="ml-2">P{g(f.proteinG)}</span>
                      <span className="ml-1.5">C{g(f.carbsG)}</span>
                      <span className="ml-1.5">F{g(f.fatG)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          {selected && (
            <div className="flex flex-wrap items-end gap-3 bg-surface-alt border border-border rounded-sm p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-text-primary truncate">{selected.name}</p>
                <p className="font-mono text-xs text-text-secondary">
                  {servingsValid ? Math.round(selected.calories * servingsN) : '—'} kcal · P
                  {servingsValid ? g(selected.proteinG * servingsN) : '—'} · C
                  {servingsValid ? g(selected.carbsG * servingsN) : '—'} · F
                  {servingsValid ? g(selected.fatG * servingsN) : '—'}
                </p>
              </div>
              <div className="w-24">
                <Input
                  label="Servings"
                  mono
                  type="number"
                  min={0.1}
                  step={0.25}
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
              <Button disabled={!servingsValid} onClick={handleLogFood}>
                Log Food
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Name"
            value={qName}
            onChange={(e) => setQName(e.target.value)}
            placeholder="e.g. Restaurant burrito"
          />
          <div className="grid grid-cols-4 gap-2">
            <Input label="Cals" mono type="number" min={0} value={qCals} onChange={(e) => setQCals(e.target.value)} />
            <Input label="P (g)" mono type="number" min={0} step={0.1} value={qProtein} onChange={(e) => setQProtein(e.target.value)} />
            <Input label="C (g)" mono type="number" min={0} step={0.1} value={qCarbs} onChange={(e) => setQCarbs(e.target.value)} />
            <Input label="F (g)" mono type="number" min={0} step={0.1} value={qFat} onChange={(e) => setQFat(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button disabled={!quickValid} onClick={handleQuickAdd}>
              Log Entry
            </Button>
          </div>
        </div>
      )}

      <CustomFoodModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onCreated={(food) => {
          setTab('library');
          setSelected(food);
          setQuery('');
        }}
      />
    </Modal>
  );
}
