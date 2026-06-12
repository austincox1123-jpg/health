import { differenceInCalendarDays, eachMonthOfInterval, format } from 'date-fns';
import { Card } from '../ui/Card';
import { Badge, phaseTypeColor } from '../ui/Badge';
import { PHASE_COLORS, GOAL_LABELS, PHASE_LABELS } from '../../data/phaseTemplates';
import { allPlanPhases } from './planShared';
import type { AnnualPlan, Phase, QuarterBlock } from '../../types';

interface AnnualGanttProps {
  plan: AnnualPlan;
  onPhaseClick: (phase: Phase) => void;
  onQuarterSelect: (quarter: QuarterBlock) => void;
}

export function AnnualGantt({ plan, onPhaseClick, onQuarterSelect }: AnnualGanttProps) {
  const phases = allPlanPhases(plan);

  if (phases.length === 0) {
    return (
      <Card>
        <p className="text-sm text-text-secondary">This plan has no phases yet.</p>
      </Card>
    );
  }

  const planStart = phases[0].startDate;
  const planEnd = phases.reduce(
    (max, ph) => (ph.endDate.getTime() > max.getTime() ? ph.endDate : max),
    phases[0].endDate,
  );
  const totalDays = Math.max(1, differenceInCalendarDays(planEnd, planStart) + 1);
  const totalWeeks = Math.round(totalDays / 7);
  const pos = (date: Date) =>
    Math.min(100, Math.max(0, (differenceInCalendarDays(date, planStart) / totalDays) * 100));

  const today = new Date();
  const todayPos =
    today.getTime() >= planStart.getTime() && today.getTime() <= planEnd.getTime()
      ? pos(today)
      : null;

  const months = eachMonthOfInterval({ start: planStart, end: planEnd });

  return (
    <div className="space-y-4">
      <Card padded={false} className="p-4">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="section-label">Annual Overview</h3>
          <span className="text-xs font-mono text-text-secondary">{totalWeeks} weeks</span>
        </div>

        {/* Month labels */}
        <div className="relative h-4 mb-1">
          {months.map((m) => {
            const p = pos(m.getTime() < planStart.getTime() ? planStart : m);
            if (p > 98) return null;
            return (
              <span
                key={m.toISOString()}
                className="absolute text-[10px] font-mono uppercase text-text-secondary"
                style={{ left: `${p}%` }}
              >
                {format(m, 'MMM')}
              </span>
            );
          })}
        </div>

        {/* Week ticks */}
        <div className="relative h-1.5">
          {Array.from({ length: totalWeeks + 1 }, (_, i) => (
            <span
              key={i}
              className={`absolute bottom-0 w-px ${i % 4 === 0 ? 'h-1.5 bg-border' : 'h-1 bg-border/60'}`}
              style={{ left: `${(i / totalWeeks) * 100}%` }}
            />
          ))}
        </div>

        {/* Phase band */}
        <div className="relative h-14 bg-surface-alt border border-border rounded-sm overflow-hidden">
          {phases.map((ph) => {
            const left = pos(ph.startDate);
            const width = Math.max(
              0.5,
              ((differenceInCalendarDays(ph.endDate, ph.startDate) + 1) / totalDays) * 100,
            );
            return (
              <button
                key={ph.id}
                onClick={() => onPhaseClick(ph)}
                title={`${ph.name} · ${PHASE_LABELS[ph.type]} · ${ph.durationWeeks} wk`}
                className="absolute inset-y-0 flex flex-col items-start justify-center px-1.5 overflow-hidden border-r border-background/40 hover:brightness-110 transition-[filter] text-left"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  backgroundColor: `${PHASE_COLORS[ph.type]}CC`,
                }}
              >
                <span className="text-[11px] font-bold text-white leading-tight truncate w-full">
                  {ph.name}
                </span>
                <span className="text-[10px] font-mono text-white/80 leading-tight">
                  {ph.durationWeeks}w
                </span>
              </button>
            );
          })}
          {todayPos !== null && (
            <div
              className="absolute inset-y-0 w-0.5 bg-text-primary z-10 pointer-events-none"
              style={{ left: `${todayPos}%` }}
            />
          )}
        </div>
        {todayPos !== null && (
          <div className="relative h-4 mt-0.5">
            <span
              className="absolute text-[9px] font-mono font-bold uppercase tracking-label text-text-primary -translate-x-1/2"
              style={{ left: `${todayPos}%` }}
            >
              Today
            </span>
          </div>
        )}
      </Card>

      {/* Quarter cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {plan.quarters.map((q) => (
          <Card
            key={q.id}
            className="cursor-pointer hover:border-accent transition-colors"
            onClick={() => onQuarterSelect(q)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onQuarterSelect(q);
              }
            }}
          >
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-sm font-extrabold text-text-primary font-mono">{q.label}</span>
              <span className="text-[10px] font-mono text-text-secondary">
                {q.phases.length} {q.phases.length === 1 ? 'phase' : 'phases'}
              </span>
            </div>
            <p className="section-label mb-2">{GOAL_LABELS[q.goal]}</p>
            <div className="flex flex-wrap gap-1">
              {q.phases.length === 0 ? (
                <span className="text-xs text-text-muted">No phases</span>
              ) : (
                q.phases.map((ph) => (
                  <Badge key={ph.id} color={phaseTypeColor(ph.type)}>
                    {ph.name}
                  </Badge>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
