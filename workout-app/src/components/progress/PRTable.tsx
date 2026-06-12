import { useMemo } from 'react';
import { differenceInCalendarDays } from 'date-fns';
import { Trophy } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatWeight } from '../../utils/calculations';
import { formatFull } from '../../utils/dates';
import type { PersonalRecord } from '../../types';

function prType(pr: PersonalRecord): string {
  return pr.reps ? `${pr.reps}RM` : '1RM est';
}

interface PRRow {
  pr: PersonalRecord;
  exerciseName: string;
  type: string;
  improvementLbs: number | null;
  improvementPct: number | null;
  isNew: boolean;
}

export function PRTable() {
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const exercises = useExerciseStore((s) => s.exercises);
  const unit = useSettingsStore((s) => s.settings.weightUnit);

  const rows = useMemo<PRRow[]>(() => {
    const nameById = new Map(exercises.map((e) => [e.id, e.name]));
    const now = new Date();
    // Store keeps PRs sorted newest first already, but be defensive.
    const sorted = [...personalRecords].sort((a, b) => b.date.getTime() - a.date.getTime());
    return sorted.map((pr) => {
      const previous = sorted.find(
        (p) =>
          p.id !== pr.id &&
          p.exerciseId === pr.exerciseId &&
          (p.reps ?? 0) === (pr.reps ?? 0) &&
          p.date.getTime() < pr.date.getTime(),
      );
      const improvementLbs = previous ? pr.value - previous.value : null;
      const improvementPct =
        previous && previous.value > 0 ? Math.round(((pr.value - previous.value) / previous.value) * 1000) / 10 : null;
      return {
        pr,
        exerciseName: nameById.get(pr.exerciseId) ?? 'Unknown exercise',
        type: prType(pr),
        improvementLbs,
        improvementPct,
        isNew: differenceInCalendarDays(now, pr.date) <= 7,
      };
    });
  }, [personalRecords, exercises]);

  return (
    <Card>
      <CardHeader title="PR Tracker" />
      {rows.length === 0 ? (
        <EmptyState icon={Trophy} headline="No personal records yet" description="Personal records are detected automatically as you log workouts." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="section-label text-left py-2 pr-4">Exercise</th>
                <th className="section-label text-left py-2 pr-4">Type</th>
                <th className="section-label text-right py-2 pr-4">Value</th>
                <th className="section-label text-left py-2 pr-4">Date</th>
                <th className="section-label text-right py-2">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.pr.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-4 text-text-primary font-medium">
                    <span className="inline-flex items-center gap-2">
                      {row.exerciseName}
                      {row.isNew && <Badge color="orange">New</Badge>}
                    </span>
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-text-secondary">{row.type}</td>
                  <td className="py-2 pr-4 font-mono text-right text-text-primary">
                    {formatWeight(row.pr.value, unit)}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-text-secondary whitespace-nowrap">
                    {formatFull(row.pr.date)}
                  </td>
                  <td className="py-2 font-mono text-right">
                    {row.improvementLbs !== null && row.improvementLbs > 0 ? (
                      <span className="text-success">
                        +{formatWeight(row.improvementLbs, unit)}
                        {row.improvementPct !== null && (
                          <span className="text-success/70 text-xs"> (+{row.improvementPct}%)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
