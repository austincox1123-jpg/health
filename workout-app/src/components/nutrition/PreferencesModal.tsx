import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNutritionStore } from '../../stores/nutritionStore';
import { toast } from '../../stores/toastStore';
import { ALL_ALLERGENS, ALLERGEN_LABELS } from './labels';
import type { Allergen } from '../../types';

export function PreferencesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const preferences = useNutritionStore((s) => s.preferences);
  const savePreferences = useNutritionStore((s) => s.savePreferences);

  const [allergens, setAllergens] = useState<Allergen[]>(preferences.allergens);
  const [dislikes, setDislikes] = useState<string[]>(preferences.dislikes);
  const [draft, setDraft] = useState('');

  // Re-sync local state each time the modal opens.
  useEffect(() => {
    if (open) {
      setAllergens(preferences.allergens);
      setDislikes(preferences.dislikes);
      setDraft('');
    }
  }, [open, preferences]);

  const toggleAllergen = (a: Allergen) => {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const addDislike = () => {
    const keyword = draft.trim();
    if (!keyword) return;
    if (dislikes.some((d) => d.toLowerCase() === keyword.toLowerCase())) {
      setDraft('');
      return;
    }
    setDislikes((prev) => [...prev, keyword]);
    setDraft('');
  };

  const handleSave = async () => {
    await savePreferences({ allergens, dislikes });
    toast('success', 'Food preferences saved');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Food Preferences">
      <div className="space-y-5">
        <div>
          <span className="section-label block mb-1.5">Allergens to Avoid</span>
          <p className="text-xs text-text-secondary mb-2">
            Foods containing these are excluded from recommendations.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ALL_ALLERGENS.map((a) => {
              const active = allergens.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergen(a)}
                  aria-pressed={active}
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

        <div>
          <span className="section-label block mb-1.5">Dislikes</span>
          <p className="text-xs text-text-secondary mb-2">
            Keywords matched against food names (case-insensitive). e.g. "mushroom" hides anything with mushroom in the name.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Add a keyword…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addDislike();
                }
              }}
              autoComplete="off"
            />
            <Button variant="secondary" onClick={addDislike} disabled={!draft.trim()}>
              <Plus size={14} /> Add
            </Button>
          </div>
          {dislikes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {dislikes.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm bg-surface-alt border border-border text-xs text-text-primary"
                >
                  {d}
                  <button
                    onClick={() => setDislikes((prev) => prev.filter((x) => x !== d))}
                    className="text-text-muted hover:text-danger"
                    aria-label={`Remove ${d}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>
    </Modal>
  );
}
