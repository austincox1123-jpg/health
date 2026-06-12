import { useMemo } from 'react';
import {
  ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { AreaChart as AreaChartIcon } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { CHART } from '../../utils/chartTheme';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatShort } from '../../utils/dates';
import { lbsToKg } from '../../utils/calculations';
import type { CompletedWorkout } from '../../types';

const TICK = { fill: CHART.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };
const WINDOW_MS = 28 * 24 * 60 * 60 * 1000;

function compactNumber(value: number): string {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}

export function SessionLoadChart({ workouts }: { workouts: CompletedWorkout[] }) {
  const unit = useSettingsStore((s) => s.settings.weightUnit);

  const data = useMemo(() => {
    const sessions = [...workouts].sort((a, b) => a.date.getTime() - b.date.getTime());
    const toDisplay = (lbs: number) => (unit === 'kg' ? lbsToKg(lbs) : Math.round(lbs));
    return sessions.map((w, i) => {
      const t = w.date.getTime();
      let sum = 0;
      let count = 0;
      for (let j = i; j >= 0; j -= 1) {
        const tj = sessions[j].date.getTime();
        if (t - tj > WINDOW_MS) break;
        sum += sessions[j].totalVolume;
        count += 1;
      }
      return {
        label: formatShort(w.date),
        volume: toDisplay(w.totalVolume),
        rollingAvg: count > 0 ? toDisplay(sum / count) : 0,
      };
    });
  }, [workouts, unit]);

  return (
    <Card>
      <CardHeader title="Session Load" />
      {data.length === 0 ? (
        <EmptyState icon={AreaChartIcon} headline="No sessions logged" description="Session volume and 4-week rolling average will appear here." />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke={CHART.grid} vertical={false} />
            <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: CHART.grid }} tickLine={false} />
            <YAxis tick={TICK} axisLine={false} tickLine={false} tickFormatter={compactNumber} />
            <Tooltip
              contentStyle={CHART.tooltip}
              formatter={(value) => `${Number(value).toLocaleString()} ${unit}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area
              type="monotone"
              dataKey="volume"
              name="session volume"
              stroke={CHART.accent}
              strokeWidth={1.5}
              fill={CHART.accent}
              fillOpacity={0.15}
            />
            <Line
              type="monotone"
              dataKey="rollingAvg"
              name="4-wk rolling avg"
              stroke={CHART.accentAlt}
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
