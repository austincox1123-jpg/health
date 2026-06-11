// Dependency-free SVG/HTML chart helpers + the stats they visualize.

// ---------- math helpers ----------

// Epley estimated 1RM from a working set.
function est1RM(weight, reps) {
  if (!weight || !reps) return 0;
  return weight * (1 + Math.min(reps, 15) / 30);
}

// Best per-session number for one exercise: {points: [{label, y}], unit}.
// Pure-bodyweight movements (never logged with added load) chart best-set
// reps; everything else charts estimated 1RM.
function exerciseTrend(workouts, exName) {
  const sessions = workouts
    .map((w) => ({ date: w.date, entry: w.entries.find((e) => e.name === exName) }))
    .filter((s) => s.entry);
  const repMode =
    typeof isBodyweight === "function" &&
    isBodyweight(exName) &&
    sessions.every((s) => s.entry.sets.every((x) => !x.weight));
  const points = [];
  for (const s of sessions) {
    const best = repMode
      ? Math.max(0, ...s.entry.sets.map((x) => x.reps || 0))
      : Math.max(0, ...s.entry.sets.map((x) => est1RM(x.weight, x.reps)));
    if (best > 0) points.push({ label: s.date.slice(5).replace("-", "/"), y: Math.round(best) });
  }
  return { points, unit: repMode ? "reps" : "lb" };
}

// Exercises with enough sessions to chart, most-logged first.
function chartableExercises(workouts, minSessions) {
  const counts = {};
  workouts.forEach((w) => w.entries.forEach((e) => { counts[e.name] = (counts[e.name] || 0) + 1; }));
  return Object.entries(counts)
    .filter(([, n]) => n >= (minSessions || 2))
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

// Total weight moved (lb) per week for the last n weeks: [{label, y}]
function weeklyTonnage(workouts, n) {
  const weeks = [];
  const cur = mondayOf(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(cur);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    let tons = 0;
    for (const w of workouts) {
      const d = new Date(w.date + "T12:00");
      if (d >= start && d < end) {
        w.entries.forEach((e) => e.sets.forEach((s) => { tons += (s.weight || 0) * (s.reps || 0); }));
      }
    }
    weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, y: Math.round(tons) });
  }
  return weeks;
}

// Sets per muscle group over the last `days` days. First match wins.
const MUSCLE_GROUPS = [
  { label: "Legs", re: /squat|leg press|leg curl|leg extension|lunge|calf|romanian|deadlift|good morning|hip thrust|glute|ham raise|back extension/i },
  { label: "Core", re: /plank|crunch|leg raise|ab wheel|russian|carry/i },
  { label: "Chest", re: /bench|fly|pec|chest|dip|push-up/i },
  { label: "Back", re: /row|pulldown|pull-up|chin-up|pullover|shrug|straight-arm/i },
  { label: "Shoulders", re: /shoulder press|overhead press|lateral|rear delt|arnold|upright|push press|face pull/i },
  { label: "Arms", re: /curl|triceps|skullcrusher|pushdown/i },
];

function muscleSplit(workouts, days) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const counts = MUSCLE_GROUPS.map((g) => ({ label: g.label, y: 0 }));
  for (const w of workouts) {
    if (new Date(w.date + "T12:00") < since) continue;
    for (const e of w.entries) {
      const g = MUSCLE_GROUPS.findIndex((m) => m.re.test(e.name));
      if (g >= 0) counts[g].y += e.sets.length;
    }
  }
  return counts;
}

// Consecutive weeks (ending now) with at least one workout. An empty
// current week doesn't break the streak — it just doesn't count yet.
function weekStreak(workouts) {
  const weeksWith = new Set(workouts.map((w) => mondayOf(new Date(w.date + "T12:00")).getTime()));
  let streak = 0;
  const cursor = mondayOf(new Date());
  if (weeksWith.has(cursor.getTime())) streak++;
  cursor.setDate(cursor.getDate() - 7);
  while (weeksWith.has(cursor.getTime())) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

// ---------- SVG charts ----------

function fmtK(n) {
  return n >= 10000 ? Math.round(n / 1000) + "k" : n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

// Activity-style progress ring.
function svgRing(value, target, label, color) {
  const pct = target > 0 ? value / target : 0;
  const over = pct > 1.05;
  const shown = Math.min(pct, 1);
  const r = 44, c = 2 * Math.PI * r;
  return `
  <div class="ring">
    <svg viewBox="0 0 110 110">
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="#e8edf5" stroke-width="10"/>
      <circle cx="55" cy="55" r="${r}" fill="none" stroke="${over ? "#e11d48" : color}" stroke-width="10"
        stroke-linecap="round" stroke-dasharray="${(shown * c).toFixed(1)} ${c.toFixed(1)}"
        transform="rotate(-90 55 55)"/>
      <text x="55" y="50" text-anchor="middle" class="ring-val">${Math.round(value)}</text>
      <text x="55" y="68" text-anchor="middle" class="ring-target">/ ${target}</text>
    </svg>
    <span class="ring-label">${label}</span>
  </div>`;
}

function fmtPace(decMin) {
  const m = Math.floor(decMin);
  const s = Math.round((decMin - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtDuration(decMin) {
  const m = Math.floor(decMin);
  const s = Math.round((decMin - m) * 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s).padStart(2, "0")}`;
}

// Total miles per week for the last n weeks: [{label, y}]
function weeklyMileage(runs, n) {
  const weeks = [];
  const cur = mondayOf(new Date());
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(cur);
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    let mi = 0;
    for (const r of runs) {
      const d = new Date(r.date + "T12:00");
      if (d >= start && d < end) mi += r.miles || 0;
    }
    weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, y: Math.round(mi * 10) / 10 });
  }
  return weeks;
}

// Pace per run (decimal min/mi), oldest first: [{label, y}]
function paceTrend(runs, n) {
  return runs
    .filter((r) => r.miles > 0 && r.minutes > 0)
    .slice(-n)
    .map((r) => ({ label: r.date.slice(5).replace("-", "/"), y: Math.round((r.minutes / r.miles) * 100) / 100 }));
}

// Line chart with area fill. opts: {fmtAxis, fmtVal} to format axis ticks
// and the last-point label (defaults suit pound loads).
function svgLine(points, color, opts) {
  opts = opts || {};
  const fmtAxis = opts.fmtAxis || ((v) => Math.round(v / 5) * 5);
  const fmtVal = opts.fmtVal || ((v) => v + " lb");
  if (points.length < 2) return `<p class="muted small">Log this at least twice to see a trend.</p>`;
  const w = 600, h = 190, padL = 44, padR = 14, padT = 16, padB = 26;
  const ys = points.map((p) => p.y);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  if (lo === hi) { lo -= 5; hi += 5; }
  const span = hi - lo;
  lo -= span * 0.1; hi += span * 0.1;
  const X = (i) => padL + (i * (w - padL - padR)) / (points.length - 1);
  const Y = (v) => padT + (h - padT - padB) * (1 - (v - lo) / (hi - lo));
  const pts = points.map((p, i) => `${X(i).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
  const grid = [0.25, 0.5, 0.75].map((f) => {
    const v = lo + (hi - lo) * f;
    return `<line x1="${padL}" y1="${Y(v)}" x2="${w - padR}" y2="${Y(v)}" class="gridline"/>
            <text x="${padL - 6}" y="${Y(v) + 4}" text-anchor="end" class="axis">${fmtAxis(v)}</text>`;
  }).join("");
  const dots = points.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3.5" fill="${color}"/>`).join("");
  const last = points[points.length - 1];
  return `
  <svg viewBox="0 0 ${w} ${h}" class="chart">
    ${grid}
    <polygon points="${X(0)},${h - padB} ${pts} ${X(points.length - 1)},${h - padB}" fill="${color}" opacity="0.08"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
    ${dots}
    <text x="${X(points.length - 1)}" y="${Y(last.y) - 10}" text-anchor="end" class="pt-label">${fmtVal(last.y)}</text>
    <text x="${padL}" y="${h - 8}" class="axis">${points[0].label}</text>
    <text x="${w - padR}" y="${h - 8}" text-anchor="end" class="axis">${last.label}</text>
  </svg>`;
}

// Bar chart — used for weekly tonnage.
function svgBars(items, color) {
  const w = 600, h = 190, padL = 44, padR = 10, padT = 16, padB = 26;
  const hi = Math.max(1, ...items.map((p) => p.y));
  const bw = (w - padL - padR) / items.length;
  const bars = items.map((p, i) => {
    const bh = ((h - padT - padB) * p.y) / hi;
    const x = padL + i * bw + bw * 0.15;
    return `<rect x="${x.toFixed(1)}" y="${(h - padB - bh).toFixed(1)}" width="${(bw * 0.7).toFixed(1)}" height="${Math.max(bh, p.y > 0 ? 2 : 0).toFixed(1)}" rx="4" fill="${color}" opacity="${p.y > 0 ? 0.9 : 0.15}"/>
            ${i % 2 === 0 ? `<text x="${(x + bw * 0.35).toFixed(1)}" y="${h - 8}" text-anchor="middle" class="axis">${p.label}</text>` : ""}`;
  }).join("");
  const grid = [0.5, 1].map((f) => {
    const v = hi * f;
    const y = padT + (h - padT - padB) * (1 - f);
    return `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" class="gridline"/>
            <text x="${padL - 6}" y="${y + 4}" text-anchor="end" class="axis">${fmtK(Math.round(v))}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="chart">${grid}${bars}</svg>`;
}

// Horizontal bars — used for muscle balance.
function hBars(items, color) {
  const hi = Math.max(1, ...items.map((p) => p.y));
  return items
    .map(
      (p) => `
    <div class="mg-row">
      <span class="mg-label">${p.label}</span>
      <div class="mg-track"><div class="mg-fill" style="width:${(p.y / hi) * 100}%;background:${color}"></div></div>
      <span class="mg-val">${p.y}</span>
    </div>`
    )
    .join("");
}

function isoDay(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// GitHub-style consistency heatmap: last `weeks` weeks, Monday-first rows.
function heatmapHTML(workouts, weeks) {
  const counts = {};
  workouts.forEach((w) => { counts[w.date] = (counts[w.date] || 0) + 1; });
  const start = mondayOf(new Date());
  start.setDate(start.getDate() - (weeks - 1) * 7);
  const today = new Date(); today.setHours(23, 59, 59, 0);
  let cells = "";
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(day.getDate() + w * 7 + d);
      if (day > today) { cells += `<span class="hm-cell future"></span>`; continue; }
      const iso = isoDay(day);
      const n = counts[iso] || 0;
      const lvl = n >= 2 ? 2 : n;
      cells += `<span class="hm-cell l${lvl}" title="${iso}${n ? " · " + n + " workout" + (n > 1 ? "s" : "") : ""}"></span>`;
    }
  }
  return `
  <div class="heatmap" style="grid-template-columns:repeat(${weeks},1fr)">${cells}</div>
  <div class="hm-legend muted small"><span>Less</span><span class="hm-cell l0"></span><span class="hm-cell l1"></span><span class="hm-cell l2"></span><span>More</span></div>`;
}

// Annual plan timeline: one strip, color-coded by block, marker at now.
const BLOCK_COLORS = {
  foundation: "#3b82f6",
  strength: "#8b5cf6",
  hypertrophy: "#10b981",
  peak: "#f59e0b",
  lean: "#06b6d4",
  engine: "#ef4444",
};

function yearTimeline(quarters, pos) {
  const segs = quarters
    .map((q, i) => `<div class="yt-seg" style="background:${BLOCK_COLORS[q.key] || "#94a3b8"}" title="Q${i + 1} · ${q.name}"><span>${q.name}</span></div>`)
    .join("");
  const left = ((pos.weekIdx + 0.5) / 48) * 100;
  return `
  <div class="year-track">
    <div class="yt-marker" style="left:${left}%"><div class="yt-pin"></div><span class="small">wk ${pos.weekIdx + 1}</span></div>
    <div class="year-bar">${segs}</div>
  </div>`;
}
