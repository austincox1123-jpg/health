// Workout program templates + generator + progression logic.
// Rep schemes blend strength (heavy main lifts, low reps) with hypertrophy
// (moderate-rep accessories), matching goals: build muscle + get stronger.
// inc = suggested weight increment (lb) once you hit the top of the rep range
// on every set. Lower-body/compound pulls progress faster than upper-body.

function ex(name, sets, lo, hi, inc, note) {
  return { name, sets, lo, hi, inc, note: note || "" };
}

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

function getProgram(daysPerWeek, includeConditioning) {
  const days = PROGRAMS[daysPerWeek] || PROGRAMS[4];
  if (includeConditioning) return days;
  return days.map((d) => ({ ...d, finisher: undefined }));
}

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
