import type {
  AnnualPlan,
  BlockType,
  ExerciseBlock,
  PhaseType,
  PlannedSession,
  PlannedSet,
  WorkoutTemplate,
} from '../types';
import type { PlanWizardInput } from './planGenerator';
import { PHASE_LABELS } from '../data/phaseTemplates';

// ---------- Set & rep schemes per phase type ----------

interface SetScheme {
  sets: number;
  reps: number;
  repsMax?: number;
  rpe: number;
}

interface PhaseScheme {
  compound: SetScheme;
  accessory: SetScheme;
  restSeconds: number;
}

type SchemeKey = 'base' | 'build' | 'strength' | 'peak' | 'taper' | 'deload';

const SCHEMES: Record<SchemeKey, PhaseScheme> = {
  base: {
    compound: { sets: 3, reps: 8, repsMax: 12, rpe: 7 },
    accessory: { sets: 3, reps: 8, repsMax: 12, rpe: 7 },
    restSeconds: 90,
  },
  build: {
    compound: { sets: 4, reps: 8, repsMax: 12, rpe: 8 },
    accessory: { sets: 4, reps: 8, repsMax: 12, rpe: 8 },
    restSeconds: 90,
  },
  strength: {
    compound: { sets: 4, reps: 3, repsMax: 5, rpe: 8.5 },
    accessory: { sets: 3, reps: 6, repsMax: 8, rpe: 8 },
    restSeconds: 180,
  },
  peak: {
    compound: { sets: 5, reps: 1, repsMax: 3, rpe: 9 },
    accessory: { sets: 2, reps: 8, repsMax: 10, rpe: 6 },
    restSeconds: 180,
  },
  taper: {
    compound: { sets: 2, reps: 3, repsMax: 5, rpe: 7 },
    accessory: { sets: 2, reps: 3, repsMax: 5, rpe: 7 },
    restSeconds: 180,
  },
  deload: {
    compound: { sets: 2, reps: 10, rpe: 5 },
    accessory: { sets: 2, reps: 10, rpe: 5 },
    restSeconds: 60,
  },
};

function schemeKeyFor(type: PhaseType): SchemeKey {
  switch (type) {
    case 'build':
    case 'hypertrophy':
      return 'build';
    case 'strength':
      return 'strength';
    case 'peak':
    case 'power':
      return 'peak';
    case 'taper':
      return 'taper';
    case 'deload':
    case 'active_recovery':
      return 'deload';
    default:
      return 'base';
  }
}

/** Tag / dedupe key for a phase type (deload & active recovery collapse). */
function normalizedType(type: PhaseType): string {
  return type === 'active_recovery' ? 'deload' : type;
}

// ---------- Exercise menus per equipment tier ----------

type Role =
  | 'squat' | 'hinge' | 'hPush' | 'vPush' | 'hPull' | 'vPull'
  | 'pushAcc' | 'pullAcc' | 'legAcc' | 'core';

type Menu = Record<Role, string[]>;

const MENUS: Record<PlanWizardInput['equipment'], Menu> = {
  full_gym: {
    squat: ['ex-barbell-back-squat', 'ex-barbell-front-squat'],
    hinge: ['ex-barbell-deadlift', 'ex-barbell-romanian-deadlift', 'ex-barbell-hip-thrust'],
    hPush: ['ex-barbell-bench-press', 'ex-barbell-incline-bench-press', 'ex-dumbbell-bench-press'],
    vPush: ['ex-barbell-overhead-press', 'ex-dumbbell-shoulder-press'],
    hPull: ['ex-barbell-row', 'ex-cable-row', 'ex-dumbbell-row'],
    vPull: ['ex-cable-lat-pulldown', 'ex-bodyweight-pull-up'],
    pushAcc: ['ex-dumbbell-lateral-raise', 'ex-cable-tricep-pushdown', 'ex-cable-fly', 'ex-dumbbell-skull-crusher'],
    pullAcc: ['ex-cable-face-pull', 'ex-dumbbell-curl', 'ex-cable-curl', 'ex-dumbbell-rear-delt-fly'],
    legAcc: ['ex-machine-leg-press', 'ex-machine-lying-leg-curl', 'ex-dumbbell-walking-lunge', 'ex-machine-standing-calf-raise'],
    core: ['ex-bodyweight-plank', 'ex-bodyweight-hanging-leg-raise', 'ex-cable-pallof-press'],
  },
  home_gym: {
    squat: ['ex-dumbbell-goblet-squat', 'ex-kettlebell-front-squat'],
    hinge: ['ex-dumbbell-rdl', 'ex-kettlebell-swing', 'ex-kettlebell-deadlift'],
    hPush: ['ex-dumbbell-bench-press', 'ex-bodyweight-push-up', 'ex-dumbbell-incline-press'],
    vPush: ['ex-dumbbell-shoulder-press', 'ex-kettlebell-press'],
    hPull: ['ex-dumbbell-row', 'ex-dumbbell-chest-supported-row'],
    vPull: ['ex-bodyweight-pull-up', 'ex-bodyweight-chin-up'],
    pushAcc: ['ex-dumbbell-lateral-raise', 'ex-dumbbell-overhead-tricep-extension', 'ex-dumbbell-fly', 'ex-dumbbell-skull-crusher'],
    pullAcc: ['ex-band-face-pull', 'ex-dumbbell-curl', 'ex-dumbbell-hammer-curl', 'ex-dumbbell-rear-delt-fly'],
    legAcc: ['ex-dumbbell-bulgarian-split-squat', 'ex-dumbbell-walking-lunge', 'ex-dumbbell-calf-raise', 'ex-bodyweight-glute-bridge'],
    core: ['ex-bodyweight-plank', 'ex-bodyweight-hanging-leg-raise', 'ex-bodyweight-dead-bug'],
  },
  bodyweight: {
    squat: ['ex-bodyweight-squat', 'ex-bodyweight-pistol-squat'],
    hinge: ['ex-bodyweight-glute-bridge', 'ex-bodyweight-single-leg-glute-bridge', 'ex-bodyweight-nordic-curl'],
    hPush: ['ex-bodyweight-push-up', 'ex-bodyweight-diamond-push-up'],
    vPush: ['ex-bodyweight-pike-push-up', 'ex-bodyweight-dip'],
    hPull: ['ex-bodyweight-australian-row'],
    vPull: ['ex-bodyweight-pull-up', 'ex-bodyweight-chin-up'],
    pushAcc: ['ex-bodyweight-dip', 'ex-bodyweight-diamond-push-up'],
    pullAcc: ['ex-bodyweight-superman', 'ex-bodyweight-neutral-grip-pull-up'],
    legAcc: ['ex-bodyweight-walking-lunge', 'ex-bodyweight-step-up', 'ex-bodyweight-jump-squat', 'ex-bodyweight-wall-sit'],
    core: ['ex-bodyweight-plank', 'ex-bodyweight-hollow-body-hold', 'ex-bodyweight-hanging-leg-raise'],
  },
};

interface CardioMenu {
  intervals: string;
  steady: string;
  long: string;
  conditioning: string[];
}

const CARDIO_MENUS: Record<PlanWizardInput['equipment'], CardioMenu> = {
  full_gym: {
    intervals: 'ex-cardio-rowing-machine',
    steady: 'ex-cardio-cycling',
    long: 'ex-cardio-treadmill-run',
    conditioning: ['ex-cardio-rowing-machine', 'ex-cardio-assault-bike'],
  },
  home_gym: {
    intervals: 'ex-kettlebell-swing',
    steady: 'ex-cardio-jump-rope',
    long: 'ex-cardio-jump-rope',
    conditioning: ['ex-kettlebell-swing', 'ex-cardio-jump-rope'],
  },
  bodyweight: {
    intervals: 'ex-bodyweight-burpee',
    steady: 'ex-cardio-jump-rope',
    long: 'ex-cardio-jump-rope',
    conditioning: ['ex-bodyweight-burpee', 'ex-bodyweight-mountain-climbers'],
  },
};

// ---------- Split day definitions ----------

type RoleRef = [Role, number];

interface DayDef {
  name: string;
  compounds: RoleRef[];
  accessories: RoleRef[];
  core?: RoleRef;
}

const FULL_BODY_A: DayDef = {
  name: 'Full Body A',
  compounds: [['squat', 0], ['hPush', 0], ['hPull', 0]],
  accessories: [['pushAcc', 0], ['pullAcc', 0]],
  core: ['core', 0],
};
const FULL_BODY_B: DayDef = {
  name: 'Full Body B',
  compounds: [['hinge', 0], ['vPush', 0], ['vPull', 0]],
  accessories: [['legAcc', 0], ['pullAcc', 1]],
  core: ['core', 1],
};
const FULL_BODY_C: DayDef = {
  name: 'Full Body C',
  compounds: [['squat', 1], ['hPush', 1], ['hPull', 1]],
  accessories: [['legAcc', 1], ['pushAcc', 1]],
  core: ['core', 2],
};
const UPPER_A: DayDef = {
  name: 'Upper A',
  compounds: [['hPush', 0], ['hPull', 0], ['vPush', 0]],
  accessories: [['pushAcc', 0], ['pullAcc', 0]],
};
const LOWER_A: DayDef = {
  name: 'Lower A',
  compounds: [['squat', 0], ['hinge', 0]],
  accessories: [['legAcc', 0], ['legAcc', 1]],
  core: ['core', 0],
};
const UPPER_B: DayDef = {
  name: 'Upper B',
  compounds: [['vPull', 0], ['hPush', 1], ['hPull', 1]],
  accessories: [['pushAcc', 1], ['pullAcc', 1]],
};
const LOWER_B: DayDef = {
  name: 'Lower B',
  compounds: [['hinge', 1], ['squat', 1]],
  accessories: [['legAcc', 2], ['legAcc', 3]],
  core: ['core', 1],
};
const PUSH_A: DayDef = {
  name: 'Push A',
  compounds: [['hPush', 0], ['vPush', 0], ['hPush', 1]],
  accessories: [['pushAcc', 0], ['pushAcc', 1]],
};
const PULL_A: DayDef = {
  name: 'Pull A',
  compounds: [['vPull', 0], ['hPull', 0], ['hPull', 1]],
  accessories: [['pullAcc', 0], ['pullAcc', 1]],
};
const LEGS_A: DayDef = {
  name: 'Legs A',
  compounds: [['squat', 0], ['hinge', 0]],
  accessories: [['legAcc', 0], ['legAcc', 1]],
  core: ['core', 0],
};
const PUSH_B: DayDef = {
  name: 'Push B',
  compounds: [['vPush', 1], ['hPush', 2]],
  accessories: [['pushAcc', 2], ['pushAcc', 3]],
};
const PULL_B: DayDef = {
  name: 'Pull B',
  compounds: [['vPull', 1], ['hPull', 1]],
  accessories: [['pullAcc', 2], ['pullAcc', 3]],
};
const LEGS_B: DayDef = {
  name: 'Legs B',
  compounds: [['squat', 1], ['hinge', 1]],
  accessories: [['legAcc', 2], ['legAcc', 3]],
  core: ['core', 1],
};
const DELOAD_DAY: DayDef = {
  name: 'Full Body',
  compounds: [['squat', 0], ['hPush', 0], ['hPull', 0]],
  accessories: [],
  core: ['core', 0],
};

function named(def: DayDef, name: string): DayDef {
  return { ...def, name };
}

/** Strength split for a given training frequency (7th day handled as conditioning). */
function splitDays(daysPerWeek: number): DayDef[] {
  if (daysPerWeek <= 2) return [FULL_BODY_A, FULL_BODY_B];
  if (daysPerWeek === 3) return [FULL_BODY_A, FULL_BODY_B, FULL_BODY_C];
  if (daysPerWeek === 4) return [UPPER_A, LOWER_A, UPPER_B, LOWER_B];
  if (daysPerWeek === 5) {
    return [
      named(UPPER_A, 'Upper'),
      named(LOWER_A, 'Lower'),
      named(PUSH_A, 'Push'),
      named(PULL_A, 'Pull'),
      named(LEGS_A, 'Legs'),
    ];
  }
  return [PUSH_A, PULL_A, LEGS_A, PUSH_B, PULL_B, LEGS_B];
}

// ---------- Template builders ----------

function buildSets(scheme: SetScheme): PlannedSet[] {
  return Array.from({ length: scheme.sets }, (): PlannedSet => ({
    id: crypto.randomUUID(),
    setType: 'working',
    targetReps: scheme.reps,
    targetRepsMax: scheme.repsMax,
    targetRPE: scheme.rpe,
  }));
}

function makeBlock(type: BlockType, exerciseIds: string[], scheme: SetScheme, restSeconds: number): ExerciseBlock {
  return {
    id: crypto.randomUUID(),
    type,
    exercises: exerciseIds.map((exerciseId) => ({
      id: crypto.randomUUID(),
      exerciseId,
      sets: buildSets(scheme),
      notes: '',
    })),
    restBetweenSetsSeconds: restSeconds,
    restAfterBlockSeconds: restSeconds,
    notes: '',
  };
}

function totalSetsOf(blocks: ExerciseBlock[]): number {
  return blocks.reduce(
    (acc, b) => acc + b.exercises.reduce((a, e) => a + e.sets.length, 0),
    0,
  );
}

function description(planName: string): string {
  return `Auto-generated from the "${planName}" annual plan. Edit freely in Workouts.`;
}

function buildStrengthTemplate(
  phaseType: PhaseType,
  day: DayDef,
  menu: Menu,
  planName: string,
  nameOverride?: string,
): WorkoutTemplate {
  const scheme = SCHEMES[schemeKeyFor(phaseType)];
  const seen = new Set<string>();
  const pick = (ref: RoleRef): string | null => {
    const options = menu[ref[0]];
    const id = options[ref[1] % options.length];
    if (seen.has(id)) return null;
    seen.add(id);
    return id;
  };

  const blocks: ExerciseBlock[] = [];
  // Compounds first, one straight block each.
  for (const ref of day.compounds) {
    const id = pick(ref);
    if (id) blocks.push(makeBlock('straight', [id], scheme.compound, scheme.restSeconds));
  }
  // Accessories paired into a superset where possible.
  const accessoryIds = day.accessories
    .map(pick)
    .filter((id): id is string => id !== null);
  if (accessoryIds.length >= 2) {
    blocks.push(makeBlock('superset', accessoryIds, scheme.accessory, scheme.restSeconds));
  } else if (accessoryIds.length === 1) {
    blocks.push(makeBlock('straight', accessoryIds, scheme.accessory, scheme.restSeconds));
  }
  // One core movement on full-body / lower days.
  if (day.core) {
    const id = pick(day.core);
    if (id) blocks.push(makeBlock('straight', [id], scheme.accessory, scheme.restSeconds));
  }

  return {
    id: crypto.randomUUID(),
    name: nameOverride ?? `${PHASE_LABELS[phaseType]} — ${day.name}`,
    description: description(planName),
    sessionType: 'strength',
    estimatedDurationMinutes: 10 + totalSetsOf(blocks) * 3,
    exerciseBlocks: blocks,
    tags: ['auto-generated', normalizedType(phaseType)],
    createdAt: new Date(),
    timesUsed: 0,
  };
}

function cardioBlock(
  exerciseIds: string[],
  setCount: number,
  durationSeconds: number,
  rpe: number,
  restSeconds: number,
  type: BlockType,
): ExerciseBlock {
  return {
    id: crypto.randomUUID(),
    type,
    exercises: exerciseIds.map((exerciseId) => ({
      id: crypto.randomUUID(),
      exerciseId,
      sets: Array.from({ length: setCount }, (): PlannedSet => ({
        id: crypto.randomUUID(),
        setType: 'working',
        targetDurationSeconds: durationSeconds,
        targetRPE: rpe,
      })),
      notes: '',
    })),
    restBetweenSetsSeconds: restSeconds,
    restAfterBlockSeconds: restSeconds,
    notes: '',
  };
}

type CardioSlot = 'intervals' | 'steady' | 'long';

function buildCardioTemplate(slot: CardioSlot, cardio: CardioMenu, planName: string): WorkoutTemplate {
  let name: string;
  let blocks: ExerciseBlock[];
  let estimated: number;
  if (slot === 'intervals') {
    name = 'Endurance — Intervals';
    blocks = [cardioBlock([cardio.intervals], 8, 60, 9, 90, 'straight')];
    estimated = 30;
  } else if (slot === 'steady') {
    name = 'Endurance — Steady State';
    blocks = [cardioBlock([cardio.steady], 1, 1800, 6, 60, 'straight')];
    estimated = 40;
  } else {
    name = 'Endurance — Long Session';
    blocks = [cardioBlock([cardio.long], 1, 3600, 5, 60, 'straight')];
    estimated = 70;
  }
  return {
    id: crypto.randomUUID(),
    name,
    description: description(planName),
    sessionType: 'cardio',
    estimatedDurationMinutes: estimated,
    exerciseBlocks: blocks,
    tags: ['auto-generated', 'cardio'],
    createdAt: new Date(),
    timesUsed: 0,
  };
}

function buildConditioningTemplate(cardio: CardioMenu, planName: string): WorkoutTemplate {
  const blocks = [cardioBlock(cardio.conditioning, 4, 60, 8, 60, 'circuit')];
  return {
    id: crypto.randomUUID(),
    name: 'Conditioning — Mixed',
    description: description(planName),
    sessionType: 'cardio',
    estimatedDurationMinutes: 30,
    exerciseBlocks: blocks,
    tags: ['auto-generated', 'cardio'],
    createdAt: new Date(),
    timesUsed: 0,
  };
}

// ---------- Endurance weekly slot layout ----------

type EnduranceSlot = CardioSlot | 'strength';

function enduranceSlots(daysPerWeek: number): EnduranceSlot[] {
  const n = Math.min(7, Math.max(2, daysPerWeek));
  if (n === 2) return ['strength', 'long'];
  const slots: EnduranceSlot[] = Array.from({ length: n }, () => 'steady');
  slots[0] = 'intervals';
  slots[n - 1] = 'long';
  slots[Math.floor(n / 2)] = 'strength';
  return slots;
}

// ---------- Main generator ----------

/**
 * Build workout templates for every (phase type × split day) in the plan and
 * return a deep-updated copy of the plan whose non-rest planned sessions point
 * at those templates. Pure: neither argument is mutated.
 */
export function generatePlanWorkouts(
  input: PlanWizardInput,
  plan: AnnualPlan,
): { templates: WorkoutTemplate[]; plan: AnnualPlan } {
  const menu = MENUS[input.equipment];
  const cardio = CARDIO_MENUS[input.equipment];
  const days = splitDays(input.daysPerWeek);
  const isEndurance = input.goal === 'endurance';
  const cardioSlots = enduranceSlots(input.daysPerWeek);

  const templates: WorkoutTemplate[] = [];
  const cache = new Map<string, WorkoutTemplate>();
  const getTemplate = (key: string, make: () => WorkoutTemplate): WorkoutTemplate => {
    let t = cache.get(key);
    if (!t) {
      t = make();
      cache.set(key, t);
      templates.push(t);
    }
    return t;
  };

  const updated: AnnualPlan = {
    ...plan,
    quarters: plan.quarters.map((q) => ({
      ...q,
      phases: q.phases.map((ph) => {
        const isDeloadPhase = ph.type === 'deload' || ph.type === 'active_recovery';
        return {
          ...ph,
          weeks: ph.weeks.map((w) => {
            const ordered = [...w.plannedSessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
            let trainIndex = 0;
            const sessions = ordered.map((s): PlannedSession => {
              if (s.sessionType === 'rest') return s;
              const i = trainIndex;
              trainIndex += 1;

              // Deload / recovery weeks all reuse one light full-body template.
              if (isDeloadPhase || w.isDeload) {
                const t = getTemplate('deload', () =>
                  buildStrengthTemplate('deload', DELOAD_DAY, menu, plan.name, 'Deload — Full Body'),
                );
                return { ...s, workoutTemplateId: t.id, label: t.name };
              }

              if (isEndurance) {
                const slot = cardioSlots[i % cardioSlots.length];
                if (slot === 'strength') {
                  const t = getTemplate('endurance-strength', () =>
                    buildStrengthTemplate('base', FULL_BODY_A, menu, plan.name, 'Strength Maintenance — Full Body'),
                  );
                  return { ...s, workoutTemplateId: t.id, label: t.name, sessionType: 'strength' };
                }
                const t = getTemplate(`cardio-${slot}`, () => buildCardioTemplate(slot, cardio, plan.name));
                return { ...s, workoutTemplateId: t.id, label: t.name };
              }

              // 7th training day of the week is conditioning.
              if (input.daysPerWeek >= 7 && i === 6) {
                const t = getTemplate('conditioning', () => buildConditioningTemplate(cardio, plan.name));
                return { ...s, workoutTemplateId: t.id, label: t.name, sessionType: 'cardio' };
              }

              const day = days[i % days.length];
              const key = `${normalizedType(ph.type)}|${day.name}`;
              const t = getTemplate(key, () => buildStrengthTemplate(ph.type, day, menu, plan.name));
              return { ...s, workoutTemplateId: t.id, label: t.name };
            });
            return { ...w, plannedSessions: sessions };
          }),
        };
      }),
    })),
  };

  return { templates, plan: updated };
}
