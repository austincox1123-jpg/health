import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useExerciseStore } from '../../stores/exerciseStore';
import type { Exercise } from '../../types';

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
  placeholder?: string;
}

/** Type-ahead exercise search over the exercise library (name / category / equipment). */
export function ExerciseSearch({ onSelect, placeholder = 'Add exercise — search name, category, equipment…' }: ExerciseSearchProps) {
  const exercises = useExerciseStore((s) => s.exercises);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return exercises
      .filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category.replace(/_/g, ' ').toLowerCase().includes(q) ||
          e.equipment.some((eq) => eq.replace(/_/g, ' ').toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [exercises, query]);

  const open = focused && results.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full bg-surface-alt border border-border rounded-sm pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
        />
      </div>
      {open && (
        <ul className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-sm shadow-lg max-h-64 overflow-y-auto">
          {results.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                // onMouseDown so it fires before the input's blur closes the list
                onMouseDown={(ev) => {
                  ev.preventDefault();
                  onSelect(e);
                  setQuery('');
                }}
                className="w-full text-left px-3 py-2 hover:bg-surface-alt flex items-center justify-between gap-2"
              >
                <span className="text-xs font-semibold text-text-primary">{e.name}</span>
                <span className="text-[10px] uppercase tracking-label text-text-secondary whitespace-nowrap">
                  {e.category.replace(/_/g, ' ')} · {e.equipment[0]?.replace(/_/g, ' ') ?? '—'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
