import { useMemo } from 'react';
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { format, isSameDay, startOfDay, subDays } from 'date-fns';
import { Card, CardHeader } from '../ui/Card';
import { CHART } from '../../utils/chartTheme';
import type { NutritionLogEntry } from '../../types';

const TICK = { fill: CHART.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };

export function CaloriesTrendChart({ logs, targetCalories }: {
  logs: NutritionLogEntry[];
  targetCalories: number;
}) {
  const data = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const day = subDays(today, 13 - i);
      const calories = logs
        .filter((l) => isSameDay(l.date, day))
        .reduce((sum, l) => sum + l.calories, 0);
      return { label: format(day, 'M/d'), calories };
    });
  }, [logs]);

  return (
    <Card>
      <CardHeader title="14-Day Calories vs Target" />
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid stroke={CHART.grid} vertical={false} />
          <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: CHART.grid }} tickLine={false} />
          <YAxis tick={TICK} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={CHART.tooltip}
            cursor={{ fill: '#1C2030', opacity: 0.5 }}
            formatter={(value) => [`${Number(value).toLocaleString()} kcal`, 'Calories']}
          />
          <ReferenceLine
            y={targetCalories}
            stroke={CHART.accentAlt}
            strokeDasharray="4 4"
            label={{ value: 'target', position: 'insideTopRight', fill: CHART.accentAlt, fontSize: 10 }}
          />
          <Bar dataKey="calories" radius={[2, 2, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.label}
                fill={d.calories > targetCalories * 1.1 ? CHART.danger : CHART.accent}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
