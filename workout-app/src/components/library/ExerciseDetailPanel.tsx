import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { History, Trash2, X } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Exercise, WeightUnit } from '../../types';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from '../../stores/toastStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CHART } from '../../utils/chartTheme';
import { formatWeight, lbsToKg } from '../../utils/calculations';
import { formatLabel } from './labels';

interface HistoryEntry {
  workoutId: string;
  date: Date;
  workoutName: string;
  sets: { weight?: number; reps?: number; durationSeconds?: number }[];
}

interface ChartPoint {
  timestamp: number;
  dateLabel: string;
  e1rm: number;
}

function displayWeight(lbsValue: number, unit: WeightUnit): number {
  return unit === 'kg' ? lbsToKg(lbsValue) : Math.round(lbsValue);
}

function formatSet(set: { weight?: number; reps?: number }, unit: WeightUnit): string {
  const w = set.weight !== undefined ? displayWeight(set.weight, unit) : 'BW';
  const r = set.reps ?? '—';
  return `${w}×${r}`;
}

interface ExerciseDetailPanelProps {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseDetailPanel({ exercise, onClose }: ExerciseDetailPanelProps) {
  const completed = useWorkoutStore((s) => s.completed);
  const removeExercise = useExerciseStore((s) => s.remove);
  const unit = useSettingsStore((s) => s.settings.weightUnit);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    setConfirmingDelete(false);
  }, [exercise.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // completed is sorted newest-first in the store.
  const history: HistoryEntry[] = useMemo(() => {
    const entries: HistoryEntry[] = [];
    for (const w of completed) {
      const sets = w.exerciseBlocks
        .flatMap((b) => b.exercises)
        .filter((ex) => ex.exerciseId === exercise.id)
        .flatMap((ex) => ex.sets);
      if (sets.length > 0) {
        entries.push({ workoutId: w.id, date: w.date, workoutName: w.name, sets });
      }
      if (entries.length >= 5) break;
    }
    return entries;
  }, [completed, exercise.id]);

  const chartData: ChartPoint[] = useMemo(() => {
    const points: ChartPoint[] = [];
    for (const w of completed) {
      let best = 0;
      for (const block of w.exerciseBlocks) {
        for (const ex of block.exercises) {
          if (ex.exerciseId !== exercise.id) continue;
          for (const s of ex.sets) {
            if (s.estimatedOneRepMax && s.estimatedOneRepMax > best) best = s.estimatedOneRepMax;
          }
        }
      }
      if (best > 0) {
        points.push({
          timestamp: w.date.getTime(),
          dateLabel: format(w.date, 'MMM d'),
          e1rm: best,
        });
      }
    }
    return points.sort((a, b) => a.timestamp - b.timestamp);
  }, [completed, exercise.id]);

  const handleDelete = async () => {
    await removeExercise(exercise.id);
    toast('success', `Deleted "${exercise.name}"`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={exercise.name}>
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${entered ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border overflow-y-auto transition-transform duration-200 ${entered ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-5 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-text-primary">{exercise.name}</h2>
              {exercise.isCustom && <Badge color="orange">Custom</Badge>}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <Badge color="gray">{formatLabel(exercise.category)}</Badge>
              <Badge color="gray">{formatLabel(exercise.movementPattern)}</Badge>
              <Badge color="gray">{formatLabel(exercise.modality)}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="section-label mb-2">Muscles</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-1.5 pr-3 text-text-secondary whitespace-nowrap align-top">Primary</td>
                  <td className="py-1.5">
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.map((m) => (
                        <Badge key={m} color="blue">{formatLabel(m)}</Badge>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-3 text-text-secondary whitespace-nowrap align-top">Secondary</td>
                  <td className="py-1.5">
                    {exercise.secondaryMuscles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {exercise.secondaryMuscles.map((m) => (
                          <Badge key={m} color="gray">{formatLabel(m)}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h3 className="section-label mb-2">Equipment</h3>
            <div className="flex flex-wrap gap-1">
              {exercise.equipment.map((e) => (
                <Badge key={e} color="gray">{formatLabel(e)}</Badge>
              ))}
            </div>
          </section>

          {exercise.instructions.length > 0 && (
            <section>
              <h3 className="section-label mb-2">Instructions</h3>
              <ol className="space-y-1.5">
                {exercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-text-primary">
                    <span className="font-mono text-xs text-accent font-bold pt-0.5 shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {exercise.tips.length > 0 && (
            <section>
              <h3 className="section-label mb-2">Coaching Tips</h3>
              <ul className="space-y-1.5">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-text-secondary">
                    <span className="text-accent-alt shrink-0">›</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="section-label mb-2">Est. 1RM Trend</h3>
            {chartData.length >= 2 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="dateLabel"
                      stroke={CHART.axis}
                      tick={{ fill: CHART.axis, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke={CHART.axis}
                      tick={{ fill: CHART.axis, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      width={48}
                      tickFormatter={(v: number) => String(displayWeight(v, unit))}
                    />
                    <Tooltip
                      contentStyle={CHART.tooltip}
                      formatter={(value) => [formatWeight(Number(value), unit), 'Est. 1RM']}
                    />
                    <Line
                      type="monotone"
                      dataKey="e1rm"
                      stroke={CHART.accent}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART.accent, strokeWidth: 0 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-text-muted border border-border rounded-sm px-3 py-4 text-center">
                Log at least two sessions with this exercise to see a 1RM trend.
              </p>
            )}
          </section>

          <section>
            <h3 className="section-label mb-2">History</h3>
            {history.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="section-label py-1.5 pr-3 font-bold">Date</th>
                    <th className="section-label py-1.5 font-bold">Sets ({unit} × reps)</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr key={entry.workoutId} className="border-b border-border last:border-b-0 align-top">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        <span className="font-mono text-text-primary">{format(entry.date, 'MMM d, yyyy')}</span>
                        <div className="text-text-muted truncate max-w-[110px]">{entry.workoutName}</div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-text-primary">
                          {entry.sets.map((s, i) => (
                            <span key={i}>{formatSet(s, unit)}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="border border-border rounded-sm px-3 py-5 text-center">
                <History size={20} className="text-text-muted mx-auto mb-2" />
                <p className="text-xs text-text-muted">No logged sessions with this exercise yet.</p>
              </div>
            )}
          </section>

          {exercise.isCustom && (
            <section className="border-t border-border pt-4">
              {confirmingDelete ? (
                <div className="flex items-center gap-2">
                  <Button variant="danger" size="sm" onClick={handleDelete}>
                    <Trash2 size={14} /> Confirm Delete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmingDelete(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="danger" size="sm" onClick={() => setConfirmingDelete(true)}>
                  <Trash2 size={14} /> Delete Custom Exercise
                </Button>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
