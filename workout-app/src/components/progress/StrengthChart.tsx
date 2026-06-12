import { useMemo, useState } from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { CHART } from '../../utils/chartTheme';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatShort } from '../../utils/dates';
import { lbsToKg } from '../../utils/calculations';
import type { CompletedWorkout } from '../../types';

const TICK = { fill: CHART.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };

export function StrengthChart({ workouts }: { workouts: CompletedWorkout[] }) {
  const exercises = useExerciseStore((s) => s.exercises);
  const unit = useSettingsStore((s) => s.settings.weightUnit);
  const [selected, setSelected] = useState('');

  const options = useMemo(() => {
    const ids = new Set<string>();
    for (const w of workouts) {
      for (const block of w.exerciseBlocks) {
        for (const ex of block.exercises) {
          if (ex.sets.some((s) => s.estimatedOneRepMax)) ids.add(ex.exerciseId);
        }
      }
    }
    return exercises
      .filter((e) => ids.has(e.id))
      .map((e) => ({ value: e.id, label: e.name }));
  }, [workouts, exercises]);

  const active = options.some((o) => o.value === selected) ? selected : (options[0]?.value ?? '');

  const data = useMemo(() => {
    if (!active) return [];
    const rows: { ts: number; label: string; oneRM: number }[] = [];
    for (const w of workouts) {
      let best = 0;
      for (const block of w.exerciseBlocks) {
        for (const ex of block.exercises) {
          if (ex.exerciseId !== active) continue;
          for (const s of ex.sets) {
            if (s.estimatedOneRepMax && s.estimatedOneRepMax > best) best = s.estimatedOneRepMax;
          }
        }
      }
      if (best > 0) {
        rows.push({
          ts: w.date.getTime(),
          label: formatShort(w.date),
          oneRM: unit === 'kg' ? lbsToKg(best) : best,
        });
      }
    }
    return rows.sort((a, b) => a.ts - b.ts);
  }, [workouts, active, unit]);

  return (
    <Card>
      <CardHeader
        title="Strength Progress"
        action={
          options.length > 0 ? (
            <Select
              options={options}
              value={active}
              onChange={(e) => setSelected(e.target.value)}
              className="!w-48 !py-1 text-xs"
              aria-label="Exercise"
            />
          ) : undefined
        }
      />
      {data.length === 0 ? (
        <EmptyState icon={TrendingUp} headline="No strength data" description="Log weighted sets to track estimated 1RM over time." />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: CHART.grid }} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={CHART.tooltip}
              formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`, 'est. 1RM']}
            />
            <Line
              type="monotone"
              dataKey="oneRM"
              stroke={CHART.accent}
              strokeWidth={2}
              dot={{ r: 3, fill: CHART.accent, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
