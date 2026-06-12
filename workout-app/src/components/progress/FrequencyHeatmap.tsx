import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDays, addWeeks, format, startOfDay } from 'date-fns';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { useSettingsStore } from '../../stores/settingsStore';
import { getWeekStart, orderedDays, DAY_LABELS, formatFull } from '../../utils/dates';
import { formatWeight } from '../../utils/calculations';
import type { CompletedWorkout } from '../../types';

const WEEKS = 52;

interface DayCell {
  date: Date;
  volume: number;
  workouts: CompletedWorkout[];
  isFuture: boolean;
}

function cellClass(cell: DayCell, maxVolume: number): string {
  if (cell.isFuture) return 'bg-transparent';
  if (cell.workouts.length === 0) return 'bg-surface-alt';
  if (cell.volume <= 0 || maxVolume <= 0) return 'bg-accent/25';
  const ratio = cell.volume / maxVolume;
  if (ratio <= 0.25) return 'bg-accent/25';
  if (ratio <= 0.5) return 'bg-accent/50';
  if (ratio <= 0.75) return 'bg-accent/75';
  return 'bg-accent';
}

export function FrequencyHeatmap({ workouts }: { workouts: CompletedWorkout[] }) {
  const weekStart = useSettingsStore((s) => s.settings.weekStart);
  const unit = useSettingsStore((s) => s.settings.weightUnit);
  const [selectedDay, setSelectedDay] = useState<DayCell | null>(null);

  const { columns, monthLabels, maxVolume } = useMemo(() => {
    const byDay = new Map<number, { volume: number; workouts: CompletedWorkout[] }>();
    for (const w of workouts) {
      const key = startOfDay(w.date).getTime();
      const entry = byDay.get(key) ?? { volume: 0, workouts: [] };
      entry.volume += w.totalVolume;
      entry.workouts.push(w);
      byDay.set(key, entry);
    }

    const today = startOfDay(new Date());
    const lastWeek = getWeekStart(today, weekStart);
    const firstWeek = addWeeks(lastWeek, -(WEEKS - 1));

    let max = 0;
    const cols: DayCell[][] = [];
    const months: string[] = [];
    let prevMonth = '';
    for (let i = 0; i < WEEKS; i += 1) {
      const ws = addWeeks(firstWeek, i);
      const month = format(ws, 'MMM');
      months.push(month !== prevMonth ? month : '');
      prevMonth = month;
      const col: DayCell[] = [];
      for (let d = 0; d < 7; d += 1) {
        const date = addDays(ws, d);
        const entry = byDay.get(date.getTime());
        const cell: DayCell = {
          date,
          volume: entry?.volume ?? 0,
          workouts: entry?.workouts ?? [],
          isFuture: date.getTime() > today.getTime(),
        };
        if (cell.volume > max) max = cell.volume;
        col.push(cell);
      }
      cols.push(col);
    }
    return { columns: cols, monthLabels: months, maxVolume: max };
  }, [workouts, weekStart]);

  const dayOrder = orderedDays(weekStart);

  return (
    <Card>
      <CardHeader title="Training Frequency" />
      {workouts.length === 0 ? (
        <EmptyState icon={CalendarDays} headline="No training history" description="Your last 52 weeks of training will show up here." />
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="inline-block min-w-max">
            {/* Month labels */}
            <div className="flex gap-[2px] ml-8 mb-1">
              {monthLabels.map((m, i) => (
                <div key={i} className="w-2.5 shrink-0">
                  {m && (
                    <span className="block font-mono text-[9px] text-text-secondary whitespace-nowrap overflow-visible">
                      {m}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] w-8 shrink-0">
                {dayOrder.map((d, i) => (
                  <div key={d} className="h-2.5 flex items-center">
                    {i % 2 === 1 && (
                      <span className="font-mono text-[9px] text-text-secondary leading-none">{DAY_LABELS[d]}</span>
                    )}
                  </div>
                ))}
              </div>
              {/* Cells */}
              <div className="flex gap-[2px]">
                {columns.map((col, ci) => (
                  <div key={ci} className="flex flex-col gap-[2px]">
                    {col.map((cell) => (
                      <button
                        key={cell.date.getTime()}
                        type="button"
                        disabled={cell.workouts.length === 0}
                        onClick={() => setSelectedDay(cell)}
                        title={`${formatFull(cell.date)}${cell.workouts.length > 0 ? ` — ${cell.workouts.length} session(s), ${formatWeight(cell.volume, unit)}` : ''}`}
                        className={`w-2.5 h-2.5 rounded-[1px] ${cellClass(cell, maxVolume)} ${
                          cell.workouts.length > 0 ? 'cursor-pointer hover:ring-1 hover:ring-accent' : 'cursor-default'
                        }`}
                        aria-label={formatFull(cell.date)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center gap-1.5 mt-2 ml-8">
              <span className="font-mono text-[9px] text-text-secondary">Less</span>
              <div className="w-2.5 h-2.5 rounded-[1px] bg-surface-alt" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-accent/25" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-accent/50" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-accent/75" />
              <div className="w-2.5 h-2.5 rounded-[1px] bg-accent" />
              <span className="font-mono text-[9px] text-text-secondary">More</span>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? formatFull(selectedDay.date) : ''}
      >
        {selectedDay && (
          <div className="space-y-2">
            {selectedDay.workouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between bg-surface-alt border border-border rounded-sm px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{w.name}</p>
                  <p className="font-mono text-[11px] text-text-secondary">
                    {formatWeight(w.totalVolume, unit)} · {w.totalSets} sets
                  </p>
                </div>
                <Link
                  to={`/workouts/${w.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline shrink-0 ml-3"
                >
                  View <ExternalLink size={12} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
}
