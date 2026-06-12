import { addDays, format } from 'date-fns';
import type {
  AnnualPlan,
  CompletedWorkout,
  DayOfWeek,
  IntensityLevel,
  Phase,
  PhaseType,
  SessionType,
  VolumeLevel,
  WeekPlan,
} from '../../types';
import { PHASE_LABELS } from '../../data/phaseTemplates';
import { getCompliancePercent } from '../../utils/calculations';

// ---------- Plan deep-update helpers ----------

/** Replace a phase (matched by id) anywhere in the nested plan document. */
export function updatePhaseInPlan(plan: AnnualPlan, phase: Phase): AnnualPlan {
  return {
    ...plan,
    quarters: plan.quarters.map((q) => ({
      ...q,
      phases: q.phases.map((ph) => (ph.id === phase.id ? { ...phase, quarterId: q.id } : ph)),
    })),
  };
}

/** Remove a phase (matched by id) anywhere in the nested plan document. */
export function removePhaseFromPlan(plan: AnnualPlan, phaseId: string): AnnualPlan {
  return {
    ...plan,
    quarters: plan.quarters.map((q) => ({
      ...q,
      phases: q.phases.filter((ph) => ph.id !== phaseId),
    })),
  };
}

/** Remove a planned session from a specific week in the nested plan document. */
export function removeSessionFromPlan(plan: AnnualPlan, weekId: string, sessionId: string): AnnualPlan {
  return {
    ...plan,
    quarters: plan.quarters.map((q) => ({
      ...q,
      phases: q.phases.map((ph) => ({
        ...ph,
        weeks: ph.weeks.map((w) =>
          w.id !== weekId
            ? w
            : { ...w, plannedSessions: w.plannedSessions.filter((s) => s.id !== sessionId) },
        ),
      })),
    })),
  };
}

/** All phases of a plan, flattened and sorted by start date. */
export function allPlanPhases(plan: AnnualPlan): Phase[] {
  return plan.quarters
    .flatMap((q) => q.phases)
    .slice()
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

// ---------- Compliance ----------

export interface WeekCompliance {
  done: number;
  planned: number;
  pct: number;
}

/** Completed workouts inside the plan-week window vs planned non-rest sessions. */
export function weekCompliance(week: WeekPlan, completed: CompletedWorkout[]): WeekCompliance {
  const start = week.startDate.getTime();
  const end = start + 7 * 24 * 60 * 60 * 1000;
  const done = completed.filter((w) => {
    const t = w.date.getTime();
    return t >= start && t < end;
  }).length;
  const planned = week.plannedSessions.filter((s) => s.sessionType !== 'rest').length;
  return { done, planned, pct: getCompliancePercent(planned, done) };
}

// ---------- Dates ----------

/** Calendar date within a plan week for a given absolute day-of-week. */
export function dayDateInWeek(week: WeekPlan, dayOfWeek: DayOfWeek): Date {
  for (let i = 0; i < 7; i += 1) {
    const d = addDays(week.startDate, i);
    if (d.getDay() === dayOfWeek) return d;
  }
  return week.startDate;
}

export function toDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function fromDateInput(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

// ---------- Select options ----------

export const PHASE_TYPE_OPTIONS: { value: PhaseType; label: string }[] = (
  Object.keys(PHASE_LABELS) as PhaseType[]
).map((t) => ({ value: t, label: PHASE_LABELS[t] }));

export const VOLUME_LABELS: Record<VolumeLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
};

export const INTENSITY_LABELS: Record<IntensityLevel, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  maximal: 'Maximal',
};

export const VOLUME_OPTIONS: { value: VolumeLevel; label: string }[] = (
  Object.keys(VOLUME_LABELS) as VolumeLevel[]
).map((v) => ({ value: v, label: VOLUME_LABELS[v] }));

export const INTENSITY_OPTIONS: { value: IntensityLevel; label: string }[] = (
  Object.keys(INTENSITY_LABELS) as IntensityLevel[]
).map((v) => ({ value: v, label: INTENSITY_LABELS[v] }));

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  strength: 'Strength',
  cardio: 'Cardio',
  hiit: 'HIIT',
  mobility: 'Mobility',
  rest: 'Rest',
  active_recovery: 'Active Recovery',
};

export const SESSION_TYPE_OPTIONS: { value: SessionType; label: string }[] = (
  Object.keys(SESSION_TYPE_LABELS) as SessionType[]
).map((s) => ({ value: s, label: SESSION_TYPE_LABELS[s] }));
