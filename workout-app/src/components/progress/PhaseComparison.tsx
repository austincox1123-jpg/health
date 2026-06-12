import { useMemo, useState } from 'react';
import { endOfDay } from 'date-fns';
import { GitCompareArrows } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { usePlanStore } from '../../stores/planStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatWeight, getCompliancePercent, getPhaseDurationWeeks } from '../../utils/calculations';
import { formatShort } from '../../utils/dates';
import type { CompletedWorkout, Phase } from '../../types';

interface PhaseStats {
  avgWeeklyVolume: number;
  avgSessionRPE: number | null;
  totalWorkouts: number;
  compliancePercent: number;
}

function computePhaseStats(phase: Phase, completed: CompletedWorkout[]): PhaseStats {
  const start = phase.startDate.getTime();
  const end = endOfDay(phase.endDate).getTime();
  const inPhase = completed.filter((w) => {
    const t = w.date.getTime();
    return t >= start && t <= end;
  });
  const totalVolume = inPhase.reduce((acc, w) => acc + w.totalVolume, 0);
  const weeks = Math.max(1, phase.durationWeeks || getPhaseDurationWeeks(phase.startDate, phase.endDate));
  const rpes = inPhase.filter((w) => w.sessionRPE !== undefined).map((w) => w.sessionRPE as number);
  const planned = phase.weeks
    .flatMap((w) => w.plannedSessions)
    .filter((s) => s.sessionType !== 'rest').length;
  return {
    avgWeeklyVolume: totalVolume / weeks,
    avgSessionRPE: rpes.length > 0 ? Math.round((rpes.reduce((a, b) => a + b, 0) / rpes.length) * 10) / 10 : null,
    totalWorkouts: inPhase.length,
    compliancePercent: getCompliancePercent(planned, inPhase.length),
  };
}

export function PhaseComparison() {
  const plans = usePlanStore((s) => s.plans);
  const activePlanId = usePlanStore((s) => s.activePlanId);
  const completed = useWorkoutStore((s) => s.completed);
  const unit = useSettingsStore((s) => s.settings.weightUnit);

  const phases = useMemo(() => {
    const plan = plans.find((p) => p.id === activePlanId);
    if (!plan) return [];
    const now = Date.now();
    return plan.quarters
      .flatMap((q) => q.phases)
      .filter((ph) => ph.startDate.getTime() <= now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [plans, activePlanId]);

  const [idA, setIdA] = useState('');
  const [idB, setIdB] = useState('');

  const phaseA = phases.find((p) => p.id === idA) ?? phases[phases.length - 2] ?? phases[0];
  const phaseB = phases.find((p) => p.id === idB) ?? phases[phases.length - 1];

  const options = phases.map((p) => ({
    value: p.id,
    label: `${p.name} (${formatShort(p.startDate)} – ${formatShort(p.endDate)})`,
  }));

  if (phases.length === 0) {
    return (
      <Card>
        <CardHeader title="Phase Comparison" />
        <EmptyState
          icon={GitCompareArrows}
          headline="No phases to compare"
          description="Create an annual plan and complete training phases to compare performance across them."
        />
      </Card>
    );
  }

  const statsA = phaseA ? computePhaseStats(phaseA, completed) : null;
  const statsB = phaseB ? computePhaseStats(phaseB, completed) : null;

  const metricRows: { label: string; a: string; b: string }[] =
    statsA && statsB
      ? [
          {
            label: 'Avg Weekly Volume',
            a: formatWeight(statsA.avgWeeklyVolume, unit),
            b: formatWeight(statsB.avgWeeklyVolume, unit),
          },
          {
            label: 'Avg Session RPE',
            a: statsA.avgSessionRPE !== null ? String(statsA.avgSessionRPE) : '—',
            b: statsB.avgSessionRPE !== null ? String(statsB.avgSessionRPE) : '—',
          },
          { label: 'Total Workouts', a: String(statsA.totalWorkouts), b: String(statsB.totalWorkouts) },
          { label: 'Compliance', a: `${statsA.compliancePercent}%`, b: `${statsB.compliancePercent}%` },
        ]
      : [];

  return (
    <Card>
      <CardHeader title="Phase Comparison" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Select
          label="Phase A"
          options={options}
          value={phaseA?.id ?? ''}
          onChange={(e) => setIdA(e.target.value)}
        />
        <Select
          label="Phase B"
          options={options}
          value={phaseB?.id ?? ''}
          onChange={(e) => setIdB(e.target.value)}
        />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="section-label text-left py-2 pr-4">Metric</th>
            <th className="section-label text-right py-2 pr-4">{phaseA?.name ?? 'Phase A'}</th>
            <th className="section-label text-right py-2">{phaseB?.name ?? 'Phase B'}</th>
          </tr>
        </thead>
        <tbody>
          {metricRows.map((row) => (
            <tr key={row.label} className="border-b border-border/50 last:border-0">
              <td className="py-2 pr-4 text-text-secondary">{row.label}</td>
              <td className="py-2 pr-4 font-mono text-right text-text-primary">{row.a}</td>
              <td className="py-2 font-mono text-right text-text-primary">{row.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
