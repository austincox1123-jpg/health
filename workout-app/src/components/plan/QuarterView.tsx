import { Pencil, CalendarRange } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Badge, phaseTypeColor } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useSettingsStore } from '../../stores/settingsStore';
import { PHASE_COLORS, PHASE_LABELS } from '../../data/phaseTemplates';
import { formatShort, formatFull, orderedDays, DAY_LABELS } from '../../utils/dates';
import { VOLUME_LABELS, INTENSITY_LABELS } from './planShared';
import type { Phase, QuarterBlock, WeekPlan } from '../../types';

const SESSION_DOT: Record<string, string> = {
  strength: '#F97316',
  cardio: '#3B82F6',
  hiit: '#EF4444',
  mobility: '#8B5CF6',
  active_recovery: '#22C55E',
  rest: '#4B5563',
};

interface QuarterViewProps {
  quarter: QuarterBlock;
  onEditPhase: (phase: Phase) => void;
  onWeekSelect: (phase: Phase, week: WeekPlan) => void;
}

export function QuarterView({ quarter, onEditPhase, onWeekSelect }: QuarterViewProps) {
  const weekStart = useSettingsStore((s) => s.settings.weekStart);
  const days = orderedDays(weekStart);

  const phases = quarter.phases
    .slice()
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const weekRows = phases
    .flatMap((ph) => ph.weeks.map((w) => ({ phase: ph, week: w })))
    .sort((a, b) => a.week.startDate.getTime() - b.week.startDate.getTime());

  if (phases.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={CalendarRange}
          headline={`No phases in ${quarter.label}`}
          description="Edit phase dates from the annual view to move training blocks into this quarter."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phase cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {phases.map((ph) => (
          <Card key={ph.id} accentColor={PHASE_COLORS[ph.type]}>
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <h4 className="text-sm font-extrabold text-text-primary truncate">{ph.name}</h4>
                <span className="text-xs font-mono text-text-secondary">
                  {formatShort(ph.startDate)} – {formatFull(ph.endDate)}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onEditPhase(ph)} aria-label={`Edit ${ph.name}`}>
                <Pencil size={14} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge color={phaseTypeColor(ph.type)}>{PHASE_LABELS[ph.type]}</Badge>
              <Badge color="gray">Vol {VOLUME_LABELS[ph.targetVolumeLevel]}</Badge>
              <Badge color="gray">Int {INTENSITY_LABELS[ph.targetIntensityLevel]}</Badge>
            </div>
            <div className="flex gap-6 text-xs text-text-secondary">
              <span>
                <span className="font-mono text-text-primary font-semibold">{ph.durationWeeks}</span> wk
              </span>
              <span>
                <span className="font-mono text-text-primary font-semibold">{ph.weeklyTargetSessions}</span>{' '}
                sessions/wk
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Week grid */}
      <Card padded={false} className="p-4 overflow-x-auto">
        <CardHeader title="Weekly Schedule" />
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[110px_repeat(7,1fr)] gap-px text-[10px] font-bold uppercase tracking-label text-text-secondary mb-1">
            <span className="px-2">Week</span>
            {days.map((d) => (
              <span key={d} className="px-2">
                {DAY_LABELS[d]}
              </span>
            ))}
          </div>
          <div className="space-y-1">
            {weekRows.map(({ phase, week }) => (
              <button
                key={week.id}
                onClick={() => onWeekSelect(phase, week)}
                className="w-full grid grid-cols-[110px_repeat(7,1fr)] gap-px bg-surface-alt border border-border rounded-sm hover:border-accent transition-colors text-left"
              >
                <div className="px-2 py-1.5 border-r border-border">
                  <span
                    className="block text-xs font-mono font-semibold"
                    style={{ color: PHASE_COLORS[phase.type] }}
                  >
                    {formatShort(week.startDate)}
                  </span>
                  <span className="block text-[10px] text-text-muted truncate">
                    {week.isDeload ? 'Deload' : phase.name}
                  </span>
                </div>
                {days.map((d) => {
                  const sessions = week.plannedSessions.filter((s) => s.dayOfWeek === d);
                  return (
                    <div key={d} className="px-1.5 py-1.5 min-h-[34px] space-y-0.5 overflow-hidden">
                      {sessions.length === 0 ? (
                        <span className="text-[10px] text-text-muted/60">—</span>
                      ) : (
                        sessions.map((s) => (
                          <span
                            key={s.id}
                            className="flex items-center gap-1 text-[10px] text-text-primary truncate"
                            title={`${s.label} (${s.sessionType})`}
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: SESSION_DOT[s.sessionType] ?? '#4B5563' }}
                            />
                            <span className="truncate">{s.label}</span>
                          </span>
                        ))
                      )}
                    </div>
                  );
                })}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-secondary">
          {Object.entries(SESSION_DOT).map(([type, color]) => (
            <span key={type} className="inline-flex items-center gap-1 uppercase tracking-label">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              {type.replace('_', ' ')}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
