import { differenceInCalendarDays } from 'date-fns';
import { usePlanStore } from '../../stores/planStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getWeekStart, getWeekEnd } from '../../utils/dates';
import { getCompliancePercent } from '../../utils/calculations';
import { PHASE_COLORS, PHASE_LABELS } from '../../data/phaseTemplates';
import { allPlanPhases } from './planShared';
import type { AnnualPlan } from '../../types';
import type { ReactNode } from 'react';

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="section-label whitespace-nowrap">{label}</span>
      <span className="text-sm text-text-primary truncate">{children}</span>
    </div>
  );
}

export function PlanSummaryStrip({ plan }: { plan: AnnualPlan }) {
  const currentPhase = usePlanStore((s) => s.currentPhase);
  const currentWeek = usePlanStore((s) => s.currentWeek);
  const completed = useWorkoutStore((s) => s.completed);
  const weekStart = useSettingsStore((s) => s.settings.weekStart);

  const today = new Date();
  const phase = currentPhase(today);
  const week = currentWeek(today);

  // Compliance: completed workouts within the current calendar week vs
  // planned non-rest sessions in the current plan week.
  const ws = getWeekStart(today, weekStart).getTime();
  const we = getWeekEnd(today, weekStart).getTime();
  const doneThisWeek = completed.filter((w) => {
    const t = w.date.getTime();
    return t >= ws && t <= we;
  }).length;
  const plannedThisWeek = week
    ? week.plannedSessions.filter((s) => s.sessionType !== 'rest').length
    : 0;
  const compliance = week ? getCompliancePercent(plannedThisWeek, doneThisWeek) : null;

  // Next phase after the current one (or after today if between phases).
  const phases = allPlanPhases(plan);
  const nextPhase = phases.find((ph) => ph.startDate.getTime() > today.getTime());
  const weeksToNext = nextPhase
    ? Math.max(1, Math.ceil(differenceInCalendarDays(nextPhase.startDate, today) / 7))
    : null;

  const weekIndex =
    phase && week ? phase.weeks.findIndex((w) => w.id === week.id) + 1 : null;

  const complianceColor =
    compliance === null
      ? 'text-text-muted'
      : compliance >= 80
        ? 'text-success'
        : compliance >= 50
          ? 'text-warning'
          : 'text-danger';

  return (
    <div className="sticky top-0 z-20 bg-surface border border-border rounded-sm px-4 py-2.5 flex flex-wrap items-center gap-x-8 gap-y-1.5 shadow-sm">
      <Stat label="Current Phase">
        {phase ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-sm shrink-0"
              style={{ backgroundColor: PHASE_COLORS[phase.type] }}
            />
            <span className="font-semibold">{phase.name}</span>
            {weekIndex ? (
              <span className="font-mono text-text-secondary text-xs">
                wk {weekIndex}/{phase.durationWeeks}
              </span>
            ) : null}
          </span>
        ) : (
          <span className="text-text-muted">None active</span>
        )}
      </Stat>
      <Stat label="Weekly Volume">
        {week?.targetVolume !== undefined ? (
          <span className="font-mono">{week.targetVolume} sets</span>
        ) : (
          <span className="text-text-muted font-mono">—</span>
        )}
      </Stat>
      <Stat label="Compliance">
        {compliance !== null ? (
          <span className={`font-mono font-semibold ${complianceColor}`}>
            {compliance}%
            <span className="text-text-secondary font-normal">
              {' '}
              ({doneThisWeek}/{plannedThisWeek})
            </span>
          </span>
        ) : (
          <span className="text-text-muted font-mono">—</span>
        )}
      </Stat>
      <Stat label="Next">
        {nextPhase && weeksToNext !== null ? (
          <span>
            <span className="font-semibold" style={{ color: PHASE_COLORS[nextPhase.type] }}>
              {nextPhase.name || PHASE_LABELS[nextPhase.type]}
            </span>{' '}
            <span className="font-mono text-text-secondary text-xs">in {weeksToNext} wk</span>
          </span>
        ) : (
          <span className="text-text-muted">End of plan</span>
        )}
      </Stat>
    </div>
  );
}
