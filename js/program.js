// Periodized program engine: a 48-week annual plan (Mayhem-style breakouts)
// built from quarterly blocks -> monthly mesocycles -> weekly microcycles.
//
//   Year (48 wk) = 4 quarters x 12 wk
//   Quarter      = 3 mesocycles x 4 wk
//   Mesocycle    = 3 build weeks + 1 deload week
//
// Each quarter is a training block that re-shapes the same weekly split:
// rep ranges on main lifts and accessories shift with the block's focus.
// User customizations (js/app.js editor) modify the BASE template; block
// adjustments are applied on top, so edits survive across the whole year.
//
// inc = suggested weight increment (lb) once you hit the top of the rep
// range on every set (double progression).

function ex(name, sets, lo, hi, inc, note) {
  return { name, sets, lo, hi, inc, note: note || "" };
}

const WEEKS_PER_MESO = 4;
const MESOS_PER_QUARTER = 3;
const WEEKS_PER_QUARTER = WEEKS_PER_MESO * MESOS_PER_QUARTER; // 12
const WEEKS_PER_YEAR = WEEKS_PER_QUARTER * 4; // 48

// main: rep range applied to heavy compound lifts during the block
// accShift: added to accessory rep ranges
// setMult: scales set counts (volume emphasis up/down)
const QUARTERS = [
  {
    name: "Foundation",
    focus: "Re-groove technique outside the WOD format: moderate loads, strict tempo, build baseline volume.",
    main: [6, 8],
    accShift: 2,
    setMult: 1,
  },
  {
    name: "Strength",
    focus: "Heavy main lifts at low reps. Accessories get heavier and tighter; volume holds steady.",
    main: [3, 5],
    accShift: -2,
    setMult: 1,
  },
  {
    name: "Hypertrophy",
    focus: "Volume push for muscle growth: higher reps, an extra accessory set, close to failure.",
    main: [6, 10],
    accShift: 3,
    setMult: 1.15,
  },
  {
    name: "Peak & Test",
    focus: "Heavy doubles and triples, trimmed accessories. Test new rep maxes in the final build week.",
    main: [2, 4],
    accShift: 0,
    setMult: 0.85,
  },
];

const FINISHERS = [
  "Bike: 10 rounds of 30s hard / 60s easy",
  "Row: 5 x 500m, 90s rest between",
  "Incline treadmill walk: 20 min (zone 2)",
  "EMOM 10 min: 12 cal bike",
  "Jump rope: 8 x 1 min on / 30s off",
  "Sled or farmer carry: 6 x 40m, rest as needed",
];

const PROGRAMS = {
  3: [
    {
      day: "Full Body A",
      blocks: [
        ex("Back Squat", 4, 4, 6, 10),
        ex("Bench Press", 4, 4, 6, 5),
        ex("Barbell Row", 3, 6, 10, 5),
        ex("Romanian Deadlift", 3, 8, 10, 10),
        ex("Lateral Raise", 3, 12, 15, 5),
        ex("Plank", 3, 1, 1, 0, "30-60s holds"),
      ],
      finisher: FINISHERS[0],
    },
    {
      day: "Full Body B",
      blocks: [
        ex("Deadlift", 3, 3, 5, 10),
        ex("Overhead Press", 4, 4, 6, 5),
        ex("Lat Pulldown or Pull-up", 3, 8, 12, 5),
        ex("Leg Press", 3, 10, 12, 10),
        ex("Dumbbell Curl", 3, 10, 15, 5),
        ex("Cable Triceps Pushdown", 3, 10, 15, 5),
      ],
      finisher: FINISHERS[1],
    },
    {
      day: "Full Body C",
      blocks: [
        ex("Front Squat", 3, 6, 8, 5),
        ex("Incline Dumbbell Press", 3, 8, 12, 5),
        ex("Seated Cable Row", 3, 8, 12, 5),
        ex("Leg Curl", 3, 10, 15, 5),
        ex("Standing Calf Raise", 4, 10, 15, 10),
        ex("Hanging Leg Raise", 3, 10, 15, 0),
      ],
      finisher: FINISHERS[3],
    },
  ],

  4: [
    {
      day: "Upper A",
      blocks: [
        ex("Bench Press", 4, 4, 6, 5),
        ex("Barbell Row", 4, 6, 10, 5),
        ex("Seated Dumbbell Shoulder Press", 3, 8, 12, 5),
        ex("Lat Pulldown", 3, 10, 12, 5),
        ex("Incline Dumbbell Press", 3, 8, 12, 5),
        ex("Cable Triceps Pushdown", 3, 12, 15, 5),
        ex("Dumbbell Curl", 3, 12, 15, 5),
      ],
      finisher: FINISHERS[0],
    },
    {
      day: "Lower A",
      blocks: [
        ex("Back Squat", 4, 4, 6, 10),
        ex("Romanian Deadlift", 3, 8, 10, 10),
        ex("Leg Press", 3, 10, 12, 10),
        ex("Leg Curl", 3, 10, 15, 5),
        ex("Standing Calf Raise", 4, 10, 15, 10),
        ex("Hanging Leg Raise", 3, 10, 15, 0),
      ],
      finisher: FINISHERS[2],
    },
    {
      day: "Upper B",
      blocks: [
        ex("Overhead Press", 4, 4, 6, 5),
        ex("Weighted Pull-up or Chin-up", 4, 6, 10, 5),
        ex("Incline Bench Press", 3, 8, 12, 5),
        ex("One-arm Dumbbell Row", 3, 8, 12, 5),
        ex("Lateral Raise", 3, 12, 15, 5),
        ex("Face Pull", 3, 12, 15, 5),
        ex("EZ-bar Curl", 3, 10, 12, 5),
        ex("Skullcrusher", 3, 10, 12, 5),
      ],
      finisher: FINISHERS[1],
    },
    {
      day: "Lower B",
      blocks: [
        ex("Deadlift", 3, 3, 5, 10),
        ex("Front Squat or Hack Squat", 3, 6, 8, 10),
        ex("Bulgarian Split Squat", 3, 8, 12, 5),
        ex("Leg Extension", 3, 12, 15, 5),
        ex("Seated Calf Raise", 4, 12, 15, 10),
        ex("Ab Wheel or Cable Crunch", 3, 10, 15, 0),
      ],
      finisher: FINISHERS[5],
    },
  ],

  5: [
    {
      day: "Upper",
      blocks: [
        ex("Bench Press", 4, 4, 6, 5),
        ex("Barbell Row", 4, 6, 10, 5),
        ex("Overhead Press", 3, 6, 8, 5),
        ex("Lat Pulldown", 3, 10, 12, 5),
        ex("Cable Triceps Pushdown", 3, 12, 15, 5),
        ex("Dumbbell Curl", 3, 12, 15, 5),
      ],
      finisher: FINISHERS[0],
    },
    {
      day: "Lower",
      blocks: [
        ex("Back Squat", 4, 4, 6, 10),
        ex("Romanian Deadlift", 3, 8, 10, 10),
        ex("Leg Press", 3, 10, 12, 10),
        ex("Leg Curl", 3, 10, 15, 5),
        ex("Standing Calf Raise", 4, 10, 15, 10),
      ],
      finisher: FINISHERS[2],
    },
    {
      day: "Push",
      blocks: [
        ex("Incline Bench Press", 4, 6, 10, 5),
        ex("Seated Dumbbell Shoulder Press", 3, 8, 12, 5),
        ex("Dip or Machine Chest Press", 3, 8, 12, 5),
        ex("Lateral Raise", 4, 12, 15, 5),
        ex("Overhead Triceps Extension", 3, 10, 15, 5),
      ],
      finisher: FINISHERS[4],
    },
    {
      day: "Pull",
      blocks: [
        ex("Deadlift", 3, 3, 5, 10),
        ex("Weighted Pull-up or Chin-up", 4, 6, 10, 5),
        ex("Seated Cable Row", 3, 8, 12, 5),
        ex("Face Pull", 3, 12, 15, 5),
        ex("EZ-bar Curl", 3, 10, 12, 5),
        ex("Hammer Curl", 3, 10, 12, 5),
      ],
      finisher: FINISHERS[1],
    },
    {
      day: "Legs",
      blocks: [
        ex("Front Squat or Hack Squat", 4, 6, 8, 10),
        ex("Bulgarian Split Squat", 3, 8, 12, 5),
        ex("Leg Extension", 3, 12, 15, 5),
        ex("Leg Curl", 3, 10, 15, 5),
        ex("Seated Calf Raise", 4, 12, 15, 10),
        ex("Ab Wheel or Cable Crunch", 3, 10, 15, 0),
      ],
      finisher: FINISHERS[5],
    },
  ],

  6: [
    {
      day: "Push A (heavy)",
      blocks: [
        ex("Bench Press", 4, 4, 6, 5),
        ex("Overhead Press", 3, 6, 8, 5),
        ex("Incline Dumbbell Press", 3, 8, 12, 5),
        ex("Lateral Raise", 3, 12, 15, 5),
        ex("Cable Triceps Pushdown", 3, 12, 15, 5),
      ],
      finisher: FINISHERS[0],
    },
    {
      day: "Pull A (heavy)",
      blocks: [
        ex("Deadlift", 3, 3, 5, 10),
        ex("Weighted Pull-up or Chin-up", 4, 6, 10, 5),
        ex("Barbell Row", 3, 6, 10, 5),
        ex("Face Pull", 3, 12, 15, 5),
        ex("EZ-bar Curl", 3, 10, 12, 5),
      ],
    },
    {
      day: "Legs A (heavy)",
      blocks: [
        ex("Back Squat", 4, 4, 6, 10),
        ex("Romanian Deadlift", 3, 8, 10, 10),
        ex("Leg Press", 3, 10, 12, 10),
        ex("Standing Calf Raise", 4, 10, 15, 10),
        ex("Hanging Leg Raise", 3, 10, 15, 0),
      ],
      finisher: FINISHERS[2],
    },
    {
      day: "Push B (volume)",
      blocks: [
        ex("Incline Bench Press", 4, 8, 12, 5),
        ex("Seated Dumbbell Shoulder Press", 3, 8, 12, 5),
        ex("Cable Fly", 3, 12, 15, 5),
        ex("Lateral Raise", 4, 12, 20, 5),
        ex("Overhead Triceps Extension", 3, 10, 15, 5),
      ],
      finisher: FINISHERS[4],
    },
    {
      day: "Pull B (volume)",
      blocks: [
        ex("Lat Pulldown", 4, 10, 12, 5),
        ex("Seated Cable Row", 3, 10, 12, 5),
        ex("One-arm Dumbbell Row", 3, 8, 12, 5),
        ex("Rear Delt Fly", 3, 12, 15, 5),
        ex("Dumbbell Curl", 3, 12, 15, 5),
        ex("Hammer Curl", 3, 10, 12, 5),
      ],
      finisher: FINISHERS[1],
    },
    {
      day: "Legs B (volume)",
      blocks: [
        ex("Front Squat or Hack Squat", 3, 6, 8, 10),
        ex("Bulgarian Split Squat", 3, 8, 12, 5),
        ex("Leg Extension", 3, 12, 15, 5),
        ex("Leg Curl", 3, 10, 15, 5),
        ex("Seated Calf Raise", 4, 12, 15, 10),
        ex("Ab Wheel or Cable Crunch", 3, 10, 15, 0),
      ],
      finisher: FINISHERS[5],
    },
  ],
};

// Extra exercises offered in the customization editor, beyond what the
// built-in templates already use.
const EXTRA_EXERCISES = [
  "Dumbbell Bench Press", "Machine Chest Press", "Pec Deck", "Push-up",
  "Close-grip Bench Press", "Push Press", "Arnold Press", "Cable Lateral Raise",
  "T-bar Row", "Pendlay Row", "Chest-supported Row", "Straight-arm Pulldown",
  "Shrug", "Preacher Curl", "Cable Curl", "Reverse Curl", "Triceps Dip",
  "Goblet Squat", "Box Squat", "Pause Squat", "Sumo Deadlift", "Good Morning",
  "Hip Thrust", "Walking Lunge", "Back Extension", "Glute Ham Raise",
  "Cable Crunch", "Russian Twist", "Farmer Carry",
];

function exerciseLibrary() {
  const names = new Set(EXTRA_EXERCISES);
  Object.values(PROGRAMS).forEach((days) =>
    days.forEach((d) => d.blocks.forEach((b) => names.add(b.name)))
  );
  return [...names].sort();
}

// ---------- plan position ----------

function mondayOf(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

// Where in the 48-week macrocycle a given week sits.
// offsetWeeks shifts relative to the current week (for browsing the plan).
function planPositionAt(startISO, offsetWeeks) {
  const start = mondayOf(new Date(startISO + "T12:00"));
  const weekStart = mondayOf(new Date());
  weekStart.setDate(weekStart.getDate() + (offsetWeeks || 0) * 7);
  let weeks = Math.round((weekStart - start) / (7 * 864e5));
  if (weeks < 0) weeks = 0;
  const weekIdx = weeks % WEEKS_PER_YEAR;
  const weekInMeso = weekIdx % WEEKS_PER_MESO;
  return {
    weekStart,
    year: Math.floor(weeks / WEEKS_PER_YEAR),
    weekIdx, // 0-47 within the year
    quarter: Math.floor(weekIdx / WEEKS_PER_QUARTER), // 0-3
    meso: Math.floor((weekIdx % WEEKS_PER_QUARTER) / WEEKS_PER_MESO), // 0-2
    weekInMeso, // 0-3
    isDeload: weekInMeso === WEEKS_PER_MESO - 1,
  };
}

// Re-shape a base exercise block for the active quarter + deload status.
function applyPhase(b, q, isDeload) {
  const out = { ...b };
  const isStatic = b.lo === b.hi; // timed holds etc. — leave reps alone
  const isMain = b.lo <= 6 && b.inc >= 5; // heavy compounds
  if (!isStatic) {
    if (isMain) {
      out.lo = q.main[0];
      out.hi = q.main[1];
    } else {
      out.lo = Math.max(5, b.lo + q.accShift);
      out.hi = Math.max(8, b.hi + q.accShift);
    }
  }
  out.sets = Math.max(1, Math.round(b.sets * q.setMult));
  if (isDeload) {
    out.sets = Math.max(1, Math.ceil(out.sets * 0.5));
    out.note = (b.note ? b.note + " · " : "") + "deload: ~60% load, 4+ reps in reserve";
  }
  return out;
}

// Build the week's workouts from a base template + plan position.
function weekProgram(template, pos, includeConditioning) {
  const q = QUARTERS[pos.quarter];
  return template.map((d) => ({
    day: d.day,
    finisher: includeConditioning ? d.finisher : undefined,
    blocks: d.blocks.map((b) => applyPhase(b, q, pos.isDeload)),
  }));
}

// ---------- progression ----------

// Find the most recent logged performance of an exercise.
function lastPerformance(workouts, exName) {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const entry = workouts[i].entries.find((e) => e.name === exName);
    if (entry && entry.sets.some((s) => s.weight || s.reps)) {
      return { date: workouts[i].date, sets: entry.sets };
    }
  }
  return null;
}

// Double progression: repeat a weight until every set hits the top of the
// rep range, then add the increment.
function suggestNext(workouts, block) {
  const last = lastPerformance(workouts, block.name);
  if (!last) return null;
  const sets = last.sets.filter((s) => s.weight > 0 || s.reps > 0);
  if (!sets.length) return null;
  const topWeight = Math.max(...sets.map((s) => s.weight || 0));
  const allAtTop = sets.every((s) => (s.reps || 0) >= block.hi);
  if (block.inc > 0 && allAtTop) {
    return {
      weight: topWeight + block.inc,
      msg: `Hit ${block.hi}+ reps on all sets last time — go up to ${topWeight + block.inc} lb`,
    };
  }
  return {
    weight: topWeight,
    msg: `Last: ${sets.map((s) => `${s.weight || 0}x${s.reps || 0}`).join(", ")} (${last.date}) — add reps before weight`,
  };
}
