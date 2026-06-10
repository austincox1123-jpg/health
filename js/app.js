// App shell: state, routing, and rendering. No build step, no dependencies.
// All data lives in localStorage under one key; Profile tab can export/import it.

const STORE_KEY = "health-app-v1";

let state = loadState();
let view = state.profile ? "today" : "profile";
let session = null; // in-progress workout, not persisted until finished
let eatSearch = "";
let trainWeekOffset = 0; // weeks relative to now in the Train dashboard
let editing = null; // { dayIndex, draft } while customizing a workout day

function loadState() {
  let s = { profile: null, workouts: [], food: {}, customFoods: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) s = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load saved data", e);
  }
  // backfill fields added after v1
  if (!s.customPrograms) s.customPrograms = {};
  if (!s.planStart) s.planStart = null;
  if (!s.maxes) s.maxes = {};
  return s;
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function allFoods() {
  return FOODS.concat(state.customFoods);
}

// The user's base weekly template: their customized version if one exists,
// otherwise the built-in split for their day count.
function baseTemplate() {
  const days = state.profile.daysPerWeek;
  return state.customPrograms[days] || PROGRAMS[days] || PROGRAMS[4];
}

function planPos(offset) {
  return planPositionAt(state.planStart, offset || 0);
}

// ---------- routing ----------

const TABS = [
  { id: "today", label: "Today" },
  { id: "train", label: "Train" },
  { id: "eat", label: "Eat" },
  { id: "learn", label: "Learn" },
  { id: "profile", label: "Profile" },
];

function go(v) {
  view = v;
  render();
  window.scrollTo(0, 0);
}

function render() {
  if (state.profile && !state.planStart) {
    // anchor the annual plan to the Monday of the first week of use
    state.planStart = isoOf(mondayOf(new Date()));
    saveState();
  }
  const trainViews = ["train", "log", "edit"];
  const nav = TABS.map(
    (t) => `<button class="tab ${view === t.id || (trainViews.includes(view) && t.id === "train") ? "active" : ""}" data-go="${t.id}">${t.label}</button>`
  ).join("");
  document.getElementById("nav").innerHTML = nav;

  const main = document.getElementById("main");
  if (!state.profile && view !== "profile") view = "profile";
  if (view === "today") main.innerHTML = renderToday();
  else if (view === "train") main.innerHTML = renderTrain();
  else if (view === "log") main.innerHTML = renderLog();
  else if (view === "edit") main.innerHTML = renderEditor();
  else if (view === "eat") main.innerHTML = renderEat();
  else if (view === "learn") main.innerHTML = renderLearn();
  else main.innerHTML = renderProfile();
}

// ---------- shared bits ----------

function macroBar(label, val, target, unit) {
  const pct = Math.min(100, target > 0 ? (val / target) * 100 : 0);
  const over = val > target * 1.05;
  return `
    <div class="macro-row">
      <div class="macro-label"><span>${label}</span><span>${Math.round(val)} / ${target} ${unit}</span></div>
      <div class="bar"><div class="bar-fill ${over ? "over" : ""}" style="width:${pct}%"></div></div>
    </div>`;
}

function weekWorkoutCount() {
  const monday = mondayOf(new Date());
  return state.workouts.filter((w) => new Date(w.date + "T12:00") >= monday).length;
}

function phaseBadge(pos) {
  return pos.isDeload
    ? `<span class="badge deload-badge">Deload week</span>`
    : `<span class="badge">Build week ${pos.weekInMeso + 1} of 3</span>`;
}

// ---------- Today ----------

function renderToday() {
  const p = state.profile;
  const targets = macroTargets(p);
  const totals = dayTotals(state.food[todayStr()] || []);
  const pos = planPos(0);
  const q = QUARTERS[pos.quarter];
  const program = weekProgram(baseTemplate(), pos, p.conditioning);
  const done = weekWorkoutCount();
  const nextIdx = Math.min(done, program.length - 1);
  const nextDay = program[nextIdx];
  const lastLog = state.workouts[state.workouts.length - 1];

  return `
    <h1>Today</h1>
    <div class="grid-2">
    <div class="card">
      <div class="row-between"><h2>Training</h2>${phaseBadge(pos)}</div>
      <p class="muted small">${q.name} block · Mesocycle ${pos.meso + 1} of 3 · ${done} of ${p.daysPerWeek} sessions this week</p>
      ${pos.isDeload ? `<p class="suggest">Deload week: cut loads to ~60%, stop far from failure, leave feeling fresh.</p>` : ""}
      <p>Up next: <strong>${nextDay.day}</strong> — ${nextDay.blocks.length} exercises${nextDay.finisher ? " + conditioning finisher" : ""}</p>
      <button class="btn primary" data-start="${nextIdx}">Start ${nextDay.day}</button>
      ${lastLog ? `<p class="muted small">Last session: ${lastLog.day} on ${lastLog.date}</p>` : ""}
    </div>
    <div class="card">
      <h2>Nutrition</h2>
      ${macroBar("Calories", totals.cal, targets.cal, "kcal")}
      ${macroBar("Protein", totals.p, targets.p, "g")}
      ${macroBar("Carbs", totals.c, targets.c, "g")}
      ${macroBar("Fat", totals.f, targets.f, "g")}
      <button class="btn" data-go="eat">Log food</button>
    </div>
    </div>`;
}

// ---------- Train dashboard ----------

function renderTrain() {
  const p = state.profile;
  const pos = planPos(trainWeekOffset);
  const q = QUARTERS[pos.quarter];
  const week = weekProgram(baseTemplate(), pos, p.conditioning);
  const isCurrentWeek = trainWeekOffset === 0;
  const customized = !!state.customPrograms[p.daysPerWeek];

  const quarterCards = QUARTERS.map((qq, i) => {
    const current = i === pos.quarter;
    return `
      <div class="q-card ${current ? "current" : ""}">
        <div class="row-between"><strong>Q${i + 1} · ${qq.name}</strong>${current ? `<span class="badge">now</span>` : ""}</div>
        <p class="small muted">${qq.focus}</p>
        <p class="small">Weeks ${i * 12 + 1}–${i * 12 + 12} · 3 mesocycles (3 build + 1 deload each)</p>
        ${current ? `<div class="meso-dots">${[0, 1, 2].map((m) => `<span class="dot ${m < pos.meso ? "done" : m === pos.meso ? "active" : ""}">M${m + 1}</span>`).join("")}</div>` : ""}
      </div>`;
  }).join("");

  const dayCards = week
    .map(
      (d, i) => `
      <div class="card day-card">
        <div class="row-between">
          <h3>${esc(d.day)}</h3>
          <div class="actions tight">
            <button class="btn small-btn" data-edit-day="${i}">Edit</button>
            ${isCurrentWeek ? `<button class="btn primary small-btn" data-start="${i}">Start</button>` : ""}
          </div>
        </div>
        <ul class="plain">
          ${d.blocks
            .map((b) => {
              const mx = maxFor(b.name, state.maxes);
              const load = mx ? prescribedLoad(mx, b, pos.isDeload) : null;
              return `<li>${esc(b.name)} — <strong>${b.sets} x ${b.lo === b.hi ? b.lo : b.lo + "-" + b.hi}</strong>${load ? ` <span class="load">@ ${load.weight} lb · ${load.pct}%</span>` : ""}${b.note ? ` <span class="muted small">(${esc(b.note)})</span>` : ""}</li>`;
            })
            .join("")}
        </ul>
        ${d.finisher ? `<p class="finisher">Finisher: ${esc(d.finisher)}</p>` : ""}
      </div>`
    )
    .join("");

  const history = state.workouts
    .slice(-10)
    .reverse()
    .map((w) => {
      const best = w.entries
        .filter((e) => e.sets.some((s) => s.weight > 0))
        .slice(0, 3)
        .map((e) => {
          const top = e.sets.reduce((a, s) => ((s.weight || 0) > (a.weight || 0) ? s : a), {});
          return `${esc(e.name)} ${top.weight || 0}x${top.reps || 0}`;
        })
        .join(" · ");
      return `<li><strong>${w.date}</strong> — ${esc(w.day)}${best ? `<br><span class="muted small">${best}</span>` : ""}</li>`;
    })
    .join("");

  return `
    <h1>Train</h1>

    <div class="card phase-banner">
      <div class="row-between"><h2>Q${pos.quarter + 1} · ${q.name} block</h2>${phaseBadge(pos)}</div>
      <p class="muted">${q.focus}</p>
      <p class="muted small">Year ${pos.year + 1} · Mesocycle ${pos.meso + 1} of 3 · Week ${pos.weekInMeso + 1} of 4 · Plan week ${pos.weekIdx + 1} of 48</p>
      <div class="bar"><div class="bar-fill" style="width:${((pos.weekIdx + 1) / 48) * 100}%"></div></div>
    </div>

    <h2 class="cat-head">Annual plan</h2>
    <div class="quarters">${quarterCards}</div>

    <h2 class="cat-head">Workouts</h2>
    <div class="week-nav">
      <button class="btn small-btn" data-week="-1">‹ Prev</button>
      <div class="week-label">
        <strong>Week of ${fmtDate(pos.weekStart)}</strong>${isCurrentWeek ? " (this week)" : ""}<br>
        <span class="muted small">${q.name} · ${pos.isDeload ? "Deload" : `Build ${pos.weekInMeso + 1}/3`} · rep ranges adjust per block</span>
      </div>
      ${isCurrentWeek ? "" : `<button class="btn small-btn" data-week="reset">Today</button>`}
      <button class="btn small-btn" data-week="1">Next ›</button>
    </div>
    <div class="grid-2">${dayCards}</div>
    <p class="muted small">${customized ? `Using your customized ${p.daysPerWeek}-day program. <button class="link-btn" data-action="reset-program">Reset all days to default</button>` : `Tap Edit on any day to customize its exercises — edits carry through every block of the year.`}</p>

    <h2 class="cat-head">History</h2>
    <div class="card">
      ${history ? `<ul class="plain history">${history}</ul>` : `<p class="muted">No workouts logged yet.</p>`}
    </div>`;
}

// ---------- workout editor ----------

function startEdit(dayIndex) {
  const tmpl = baseTemplate();
  const d = tmpl[dayIndex];
  editing = {
    dayIndex,
    draft: {
      day: d.day,
      finisher: d.finisher || "",
      blocks: d.blocks.map((b) => ({ ...b })),
    },
  };
  go("edit");
}

function renderEditor() {
  if (!editing) return renderTrain();
  const d = editing.draft;
  const rows = d.blocks
    .map(
      (b, i) => `
      <div class="edit-row">
        <input class="ex-name" value="${esc(b.name)}" data-edit="${i}:name" placeholder="Exercise">
        <div class="edit-nums">
          <label>Sets <input type="number" inputmode="numeric" value="${b.sets}" data-edit="${i}:sets"></label>
          <label>Reps <input type="number" inputmode="numeric" value="${b.lo}" data-edit="${i}:lo"></label>
          <label>to <input type="number" inputmode="numeric" value="${b.hi}" data-edit="${i}:hi"></label>
          <label>+lb <input type="number" inputmode="decimal" value="${b.inc}" data-edit="${i}:inc"></label>
        </div>
        <div class="edit-btns">
          <button class="btn small-btn" data-move="${i}:-1" ${i === 0 ? "disabled" : ""}>↑</button>
          <button class="btn small-btn" data-move="${i}:1" ${i === d.blocks.length - 1 ? "disabled" : ""}>↓</button>
          <button class="btn danger small-btn" data-rm-ex="${i}">✕</button>
        </div>
      </div>`
    )
    .join("");

  return `
    <h1>Edit workout</h1>
    <div class="card">
      <label class="field-label">Day name <input id="ed-day" value="${esc(d.day)}"></label>
      <p class="muted small">Set the base rep ranges here — each quarterly block (Foundation, Strength, Hypertrophy, Peak) adjusts them automatically, and deload weeks halve the sets. "+lb" is the jump when you top the rep range on all sets.</p>
      ${rows}
      <div class="edit-add">
        <input id="add-ex-name" list="exlib" placeholder="Add exercise (pick or type your own)">
        <datalist id="exlib">${exerciseLibrary().map((n) => `<option value="${esc(n)}">`).join("")}</datalist>
        <button class="btn" data-action="add-exercise">Add</button>
      </div>
      <label class="field-label">Conditioning finisher (blank for none)
        <input id="ed-finisher" value="${esc(d.finisher)}" placeholder="e.g. Row: 5 x 500m, 90s rest">
      </label>
    </div>
    <div class="actions">
      <button class="btn primary" data-action="save-edit">Save day</button>
      <button class="btn" data-action="cancel-edit">Cancel</button>
      <button class="btn danger" data-action="reset-day">Reset this day to default</button>
    </div>`;
}

function saveEdit() {
  const d = editing.draft;
  d.day = document.getElementById("ed-day").value.trim() || d.day;
  d.finisher = document.getElementById("ed-finisher").value.trim();
  const blocks = d.blocks
    .map((b) => ({
      name: String(b.name).trim(),
      sets: Math.max(1, parseInt(b.sets, 10) || 3),
      lo: Math.max(1, parseInt(b.lo, 10) || 8),
      hi: Math.max(1, parseInt(b.hi, 10) || 12),
      inc: parseFloat(b.inc) || 0,
      note: b.note || "",
    }))
    .filter((b) => b.name);
  if (!blocks.length) {
    alert("A workout needs at least one exercise.");
    return;
  }
  blocks.forEach((b) => {
    if (b.hi < b.lo) b.hi = b.lo;
  });
  const days = state.profile.daysPerWeek;
  const tmpl = (state.customPrograms[days] || PROGRAMS[days]).map((day) => ({
    day: day.day,
    finisher: day.finisher,
    blocks: day.blocks.map((b) => ({ ...b })),
  }));
  tmpl[editing.dayIndex] = { day: d.day, finisher: d.finisher || undefined, blocks };
  state.customPrograms[days] = tmpl;
  saveState();
  editing = null;
  go("train");
}

function resetEditDay() {
  const days = state.profile.daysPerWeek;
  const def = PROGRAMS[days][editing.dayIndex];
  editing.draft = {
    day: def.day,
    finisher: def.finisher || "",
    blocks: def.blocks.map((b) => ({ ...b })),
  };
  render();
}

// ---------- workout logging ----------

function startWorkout(dayIndex) {
  const p = state.profile;
  const pos = planPos(0);
  const program = weekProgram(baseTemplate(), pos, p.conditioning);
  const day = program[dayIndex];
  session = {
    day: day.day,
    finisher: day.finisher,
    blocks: day.blocks.map((b) => {
      const sug = suggestNext(state.workouts, b);
      const mx = maxFor(b.name, state.maxes);
      const pres = mx ? prescribedLoad(mx, b, pos.isDeload) : null;
      const prefill = sug ? sug.weight : pres ? pres.weight : "";
      return {
        ...b,
        suggestion: sug,
        prescribed: pres,
        max: mx,
        setLogs: Array.from({ length: b.sets }, () => ({ weight: prefill, reps: "" })),
      };
    }),
  };
  go("log");
}

function renderLog() {
  if (!session) return renderTrain();
  const blocks = session.blocks
    .map(
      (b, bi) => `
      <div class="card">
        <h3>${esc(b.name)}</h3>
        <p class="muted small">${b.sets} sets x ${b.lo === b.hi ? b.lo : b.lo + "-" + b.hi} reps${b.note ? ` — ${esc(b.note)}` : ""}</p>
        ${b.prescribed ? `<p class="suggest">Target: ${b.prescribed.weight} lb — ${b.prescribed.pct}% of your ${b.max} lb max</p>` : ""}
        ${b.suggestion ? `<p class="suggest">${b.suggestion.msg}</p>` : b.prescribed ? "" : `<p class="muted small">First time logging this — pick a weight you can control for ${b.hi} reps.</p>`}
        <div class="sets">
          ${b.setLogs
            .map(
              (s, si) => `
            <div class="set-row">
              <span class="set-num">${si + 1}</span>
              <input type="number" inputmode="decimal" placeholder="lb" value="${s.weight}" data-set="${bi}:${si}:weight">
              <span class="x">x</span>
              <input type="number" inputmode="numeric" placeholder="reps" value="${s.reps}" data-set="${bi}:${si}:reps">
            </div>`
            )
            .join("")}
        </div>
      </div>`
    )
    .join("");

  return `
    <h1>${esc(session.day)}</h1>
    ${blocks}
    ${session.finisher ? `<div class="card"><h3>Finisher</h3><p>${esc(session.finisher)}</p></div>` : ""}
    <div class="actions">
      <button class="btn primary" data-action="finish-workout">Finish & save</button>
      <button class="btn" data-action="cancel-workout">Discard</button>
    </div>`;
}

function finishWorkout() {
  const entries = session.blocks
    .map((b) => ({
      name: b.name,
      sets: b.setLogs
        .map((s) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps, 10) || 0 }))
        .filter((s) => s.weight > 0 || s.reps > 0),
    }))
    .filter((e) => e.sets.length > 0);
  if (!entries.length) {
    alert("Nothing logged yet — enter at least one set, or hit Discard.");
    return;
  }
  state.workouts.push({ date: todayStr(), day: session.day, entries });
  saveState();
  session = null;
  go("train");
}

// ---------- Eat ----------

function renderEat() {
  const targets = macroTargets(state.profile);
  const entries = state.food[todayStr()] || [];
  const totals = dayTotals(entries);
  const remaining = {
    cal: targets.cal - totals.cal,
    p: targets.p - totals.p,
    c: targets.c - totals.c,
    f: targets.f - totals.f,
  };

  const q = eatSearch.trim().toLowerCase();
  const results = q
    ? allFoods().filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8)
    : [];

  const suggestions = suggestFoods(remaining, allFoods(), 5);

  return `
    <h1>Eat</h1>
    <div class="grid-2">
    <div class="card">
      <h2>Today vs targets</h2>
      ${macroBar("Calories", totals.cal, targets.cal, "kcal")}
      ${macroBar("Protein", totals.p, targets.p, "g")}
      ${macroBar("Carbs", totals.c, targets.c, "g")}
      ${macroBar("Fat", totals.f, targets.f, "g")}
      <p class="muted small">Targets: ${targets.cal} kcal (${GOALS[state.profile.goal].label}, maintenance ≈ ${targets.tdee} kcal)</p>
    </div>

    <div class="card">
      <h2>Add food</h2>
      <input type="search" id="food-search" placeholder="Search ${allFoods().length} foods…" value="${esc(eatSearch)}">
      ${results
        .map(
          (f) => `
        <div class="food-row">
          <div><strong>${esc(f.name)}</strong><br><span class="muted small">${f.cal} kcal · ${f.p}p / ${f.c}c / ${f.f}f</span></div>
          <button class="btn small-btn" data-add-food="${esc(f.name)}">Add</button>
        </div>`
        )
        .join("")}
      ${q && !results.length ? `<p class="muted">No match — add it as a custom food below.</p>` : ""}
      <details>
        <summary>Add a custom food</summary>
        <div class="form-grid">
          <input id="cf-name" placeholder="Name (e.g. Mom's chili, 1 bowl)">
          <input id="cf-cal" type="number" placeholder="kcal">
          <input id="cf-p" type="number" placeholder="protein g">
          <input id="cf-c" type="number" placeholder="carbs g">
          <input id="cf-f" type="number" placeholder="fat g">
          <button class="btn" data-action="save-custom-food">Save food</button>
        </div>
      </details>
    </div>

    <div class="card">
      <h2>Logged today</h2>
      ${
        entries.length
          ? entries
              .map(
                (e, i) => `
        <div class="food-row">
          <div><strong>${esc(e.name)}</strong>${e.qty !== 1 ? ` x${e.qty}` : ""}<br>
          <span class="muted small">${Math.round(e.cal * e.qty)} kcal · ${Math.round(e.p * e.qty)}p / ${Math.round(e.c * e.qty)}c / ${Math.round(e.f * e.qty)}f</span></div>
          <button class="btn small-btn" data-del-food="${i}">x</button>
        </div>`
              )
              .join("")
          : `<p class="muted">Nothing logged yet today.</p>`
      }
    </div>

    <div class="card">
      <h2>Suggestions for your remaining macros</h2>
      <p class="muted small">Left today: ${Math.max(0, Math.round(remaining.cal))} kcal · ${Math.max(0, Math.round(remaining.p))}g protein · ${Math.max(0, Math.round(remaining.c))}g carbs · ${Math.max(0, Math.round(remaining.f))}g fat</p>
      ${
        suggestions.length
          ? suggestions
              .map(
                (f) => `
        <div class="food-row">
          <div><strong>${esc(f.name)}</strong><br><span class="muted small">${f.cal} kcal · ${f.p}p / ${f.c}c / ${f.f}f</span></div>
          <button class="btn small-btn" data-add-food="${esc(f.name)}">Add</button>
        </div>`
              )
              .join("")
          : `<p class="muted">You're at your targets — nice work.</p>`
      }
    </div>
    </div>`;
}

function addFood(name) {
  const f = allFoods().find((x) => x.name === name);
  if (!f) return;
  const day = todayStr();
  if (!state.food[day]) state.food[day] = [];
  const existing = state.food[day].find((e) => e.name === f.name);
  if (existing) existing.qty += 1;
  else state.food[day].push({ name: f.name, cal: f.cal, p: f.p, c: f.c, f: f.f, qty: 1 });
  saveState();
  render();
}

function saveCustomFood() {
  const name = document.getElementById("cf-name").value.trim();
  const cal = parseFloat(document.getElementById("cf-cal").value);
  if (!name || isNaN(cal)) {
    alert("Custom food needs at least a name and calories.");
    return;
  }
  state.customFoods.push({
    name,
    cat: "snack",
    snack: true,
    cal,
    p: parseFloat(document.getElementById("cf-p").value) || 0,
    c: parseFloat(document.getElementById("cf-c").value) || 0,
    f: parseFloat(document.getElementById("cf-f").value) || 0,
  });
  saveState();
  eatSearch = name;
  render();
}

// ---------- Learn ----------

function renderLearn() {
  const cats = [...new Set(KNOWLEDGE.map((k) => k.cat))];
  const sections = cats
    .map(
      (cat) => `
      <h2 class="cat-head">${cat}</h2>
      <div class="grid-learn">
      ${KNOWLEDGE.filter((k) => k.cat === cat)
        .map(
          (k) => `
        <details class="card">
          <summary><strong>${k.title}</strong></summary>
          <p>${k.summary}</p>
          <ul>${k.takeaways.map((t) => `<li>${t}</li>`).join("")}</ul>
          <p class="links">${k.links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("<br>")}</p>
        </details>`
        )
        .join("")}
      </div>`
    )
    .join("");

  return `
    <h1>Learn</h1>
    <p class="muted">Evidence-based foundations for your goals. Tap a topic to expand.</p>
    ${sections}
    <h2 class="cat-head">Stay current with new research</h2>
    <div class="card">
      <p class="muted small">These PubMed links are saved searches sorted by date — open them any time to see the newest studies on your goals. Set a Google Scholar alert to get new papers by email.</p>
      <p class="links">${STAY_CURRENT.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("<br>")}</p>
    </div>`;
}

// ---------- Profile ----------

function renderProfile() {
  const p = state.profile || { sex: "male", age: 30, weightLb: 180, heightIn: 70, activity: "moderate", goal: "gain", daysPerWeek: 4, conditioning: true };
  const firstTime = !state.profile;
  return `
    <h1>${firstTime ? "Welcome — set up your profile" : "Profile"}</h1>
    ${firstTime ? `<p class="muted">Everything is computed from this: your training plan, calories, and macros. Data stays in this browser.</p>` : ""}
    <div class="card">
      <div class="form-grid">
        <label>Sex
          <select id="p-sex">
            <option value="male" ${p.sex === "male" ? "selected" : ""}>Male</option>
            <option value="female" ${p.sex === "female" ? "selected" : ""}>Female</option>
          </select>
        </label>
        <label>Age <input id="p-age" type="number" value="${p.age}"></label>
        <label>Weight (lb) <input id="p-weight" type="number" value="${p.weightLb}"></label>
        <label>Height (inches) <input id="p-height" type="number" value="${p.heightIn}" placeholder="e.g. 70 = 5'10&quot;"></label>
        <label>Activity level
          <select id="p-activity">
            ${Object.entries(ACTIVITY).map(([k, v]) => `<option value="${k}" ${p.activity === k ? "selected" : ""}>${v.label}</option>`).join("")}
          </select>
        </label>
        <label>Nutrition goal
          <select id="p-goal">
            ${Object.entries(GOALS).map(([k, v]) => `<option value="${k}" ${p.goal === k ? "selected" : ""}>${v.label}</option>`).join("")}
          </select>
        </label>
        <label>Lifting days per week
          <select id="p-days">
            ${[3, 4, 5, 6].map((d) => `<option value="${d}" ${p.daysPerWeek === d ? "selected" : ""}>${d}</option>`).join("")}
          </select>
        </label>
        <label class="check"><input id="p-conditioning" type="checkbox" ${p.conditioning ? "checked" : ""}> Include conditioning finishers</label>
      </div>
    </div>
    <div class="card">
      <h2>1-rep maxes (lb)</h2>
      <p class="muted small">Optional but recommended — with these filled in, every main lift shows a percentage-based working weight that adjusts to each training block (and drops to 60% on deload weeks). No true 1RM? Estimate from a recent hard set: weight × (1 + reps ÷ 30).</p>
      <div class="form-grid maxes">
        ${MAX_LIFTS.map((l) => `<label>${l} <input id="max-${l.replace(/[^a-z]/gi, "-")}" type="number" inputmode="decimal" placeholder="—" value="${state.maxes[l] || ""}"></label>`).join("")}
      </div>
    </div>
    <button class="btn primary big" data-action="save-profile">${firstTime ? "Create my plan" : "Save changes"}</button>
    ${
      firstTime
        ? ""
        : `
    <div class="card">
      <h2>Annual plan</h2>
      <p class="muted small">Plan started the week of ${state.planStart}. Restarting begins Year 1, Quarter 1 (Foundation) from this week.</p>
      <button class="btn" data-action="restart-plan">Restart plan from this week</button>
    </div>
    <div class="card">
      <h2>Your data</h2>
      <p class="muted small">${state.workouts.length} workouts and ${Object.keys(state.food).length} days of food logged. Data lives only in this browser — export a backup occasionally.</p>
      <div class="actions">
        <button class="btn" data-action="export">Export backup</button>
        <button class="btn" data-action="import">Import backup</button>
        <button class="btn danger" data-action="reset">Erase everything</button>
      </div>
      <input type="file" id="import-file" accept=".json" hidden>
    </div>`
    }`;
}

function saveProfile() {
  const profile = {
    sex: document.getElementById("p-sex").value,
    age: parseInt(document.getElementById("p-age").value, 10) || 30,
    weightLb: parseFloat(document.getElementById("p-weight").value) || 180,
    heightIn: parseFloat(document.getElementById("p-height").value) || 70,
    activity: document.getElementById("p-activity").value,
    goal: document.getElementById("p-goal").value,
    daysPerWeek: parseInt(document.getElementById("p-days").value, 10),
    conditioning: document.getElementById("p-conditioning").checked,
  };
  const maxes = {};
  MAX_LIFTS.forEach((l) => {
    const v = parseFloat(document.getElementById("max-" + l.replace(/[^a-z]/gi, "-")).value);
    if (v > 0) maxes[l] = v;
  });
  state.profile = profile;
  state.maxes = maxes;
  saveState();
  go("today");
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `health-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importBackup() {
  const input = document.getElementById("import-file");
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== "object" || !("workouts" in data)) throw new Error("bad format");
        state = data;
        if (!state.customPrograms) state.customPrograms = {};
        saveState();
        go("today");
      } catch (e) {
        alert("That file doesn't look like a backup from this app.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// ---------- events ----------

document.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-go],[data-start],[data-action],[data-add-food],[data-del-food],[data-week],[data-edit-day],[data-move],[data-rm-ex]"
  );
  if (!t) return;
  if (t.dataset.go) {
    if (t.dataset.go === "train") trainWeekOffset = 0;
    go(t.dataset.go);
  } else if (t.dataset.start !== undefined) startWorkout(parseInt(t.dataset.start, 10));
  else if (t.dataset.week !== undefined) {
    if (t.dataset.week === "reset") trainWeekOffset = 0;
    else trainWeekOffset += parseInt(t.dataset.week, 10);
    render();
  } else if (t.dataset.editDay !== undefined) startEdit(parseInt(t.dataset.editDay, 10));
  else if (t.dataset.move !== undefined) {
    const [i, dir] = t.dataset.move.split(":").map(Number);
    const b = editing.draft.blocks;
    const j = i + dir;
    if (j >= 0 && j < b.length) [b[i], b[j]] = [b[j], b[i]];
    render();
  } else if (t.dataset.rmEx !== undefined) {
    editing.draft.blocks.splice(parseInt(t.dataset.rmEx, 10), 1);
    render();
  } else if (t.dataset.addFood) addFood(t.dataset.addFood);
  else if (t.dataset.delFood !== undefined) {
    state.food[todayStr()].splice(parseInt(t.dataset.delFood, 10), 1);
    saveState();
    render();
  } else if (t.dataset.action === "finish-workout") finishWorkout();
  else if (t.dataset.action === "cancel-workout") {
    if (confirm("Discard this workout?")) {
      session = null;
      go("train");
    }
  } else if (t.dataset.action === "save-profile") saveProfile();
  else if (t.dataset.action === "save-custom-food") saveCustomFood();
  else if (t.dataset.action === "add-exercise") {
    const input = document.getElementById("add-ex-name");
    const name = input.value.trim();
    if (!name) return;
    editing.draft.blocks.push({ name, sets: 3, lo: 8, hi: 12, inc: 5, note: "" });
    render();
  } else if (t.dataset.action === "save-edit") saveEdit();
  else if (t.dataset.action === "cancel-edit") {
    editing = null;
    go("train");
  } else if (t.dataset.action === "reset-day") resetEditDay();
  else if (t.dataset.action === "reset-program") {
    if (confirm("Reset every day of your program back to the built-in template?")) {
      delete state.customPrograms[state.profile.daysPerWeek];
      saveState();
      render();
    }
  } else if (t.dataset.action === "restart-plan") {
    if (confirm("Restart the annual plan? This week becomes Year 1, Quarter 1 (Foundation), Week 1.")) {
      state.planStart = isoOf(mondayOf(new Date()));
      saveState();
      render();
    }
  } else if (t.dataset.action === "export") exportBackup();
  else if (t.dataset.action === "import") importBackup();
  else if (t.dataset.action === "reset") {
    if (confirm("Erase ALL data (profile, workouts, food logs, custom programs)? Export a backup first if unsure.")) {
      localStorage.removeItem(STORE_KEY);
      state = loadState();
      session = null;
      editing = null;
      go("profile");
    }
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "food-search") {
    eatSearch = e.target.value;
    render();
    const el = document.getElementById("food-search");
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  } else if (e.target.dataset.set && session) {
    const [bi, si, field] = e.target.dataset.set.split(":");
    session.blocks[bi].setLogs[si][field] = e.target.value;
  } else if (e.target.dataset.edit && editing) {
    const [i, field] = e.target.dataset.edit.split(":");
    editing.draft.blocks[i][field] = e.target.value;
  }
});

render();
