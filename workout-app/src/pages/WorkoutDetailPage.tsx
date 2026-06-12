import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, SearchX } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useWorkoutStore } from '../stores/workoutStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { formatWeight, lbsToKg } from '../utils/calculations';
import type { CompletedSet, WeightUnit } from '../types';

const SET_TYPE_LABELS: Record<CompletedSet['setType'], string> = {
  warmup: 'Warm',
  working: 'Work',
  drop: 'Drop',
  failure: 'Fail',
  amrap: 'AMRAP',
};

function displayWeight(lbs: number | undefined, unit: WeightUnit): string {
  if (lbs == null) return '—';
  return unit === 'kg' ? String(lbsToKg(lbs)) : String(Math.round(lbs * 10) / 10);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="section-label mb-1">{label}</div>
      <div className="font-mono font-bold text-lg text-text-primary">{value}</div>
    </div>
  );
}

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const workout = useWorkoutStore((s) => s.completed.find((w) => w.id === id));
  const exerciseById = useExerciseStore((s) => s.byId);
  const unit = useSettingsStore((s) => s.settings.weightUnit);

  if (!workout) {
    return (
      <EmptyState
        icon={SearchX}
        headline="Workout not found"
        description="This workout may have been deleted, or the link is invalid."
        action={
          <Link to="/workouts">
            <Button variant="secondary" size="sm">
              <ArrowLeft size={13} /> Back to Workouts
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/workouts" className="text-text-secondary hover:text-text-primary transition-colors" aria-label="Back to workouts">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-extrabold text-text-primary">{workout.name}</h1>
      </div>

      {/* Header stats */}
      <Card>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Stat label="Date" value={format(workout.date, 'MMM d, yyyy')} />
          <Stat label="Duration" value={`${workout.durationMinutes} min`} />
          <Stat label="Volume" value={formatWeight(workout.totalVolume, unit)} />
          <Stat label="Sets" value={String(workout.totalSets)} />
          <Stat label="Session RPE" value={workout.sessionRPE != null ? String(workout.sessionRPE) : '—'} />
        </div>
      </Card>

      {/* Blocks */}
      {workout.exerciseBlocks.map((block, bi) => (
        <Card key={block.id}>
          <div className="flex items-center gap-2 mb-4">
            <span className="section-label">Block {bi + 1}</span>
            {block.type !== 'straight' && (
              <Badge color={block.type === 'superset' ? 'purple' : 'blue'}>{block.type}</Badge>
            )}
          </div>
          <div className="space-y-5">
            {block.exercises.map((ex) => (
              <div key={ex.id}>
                <h4 className="text-sm font-extrabold text-text-primary mb-2">
                  {exerciseById(ex.exerciseId)?.name ?? 'Unknown exercise'}
                </h4>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-8">Set</th>
                      <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-16">Type</th>
                      <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-14">Reps</th>
                      <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-20">
                        {unit === 'kg' ? 'Kg' : 'Lbs'}
                      </th>
                      <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-12">RPE</th>
                      <th className="section-label text-[10px] font-extrabold pb-1.5 pr-2 w-20">Est 1RM</th>
                      <th className="pb-1.5 w-12" aria-label="PR" />
                    </tr>
                  </thead>
                  <tbody>
                    {ex.sets.map((set, si) => (
                      <tr key={set.id} className="border-t border-border/60">
                        <td className="py-1.5 pr-2 font-mono text-text-secondary">{si + 1}</td>
                        <td className="py-1.5 pr-2 text-text-secondary">{SET_TYPE_LABELS[set.setType]}</td>
                        <td className="py-1.5 pr-2 font-mono text-text-primary">{set.reps ?? '—'}</td>
                        <td className="py-1.5 pr-2 font-mono text-text-primary">
                          {displayWeight(set.weight, unit)}
                        </td>
                        <td className="py-1.5 pr-2 font-mono text-text-secondary">{set.rpe ?? '—'}</td>
                        <td className="py-1.5 pr-2 font-mono text-text-secondary">
                          {set.estimatedOneRepMax != null ? displayWeight(set.estimatedOneRepMax, unit) : '—'}
                        </td>
                        <td className="py-1.5 text-right">{set.isPR && <Badge color="orange">PR</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ex.notes && <p className="mt-1.5 text-xs text-text-secondary italic">{ex.notes}</p>}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {workout.notes && (
        <Card>
          <CardHeader title="Notes" />
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{workout.notes}</p>
        </Card>
      )}
    </div>
  );
}
