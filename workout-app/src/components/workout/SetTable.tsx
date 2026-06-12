import { Check, Plus, Trash2, X } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { lbsToKg } from '../../utils/calculations';
import type { BlockType, CompletedSet, SetType, WeightUnit } from '../../types';

// ---------- Draft types shared with the logger page ----------

export interface SetDraft {
  id: string;
  setType: SetType;
  targetReps?: number;
  targetRepsMax?: number;
  targetWeight?: number; // lbs
  targetRPE?: number;
  targetDurationSeconds?: number;
  /** User inputs kept as raw strings (weight in display unit). */
  reps: string;
  weight: string;
  rpe: string;
  logged: boolean;
  isPR: boolean;
  estimatedOneRepMax?: number;
}

export interface ExerciseDraft {
  id: string;
  exerciseId: string;
  notes: string;
  sets: SetDraft[];
}

export interface BlockDraft {
  id: string;
  type: BlockType;
  restBetweenSetsSeconds: number;
  exercises: ExerciseDraft[];
}

// ---------- Helpers ----------

export function toDisplayWeight(lbs: number, unit: WeightUnit): number {
  return unit === 'kg' ? lbsToKg(lbs) : Math.round(lbs * 10) / 10;
}

export function formatTargetLabel(set: SetDraft, unit: WeightUnit): string {
  const parts: string[] = [];
  if (set.targetReps != null) {
    parts.push(
      set.targetRepsMax != null && set.targetRepsMax !== set.targetReps
        ? `${set.targetReps}-${set.targetRepsMax}`
        : String(set.targetReps),
    );
  } else if (set.targetDurationSeconds != null) {
    parts.push(`${set.targetDurationSeconds}s`);
  }
  if (set.targetWeight != null) parts.push(`@ ${toDisplayWeight(set.targetWeight, unit)}`);
  if (set.targetRPE != null) parts.push(`RPE ${set.targetRPE}`);
  return parts.length > 0 ? parts.join(' ') : '—';
}

export interface SetPlaceholders {
  reps?: number;
  weight?: number; // display unit
}

/** Placeholder values for a set: last performance at the same index, falling back to last set, then target. */
export function placeholderForIndex(
  lastSets: CompletedSet[],
  index: number,
  set: Pick<SetDraft, 'targetReps' | 'targetWeight'>,
  unit: WeightUnit,
): SetPlaceholders {
  const ref = lastSets[index] ?? lastSets[lastSets.length - 1];
  const reps = ref?.reps ?? set.targetReps;
  const weightLbs = ref?.weight ?? set.targetWeight;
  return {
    reps,
    weight: weightLbs != null ? toDisplayWeight(weightLbs, unit) : undefined,
  };
}

const SET_TYPE_OPTIONS: { value: SetType; label: string }[] = [
  { value: 'warmup', label: 'Warm' },
  { value: 'working', label: 'Work' },
  { value: 'drop', label: 'Drop' },
  { value: 'failure', label: 'Fail' },
  { value: 'amrap', label: 'AMRAP' },
];

// ---------- Component ----------

interface SetTableProps {
  exerciseName: string;
  draft: ExerciseDraft;
  weightUnit: WeightUnit;
  /** Sets from the most recent completed workout containing this exercise. */
  lastSets: CompletedSet[];
  onUpdateSet: (setId: string, patch: Partial<Pick<SetDraft, 'reps' | 'weight' | 'rpe' | 'setType'>>) => void;
  onToggleLog: (setId: string) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onRemoveExercise?: () => void;
}

const cellInput =
  'w-full bg-surface-alt border border-border rounded-sm px-1.5 py-1 text-xs font-mono text-center text-text-primary placeholder-text-muted focus:outline-none focus:border-accent';

export function SetTable({
  exerciseName,
  draft,
  weightUnit,
  lastSets,
  onUpdateSet,
  onToggleLog,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: SetTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-extrabold text-text-primary">{exerciseName}</h4>
        {onRemoveExercise && (
          <button
            onClick={onRemoveExercise}
            className="text-text-muted hover:text-danger transition-colors"
            aria-label={`Remove ${exerciseName}`}
            title="Remove exercise"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-left">
            <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-8">Set</th>
            <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-20">Type</th>
            <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2">Target</th>
            <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-16">Reps</th>
            <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-20">
              {weightUnit === 'kg' ? 'Kg' : 'Lbs'}
            </th>
            <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-14">RPE</th>
            <th className="pb-1.5 w-8" aria-label="Log set" />
            <th className="pb-1.5 w-16" aria-label="Status" />
          </tr>
        </thead>
        <tbody>
          {draft.sets.map((set, i) => {
            const ph = placeholderForIndex(lastSets, i, set, weightUnit);
            return (
              <tr
                key={set.id}
                className={`border-t border-border/60 ${set.logged ? 'bg-success/5' : ''}`}
              >
                <td className="py-1.5 pr-2 font-mono text-text-secondary">{i + 1}</td>
                <td className="py-1.5 pr-2">
                  <select
                    value={set.setType}
                    onChange={(e) => onUpdateSet(set.id, { setType: e.target.value as SetType })}
                    disabled={set.logged}
                    className="w-full bg-surface-alt border border-border rounded-sm px-1 py-1 text-[11px] text-text-secondary focus:outline-none focus:border-accent appearance-none disabled:opacity-60"
                    aria-label="Set type"
                  >
                    {SET_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1.5 pr-2 font-mono text-text-secondary whitespace-nowrap">
                  {formatTargetLabel(set, weightUnit)}
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={set.reps}
                    placeholder={ph.reps != null ? String(ph.reps) : '—'}
                    onChange={(e) => onUpdateSet(set.id, { reps: e.target.value })}
                    disabled={set.logged}
                    className={`${cellInput} disabled:opacity-60`}
                    aria-label={`Set ${i + 1} reps`}
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step="any"
                    value={set.weight}
                    placeholder={ph.weight != null ? String(ph.weight) : '—'}
                    onChange={(e) => onUpdateSet(set.id, { weight: e.target.value })}
                    disabled={set.logged}
                    className={`${cellInput} disabled:opacity-60`}
                    aria-label={`Set ${i + 1} weight`}
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={1}
                    max={10}
                    step={0.5}
                    value={set.rpe}
                    placeholder={set.targetRPE != null ? String(set.targetRPE) : '—'}
                    onChange={(e) => onUpdateSet(set.id, { rpe: e.target.value })}
                    disabled={set.logged}
                    className={`${cellInput} disabled:opacity-60`}
                    aria-label={`Set ${i + 1} RPE`}
                  />
                </td>
                <td className="py-1.5 pr-1">
                  <button
                    onClick={() => onToggleLog(set.id)}
                    className={`w-6 h-6 rounded-sm border inline-flex items-center justify-center transition-colors ${
                      set.logged
                        ? 'bg-success border-success text-white'
                        : 'bg-surface-alt border-border text-text-muted hover:border-success hover:text-success'
                    }`}
                    aria-label={set.logged ? `Unlog set ${i + 1}` : `Log set ${i + 1}`}
                    title={set.logged ? 'Unlog set' : 'Log set'}
                  >
                    <Check size={14} />
                  </button>
                </td>
                <td className="py-1.5">
                  <div className="flex items-center justify-end gap-1.5">
                    {set.isPR && <Badge color="orange">PR</Badge>}
                    {!set.logged && (
                      <button
                        onClick={() => onRemoveSet(set.id)}
                        className="text-text-muted hover:text-danger transition-colors"
                        aria-label={`Remove set ${i + 1}`}
                        title="Remove set"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Button variant="ghost" size="sm" onClick={onAddSet} className="mt-1.5">
        <Plus size={13} /> Add Set
      </Button>
    </div>
  );
}
