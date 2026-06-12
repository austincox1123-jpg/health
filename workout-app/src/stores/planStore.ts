import { create } from 'zustand';
import { getAll, put, deleteById, getDB } from '../db';
import type { AnnualPlan, Phase, WeekPlan, PlannedSession } from '../types';

/**
 * Annual plans are stored as nested documents (quarters → phases → weeks →
 * sessions) in the annual_plans store for atomic read/write of a whole plan.
 */
interface PlanState {
  plans: AnnualPlan[];
  activePlanId: string | null;
  loaded: boolean;
  load: () => Promise<void>;
  savePlan: (plan: AnnualPlan) => Promise<void>;
  deletePlan: (id: string) => Promise<void>;
  setActivePlan: (id: string | null) => Promise<void>;
  activePlan: () => AnnualPlan | undefined;
  /** Phase containing the given date (defaults to today) in the active plan. */
  currentPhase: (date?: Date) => Phase | undefined;
  currentWeek: (date?: Date) => WeekPlan | undefined;
  updateSession: (session: PlannedSession) => Promise<void>;
}

function allPhases(plan: AnnualPlan): Phase[] {
  return plan.quarters.flatMap((q) => q.phases);
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  activePlanId: null,
  loaded: false,
  load: async () => {
    const plans = await getAll<AnnualPlan>('annual_plans');
    plans.sort((a, b) => b.year - a.year);
    const db = await getDB();
    const activePlanId = ((await db.get('settings', 'activePlanId')) as string | undefined) ?? plans[0]?.id ?? null;
    set({ plans, activePlanId, loaded: true });
  },
  savePlan: async (plan) => {
    await put('annual_plans', plan, plan.id);
    set((s) => ({
      plans: [...s.plans.filter((p) => p.id !== plan.id), plan].sort((a, b) => b.year - a.year),
      activePlanId: s.activePlanId ?? plan.id,
    }));
  },
  deletePlan: async (id) => {
    await deleteById('annual_plans', id);
    set((s) => ({
      plans: s.plans.filter((p) => p.id !== id),
      activePlanId: s.activePlanId === id ? null : s.activePlanId,
    }));
  },
  setActivePlan: async (id) => {
    set({ activePlanId: id });
    const db = await getDB();
    await db.put('settings', id, 'activePlanId');
  },
  activePlan: () => get().plans.find((p) => p.id === get().activePlanId),
  currentPhase: (date = new Date()) => {
    const plan = get().activePlan();
    if (!plan) return undefined;
    const t = date.getTime();
    return allPhases(plan).find((ph) => ph.startDate.getTime() <= t && t <= ph.endDate.getTime());
  },
  currentWeek: (date = new Date()) => {
    const phase = get().currentPhase(date);
    if (!phase) return undefined;
    const t = date.getTime();
    return phase.weeks.find((w) => {
      const end = w.startDate.getTime() + 7 * 24 * 60 * 60 * 1000;
      return w.startDate.getTime() <= t && t < end;
    });
  },
  updateSession: async (session) => {
    const plan = get().activePlan();
    if (!plan) return;
    const next: AnnualPlan = {
      ...plan,
      quarters: plan.quarters.map((q) => ({
        ...q,
        phases: q.phases.map((ph) => ({
          ...ph,
          weeks: ph.weeks.map((w) =>
            w.id !== session.weekId
              ? w
              : {
                  ...w,
                  plannedSessions: [
                    ...w.plannedSessions.filter((ps) => ps.id !== session.id),
                    session,
                  ],
                },
          ),
        })),
      })),
    };
    await get().savePlan(next);
  },
}));
