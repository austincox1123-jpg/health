// Macro target math + rule-based food suggestions.

const ACTIVITY = {
  light: { label: "Light (1-3 workouts/wk, desk job)", mult: 1.375 },
  moderate: { label: "Moderate (3-5 workouts/wk)", mult: 1.55 },
  high: { label: "High (6+ hard sessions/wk or active job)", mult: 1.725 },
};

const GOALS = {
  gain: { label: "Lean bulk (build muscle)", adj: 0.1 },
  recomp: { label: "Recomp / maintain", adj: 0 },
  cut: { label: "Cut (lose fat)", adj: -0.2 },
};

// Mifflin-St Jeor BMR. weight kg, height cm.
function bmr(sex, kg, cm, age) {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

// Returns daily calorie + macro targets.
// Protein ~1 g/lb bodyweight (2.2 g/kg) — at the top of the evidence-based
// range, which suits a recomp/lean-bulk lifter. Fat 25% of calories,
// carbs fill the remainder to fuel training + conditioning.
function macroTargets(profile) {
  const kg = profile.weightLb * 0.4536;
  const cm = profile.heightIn * 2.54;
  const tdee = bmr(profile.sex, kg, cm, profile.age) * ACTIVITY[profile.activity].mult;
  const cal = Math.round(tdee * (1 + GOALS[profile.goal].adj));
  const p = Math.round(profile.weightLb * 1.0);
  const f = Math.round((cal * 0.25) / 9);
  const c = Math.round((cal - p * 4 - f * 9) / 4);
  return { cal, p, c, f, tdee: Math.round(tdee) };
}

function dayTotals(entries) {
  return entries.reduce(
    (t, e) => ({
      cal: t.cal + e.cal * e.qty,
      p: t.p + e.p * e.qty,
      c: t.c + e.c * e.qty,
      f: t.f + e.f * e.qty,
    }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );
}

// Rule-based suggestions: score snackable foods by how well they fill what's
// left of today's macros. Protein gaps are weighted heaviest (it's the macro
// people under-eat); foods that would blow past remaining calories are cut.
function suggestFoods(remaining, allFoods, count) {
  if (remaining.cal < 60) return [];
  const proteinShare = remaining.cal > 0 ? (remaining.p * 4) / remaining.cal : 0;
  const scored = allFoods
    .filter((f) => f.snack || f.cat === "meal")
    .filter((f) => f.cal <= remaining.cal + 80)
    .map((f) => {
      let score = 0;
      // protein density matters more the bigger the protein gap
      if (remaining.p > 15) score += (f.p / Math.max(f.cal, 1)) * 400 * (1 + proteinShare);
      // prefer foods that use a meaningful chunk of remaining calories
      score += Math.min(f.cal / remaining.cal, 1) * 30;
      // penalize overshooting remaining carbs/fat badly
      if (f.c > remaining.c + 15) score -= 25;
      if (f.f > remaining.f + 10) score -= 25;
      return { food: f, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count || 5).map((s) => s.food);
}
