import { useMemo, useState } from 'react';
import { startOfDay, subDays, subMonths, subWeeks, subYears } from 'date-fns';
import { Activity, CalendarCheck, Dumbbell, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { useWorkoutStore } from '../stores/workoutStore';
import { useSettingsStore } from '../stores/settingsStore';
import { formatWeight } from '../utils/calculations';
import type { CompletedWorkout } from '../types';
import { VolumeChart } from '../components/progress/VolumeChart';
import { StrengthChart } from '../components/progress/StrengthChart';
import { SessionLoadChart } from '../components/progress/SessionLoadChart';
import { FrequencyHeatmap } from '../components/progress/FrequencyHeatmap';
import { PRTable } from '../components/progress/PRTable';
import { PhaseComparison } from '../components/progress/PhaseComparison';
import { BodyMetricsPanel } from '../components/progress/BodyMetricsPanel';

type Timeframe = '4w' | '3m' | '6m' | '1y' | 'all';

const TIMEFRAME_TABS: { value: Timeframe; label: string }[] = [
  { value: '4w', label: '4W' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
];

function timeframeCutoff(timeframe: Timeframe): Date | null {
  const now = new Date();
  switch (timeframe) {
    case '4w': return subWeeks(now, 4);
    case '3m': return subMonths(now, 3);
    case '6m': return subMonths(now, 6);
    case '1y': return subYears(now, 1);
    case 'all': return null;
  }
}

function currentStreakDays(completed: CompletedWorkout[]): number {
  const days = new Set(completed.map((w) => startOfDay(w.date).getTime()));
  let cursor = startOfDay(new Date());
  if (!days.has(cursor.getTime())) cursor = subDays(cursor, 1);
  let streak = 0;
  while (days.has(cursor.getTime())) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

function StatCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="bg-surface-alt border border-border rounded-sm p-2 text-accent">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <p className="section-label mb-0.5">{label}</p>
          <p className="stat-value text-xl leading-tight truncate">{value}</p>
          {sub && <p className="font-mono text-[11px] text-text-muted mt-0.5">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

export function ProgressPage() {
  const completed = useWorkoutStore((s) => s.completed);
  const settings = useSettingsStore((s) => s.settings);
  const [timeframe, setTimeframe] = useState<Timeframe>('3m');

  const filtered = useMemo(() => {
    const cutoff = timeframeCutoff(timeframe);
    if (!cutoff) return completed;
    return completed.filter((w) => w.date.getTime() >= cutoff.getTime());
  }, [completed, timeframe]);

  const stats = useMemo(() => {
    const totalVolume = completed.reduce((acc, w) => acc + w.totalVolume, 0);
    const trainingDays = new Set(completed.map((w) => startOfDay(w.date).getTime())).size;
    return {
      totalWorkouts: completed.length,
      totalVolume,
      trainingDays,
      streak: currentStreakDays(completed),
    };
  }, [completed]);

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Dumbbell} label="Total Workouts" value={String(stats.totalWorkouts)} />
        <StatCard icon={Activity} label="Total Volume" value={formatWeight(stats.totalVolume, settings.weightUnit)} />
        <StatCard icon={CalendarCheck} label="Training Days" value={String(stats.trainingDays)} />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}`}
          sub="consecutive training days"
        />
      </div>

      {/* Timeframe + 2x2 chart grid */}
      <div className="flex items-center justify-between">
        <h2 className="section-label">Training Analytics</h2>
        <Tabs tabs={TIMEFRAME_TABS} active={timeframe} onChange={setTimeframe} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <VolumeChart workouts={filtered} />
        <StrengthChart workouts={filtered} />
        <SessionLoadChart workouts={filtered} />
        <FrequencyHeatmap workouts={completed} />
      </div>

      <PRTable />
      <PhaseComparison />
      <BodyMetricsPanel />
    </div>
  );
}
