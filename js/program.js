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
// lean / engine flag blocks with special intent (cut pairing, conditioning push)
const BLOCK_TYPES = {
  foundation: {
    key: "foundation",
    name: "Foundation",
    focus: "Re-groove technique outside the WOD format: moderate loads, strict tempo, build baseline volume.",
    main: [6, 8],
    accShift: 2,
    setMult: 1,
  },
  strength: {
    key: "strength",
    name: "Strength",
    focus: "Heavy main lifts at low reps. Accessories get heavier and tighter; volume holds steady.",
    main: [3, 5],
    accShift: -2,
    setMult: 1,
  },
  hypertrophy: {
    key: "hypertrophy",
    name: "Hypertrophy",
    focus: "Volume push for muscle growth: higher reps, an extra accessory set, close to failure.",
    main: [6, 10],
    accShift: 3,
    setMult: 1.15,
  },
  peak: {
    key: "peak",
    name: "Peak & Test",
    focus: "Heavy doubles and triples, trimmed accessories. Test new rep maxes in the final build week.",
    main: [2, 4],
    accShift: 0,
    setMult: 0.85,
  },
  lean: {
    key: "lean",
    name: "Summer Lean",
    focus: "Diet down while holding strength: mains stay heavy, volume stays honest, conditioning climbs. Pair with the Cut goal in Profile.",
    main: [5, 8],
    accShift: 1,
    setMult: 1,
    lean: true,
  },
  engine: {
    key: "engine",
    name: "Engine",
    focus: "Conditioning push: lifting holds at maintenance volume, every session ends with a finisher — add 1-2 standalone cardio days.",
    main: [4, 6],
    accShift: 0,
    setMult: 0.8,
    engine: true,
  },
};

// Default year for anyone who hasn't run the in-app Plan Builder.
const QUARTERS = [BLOCK_TYPES.foundation, BLOCK_TYPES.strength, BLOCK_TYPES.hypertrophy, BLOCK_TYPES.peak];

// ---------- plan builder (in-app questionnaire -> tailored year) ----------

// Block sequence per #1 priority. Cyclic — rotation preserves adjacency.
const PRIORITY_SEQUENCES = {
  size: ["foundation", "hypertrophy", "strength", "hypertrophy"],
  strength: ["foundation", "hypertrophy", "strength", "peak"],
  athletic: ["foundation", "hypertrophy", "strength", "lean"],
  both: ["foundation", "hypertrophy", "strength", "peak"],
};

const WEAK_POINTS = {
  chestArms: { label: "Chest & arms", re: /bench|fly|pec|dip|chest|push-up|curl|triceps|skullcrusher|pushdown/i },
  back: { label: "Back & lats", re: /row|pulldown|pull-up|chin-up|pullover|shrug|straight-arm/i },
  shoulders: { label: "Shoulders", re: /lateral|shoulder press|face pull|rear delt|arnold|upright|push press/i },
  legs: { label: "Legs", re: /squat|leg press|leg curl|leg extension|lunge|calf|romanian|good morning|hip thrust|glute|ham raise|back extension/i },
};

function distToJuly1(date) {
  let best = Infinity;
  for (let y = date.getFullYear() - 1; y <= date.getFullYear() + 1; y++) {
    best = Math.min(best, Math.abs(date - new Date(y, 6, 1)));
  }
  return best;
}

// Turn Plan Builder answers into the year's four quarters.
// cfg: { peak: summer|strength|steady, priority: size|strength|athletic|both,
//        weakPoints: [keys], conditioning: maintain|seasonal|copriority|fade }
function generateQuarters(cfg, planStartISO) {
  let seq = [...(PRIORITY_SEQUENCES[cfg.priority] || PRIORITY_SEQUENCES.both)];

  // anchor block: what the year builds toward
  if (cfg.peak === "summer" && !seq.includes("lean")) seq[3] = "lean";
  if (cfg.peak === "strength" && !seq.includes("peak")) seq[3] = "peak";

  // rotate so the lean block ends nearest July 1 (leanest for summer)
  if (cfg.peak === "summer") {
    const li = seq.indexOf("lean");
    const start = mondayOf(new Date(planStartISO + "T12:00"));
    let best = 3, bestDist = Infinity;
    for (let p = 0; p < 4; p++) {
      const end = new Date(start);
      end.setDate(end.getDate() + 12 * 7 * (p + 1));
      const dist = distToJuly1(end);
      if (dist < bestDist) { bestDist = dist; best = p; }
    }
    seq = seq.map((_, i) => seq[(((i - best + li) % 4) + 4) % 4]);
  }

  // seasonal engine block: claim a slot away from the anchor block,
  // never overwriting strength/peak/lean
  if (cfg.conditioning === "seasonal" && !seq.includes("engine")) {
    const anchor = Math.max(seq.indexOf("lean"), seq.indexOf("peak"), 0);
    const replaceable = ["foundation", "hypertrophy"];
    for (const off of [2, 3, 1]) {
      const slot = (anchor + off) % 4;
      if (replaceable.includes(seq[slot])) { seq[slot] = "engine"; break; }
    }
  }

  return seq.map((key) => ({ ...BLOCK_TYPES[key] }));
}

// +1 set on accessories that hit the chosen weak points (max 2 per day,
// mains excluded) — applied on build weeks only.
function addEmphasis(blocks, weakPoints) {
  let added = 0;
  return blocks.map((b) => {
    if (added >= 2 || b.isMain) return b;
    const hit = weakPoints.some((k) => WEAK_POINTS[k] && WEAK_POINTS[k].re.test(b.name));
    if (!hit) return b;
    added++;
    return { ...b, sets: b.sets + 1, note: (b.note ? b.note + " · " : "") + "weak-point emphasis: +1 set" };
  });
}

const FINISHERS = [
  "Bike: 10 rounds of 30s hard / 60s easy",
  "Row: 5 x 500m, 90s rest between",
  "Incline treadmill walk: 20 min (zone 2)",
  "EMOM 10 min: 12 cal bike",
  "Jump rope: 8 x 1 min on / 30s off",
  "Sled or farmer carry: 6 x 40m, rest as needed",
  "Calisthenics circuit: 3 rounds — 15 push-ups, 10 pull-ups, 20 sit-ups",
  "Burpee EMOM 8 min: 8 burpees on the minute",
];

// ---------- calisthenics ----------

// Bodyweight movements log added load (vest/belt) in the weight field, and
// progress by reps first: top the rep range on every set, then add reps or
// strap on weight.
const BW_RE = /push-up|pull-up|chin-up|\bdip\b|dips\b|sit-up|pistol|handstand|inverted row|burpee|muscle-up|bodyweight|plank|leg raise|ab wheel|l-sit|nordic/i;

function isBodyweight(name) {
  return BW_RE.test(name);
}

// ---------- running (hybrid lift + run) ----------

// Structured run sessions, periodized like everything else: durations climb
// through build weeks, shrink on deloads, and the interval flavor follows
// the quarter's intent.
// Personal pace targets from a recent 5K (or best-effort) time, using
// simplified Daniels-style offsets from 5K race pace.
const MILES_5K = 3.107;

function minToPace(p) {
  const m = Math.floor(p);
  const s = Math.round((p - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function paceTargets(fiveKMin) {
  if (!(fiveKMin > 0)) return null;
  const p5 = fiveKMin / MILES_5K; // 5K race pace, min/mi
  return {
    easy: `${minToPace(p5 + 1.5)}–${minToPace(p5 + 2.2)}/mi`,
    tempo: `${minToPace(p5 + 0.42)}/mi`,
    rep800: minToPace(p5 * 0.497), // 800m at 5K pace
    rep400: minToPace((p5 - 0.33) * 0.2486), // 400m a touch faster
  };
}

// Riegel prediction: equivalent 5K time from any logged run.
function predict5K(miles, minutes) {
  if (!(miles >= 1) || !(minutes > 0)) return null;
  return minutes * Math.pow(MILES_5K / miles, 1.06);
}

const INTERVAL_BY_BLOCK = {
  foundation: "6 x 800m at 5K effort, 2 min jog rest",
  hypertrophy: "6 x 800m at 5K effort, 2 min jog rest",
  strength: "8 x 400m fast, 90s walk rest",
  peak: "5 x 400m fast, full recovery",
  lean: "30 min tempo — comfortably hard the whole way",
  engine: "3 x 1 mile at threshold, 3 min jog rest",
};

function runWeek(pos, runsPerWeek, quarters, fiveKMin) {
  if (!runsPerWeek) return [];
  const q = quarters[pos.quarter];
  const t = paceTargets(fiveKMin);
  const lineup = runsPerWeek >= 3 ? ["easy", "intervals", "long"] : runsPerWeek === 2 ? ["intervals", "long"] : ["long"];
  const mult = (pos.isDeload ? 0.6 : 1 + pos.weekInMeso * 0.1) * (q.engine ? 1.2 : q.key === "peak" ? 0.8 : 1);
  return lineup.map((k) => {
    if (k === "intervals") {
      if (pos.isDeload) {
        return { day: "Run · Intervals", run: true, desc: "20-25 min easy jog (deload — no hard running this week)" };
      }
      const body = INTERVAL_BY_BLOCK[q.key] || INTERVAL_BY_BLOCK.foundation;
      let target = "";
      if (t) {
        if (body.includes("800m")) target = ` · target ≈${t.rep800} per 800`;
        else if (body.includes("400m")) target = ` · target ≈${t.rep400} per 400`;
        else target = ` · target ${t.tempo}`;
      }
      return { day: "Run · Intervals", run: true, desc: `10 min warm-up · ${body}${target} · 10 min cool-down` };
    }
    const base = k === "long" ? 55 : 35;
    const min = Math.max(20, Math.round((base * mult) / 5) * 5);
    return {
      day: k === "long" ? "Run · Long Run" : "Run · Easy Run",
      run: true,
      desc: `${min} min at conversational pace (Zone 2)${t ? ` · target ${t.easy}` : ""}${k === "long" ? " — steady, finish feeling like you had more" : ""}`,
    };
  });
}

// Interleave runs into the lifting week. Each run gets an evenly-spaced
// target slot, then nearby slots are scored: never next to another run,
// hard runs (intervals) avoid following leg days, easy/long runs only
// mildly mind them. Lowest score wins.
function mergeWeek(lifts, runs) {
  if (!runs.length) return lifts;
  const isLeg = (d) => /lower|legs|full body/i.test(d.day);
  const sessions = [...lifts];
  const total = lifts.length + runs.length;
  runs.forEach((r, i) => {
    const target = Math.min(Math.round(((i + 1) * total) / (runs.length + 1)), sessions.length);
    const hard = /intervals/i.test(r.day);
    let best = target, bestScore = Infinity;
    for (const cand of [target, target + 1, target - 1, target + 2, target - 2, target + 3, target - 3]) {
      if (cand < 0 || cand > sessions.length) continue;
      const prev = sessions[cand - 1];
      const next = sessions[cand];
      let score = Math.abs(cand - target) * 0.15;
      if (prev && prev.run) score += 2;
      if (next && next.run) score += 2;
      if (prev && !prev.run && isLeg(prev)) score += hard ? 1 : 0.3;
      if (score < bestScore) { bestScore = score; best = cand; }
    }
    sessions.splice(best, 0, r);
  });
  return sessions;
}

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
  // calisthenics
  "Pull-up", "Chin-up", "Wide-grip Pull-up", "Dips", "Diamond Push-up",
  "Sit-up", "Decline Sit-up", "Pistol Squat", "Bodyweight Squat",
  "Handstand Push-up", "Inverted Row", "Burpee", "Muscle-up",
  "L-sit Hold", "Nordic Hamstring Curl",
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
  out.isMain = isMain;
  if (isDeload) {
    out.sets = Math.max(1, Math.ceil(out.sets * 0.5));
    out.note = (b.note ? b.note + " · " : "") + "deload: ~60% load, 4+ reps in reserve";
  }
  return out;
}

// Build the week's workouts from a base template + plan position.
// opts: { quarters, conditioning (bool), conditioningMode, weakPoints }
function weekProgram(template, pos, opts) {
  opts = opts || {};
  const quarters = opts.quarters || QUARTERS;
  const q = quarters[pos.quarter];
  // hybrid mode drops finishers — structured runs replace them
  const finishersOn =
    opts.conditioningMode === "fade" || opts.conditioningMode === "hybrid" ? false : opts.conditioning !== false;
  const finisherEveryDay = q.engine || opts.conditioningMode === "copriority";
  return template.map((d, di) => {
    let blocks = d.blocks.map((b) => applyPhase(b, q, pos.isDeload));
    if (!pos.isDeload && opts.weakPoints && opts.weakPoints.length) {
      blocks = addEmphasis(blocks, opts.weakPoints);
    }
    let finisher = d.finisher;
    if (finisherEveryDay && !finisher) finisher = FINISHERS[di % FINISHERS.length];
    return { day: d.day, finisher: finishersOn ? finisher : undefined, blocks };
  });
}

// ---------- 1RM percentage loading ----------

// Lifts the user can record a 1-rep max for in Profile.
const MAX_LIFTS = [
  "Back Squat",
  "Front Squat",
  "Bench Press",
  "Incline Bench Press",
  "Overhead Press",
  "Deadlift",
  "Barbell Row",
];

// Match a workout block to a recorded 1RM. Exact name only, except blocks
// that list alternatives ("Front Squat or Hack Squat" uses the Front Squat
// max) — deliberately strict so e.g. a flat-bench max never drives incline.
function maxFor(name, maxes) {
  if (!maxes) return null;
  if (maxes[name]) return maxes[name];
  const first = name.split(" or ")[0].trim();
  return maxes[first] || null;
}

// Working weight from %1RM via inverted Epley, targeting the top of the
// block's rep range with ~1 rep in reserve. 3-5 reps -> ~83%, 6-8 -> ~77%,
// 8-12 -> ~70%. Deload weeks drop to a flat 60%. Rounded to 5 lb.
function prescribedLoad(max, block, isDeload) {
  const pct = isDeload ? 0.6 : 1 / (1 + (block.hi + 1) / 30);
  return { weight: Math.max(5, Math.round((max * pct) / 5) * 5), pct: Math.round(pct * 100) };
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
  const bw = isBodyweight(block.name);
  if (allAtTop) {
    if (bw && topWeight === 0) {
      return {
        weight: 0,
        msg: `Hit ${block.hi}+ reps on all sets — add 1-2 reps per set, or add +${block.inc || 5} lb (vest/belt) and drop back to ${block.lo}`,
      };
    }
    if (block.inc > 0) {
      return {
        weight: topWeight + block.inc,
        msg: `Hit ${block.hi}+ reps on all sets last time — go up to ${topWeight + block.inc} lb${bw ? " added" : ""}`,
      };
    }
  }
  return {
    weight: topWeight,
    msg: `Last: ${sets.map((s) => `${bw && !s.weight ? "bw" : s.weight || 0}x${s.reps || 0}`).join(", ")} (${last.date}) — add reps before ${bw ? "load" : "weight"}`,
  };
}
