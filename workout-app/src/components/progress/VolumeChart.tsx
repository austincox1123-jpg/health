import { useMemo } from 'react';
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { CHART, MUSCLE_CATEGORY_COLORS } from '../../utils/chartTheme';
import { useExerciseStore } from '../../stores/exerciseStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getWeekStart, formatShort } from '../../utils/dates';
import { lbsToKg } from '../../utils/calculations';
import type { CompletedWorkout, ExerciseCategory } from '../../types';

const TICK = { fill: CHART.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };

function labelize(value: string): string {
  return value.replace(/_/g, ' ');
}

function compactNumber(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

interface WeekRow {
  label: string;
  [category: string]: string | number;
}

export function VolumeChart({ workouts }: { workouts: CompletedWorkout[] }) {
  const exercises = useExerciseStore((s) => s.exercises);
  const unit = useSettingsStore((s) => s.settings.weightUnit);
  const weekStart = useSettingsStore((s) => s.settings.weekStart);

  const { data, categories } = useMemo(() => {
    const categoryById = new Map(exercises.map((e) => [e.id, e.category]));
    const weekMap = new Map<number, Partial<Record<ExerciseCategory, number>>>();
    const present = new Set<ExerciseCategory>();

    for (const w of workouts) {
      const key = getWeekStart(w.date, weekStart).getTime();
      const row = weekMap.get(key) ?? {};
      for (const block of w.exerciseBlocks) {
        for (const ex of block.exercises) {
          const category = categoryById.get(ex.exerciseId) ?? 'full_body';
          let volume = 0;
          for (const set of ex.sets) {
            if (set.weight && set.reps) volume += set.weight * set.reps;
          }
          if (volume > 0) {
            row[category] = (row[category] ?? 0) + volume;
            present.add(category);
          }
        }
      }
      weekMap.set(key, row);
    }

    const cats = (Object.keys(MUSCLE_CATEGORY_COLORS) as ExerciseCategory[]).filter((c) => present.has(c));
    const rows: WeekRow[] = [...weekMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, byCat]) => {
        const row: WeekRow = { label: formatShort(new Date(ts)) };
        for (const c of cats) {
          const lbs = byCat[c] ?? 0;
          row[c] = unit === 'kg' ? lbsToKg(lbs) : Math.round(lbs);
        }
        return row;
      });
    return { data: rows, categories: cats };
  }, [workouts, exercises, weekStart, unit]);

  return (
    <Card>
      <CardHeader title="Weekly Training Volume" />
      {data.length === 0 ? (
        <EmptyState icon={BarChart3} headline="No volume data" description="Complete a workout with weighted sets to see weekly volume here." />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: CHART.grid }} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={compactNumber} />
            <Tooltip
              contentStyle={CHART.tooltip}
              cursor={{ fill: '#1C2030', opacity: 0.5 }}
              formatter={(value) => `${Number(value).toLocaleString()} ${unit}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value) => labelize(String(value))} />
            {categories.map((c) => (
              <Bar key={c} dataKey={c} stackId="volume" fill={MUSCLE_CATEGORY_COLORS[c]} name={labelize(c)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
