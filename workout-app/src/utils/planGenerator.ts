import { addDays, addWeeks, getQuarter, getISOWeek } from 'date-fns';
import type {
  AnnualPlan, GoalType, Phase, PlannedSession, QuarterBlock, WeekPlan, DayOfWeek,
} from '../types';
import { phaseTemplates, GOAL_LABELS } from '../data/phaseTemplates';

export interface PlanWizardInput {
  goal: GoalType;
  year: number;
  startDate: Date;
  daysPerWeek: number;
  equipment: 'full_gym' | 'home_gym' | 'bodyweight';
  events: { date: Date; label: string }[];
}

const VOLUME_TO_SETS: Record<string, number> = {
  low: 60, moderate: 90, high: 120, very_high: 150,
};

/** Default training days spread across the week for N sessions. */
function trainingDays(daysPerWeek: number): DayOfWeek[] {
  const spreads: Record<number, DayOfWeek[]> = {
    2: [1, 4],
    3: [1, 3, 5],
    4: [1, 2, 4, 5],
    5: [1, 2, 3, 5, 6],
    6: [1, 2, 3, 4, 5, 6],
    7: [0, 1, 2, 3, 4, 5, 6],
  };
  return spreads[Math.min(7, Math.max(2, daysPerWeek))];
}

/**
 * Generate a full annual plan by repeating the goal's phase sequence until 52
 * weeks are filled, then bucketing phases into calendar quarters.
 */
export function generateAnnualPlan(input: PlanWizardInput): AnnualPlan {
  const planId = crypto.randomUUID();
  const sequence = phaseTemplates[input.goal];
  const days = trainingDays(input.daysPerWeek);

  // Build the phase list, repeating the sequence to cover 52 weeks.
  const phases: Phase[] = [];
  let cursor = input.startDate;
  let weeksUsed = 0;
  let seqIndex = 0;
  while (weeksUsed < 52) {
    const tpl = sequence[seqIndex % sequence.length];
    const duration = Math.min(tpl.durationWeeks, 52 - weeksUsed);
    const startDate = cursor;
    const endDate = addDays(addWeeks(startDate, duration), -1);
    const phaseId = crypto.randomUUID();

    const weeks: WeekPlan[] = Array.from({ length: duration }, (_, i) => {
      const weekId = crypto.randomUUID();
      const weekStart = addWeeks(startDate, i);
      const isDeload = tpl.type === 'deload' || tpl.type === 'active_recovery';
      const sessions: PlannedSession[] = days.map((dayOfWeek): PlannedSession => ({
        id: crypto.randomUUID(),
        weekId,
        dayOfWeek,
        label: isDeload ? 'Easy Session' : `${tpl.name} Session`,
        sessionType: isDeload ? 'active_recovery' : input.goal === 'endurance' ? 'cardio' : 'strength',
        notes: '',
      }));
      return {
        id: weekId,
        phaseId,
        weekNumber: getISOWeek(weekStart),
        startDate: weekStart,
        isDeload,
        targetVolume: VOLUME_TO_SETS[tpl.targetVolumeLevel],
        plannedSessions: sessions,
        notes: '',
      };
    });

    phases.push({
      id: phaseId,
      quarterId: '', // assigned below
      name: tpl.name,
      type: tpl.type,
      startDate,
      endDate,
      durationWeeks: duration,
      targetVolumeLevel: tpl.targetVolumeLevel,
      targetIntensityLevel: tpl.targetIntensityLevel,
      weeklyTargetSessions: input.daysPerWeek,
      notes: '',
      weeks,
    });

    cursor = addWeeks(cursor, duration);
    weeksUsed += duration;
    seqIndex += 1;
  }

  // Bucket phases into quarters by their start date.
  const quarters: QuarterBlock[] = [1, 2, 3, 4].map((q) => ({
    id: crypto.randomUUID(),
    annualPlanId: planId,
    label: `Q${q} ${input.year}`,
    quarterNumber: q as 1 | 2 | 3 | 4,
    goal: input.goal,
    phases: [],
    notes: '',
  }));
  for (const phase of phases) {
    const q = quarters[getQuarter(phase.startDate) - 1];
    phase.quarterId = q.id;
    q.phases.push(phase);
  }

  const eventNotes = input.events.length
    ? `Events: ${input.events.map((e) => `${e.label} (${e.date.toLocaleDateString()})`).join(', ')}`
    : '';

  return {
    id: planId,
    name: `${input.year} ${GOAL_LABELS[input.goal]} Plan`,
    year: input.year,
    primaryGoal: input.goal,
    createdAt: new Date(),
    quarters,
    notes: [`Equipment: ${input.equipment.replace('_', ' ')}`, eventNotes].filter(Boolean).join('\n'),
  };
}
