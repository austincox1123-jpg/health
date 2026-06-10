// App shell: state, routing, and rendering. No build step, no dependencies.
// All data lives in localStorage under one key; Profile tab can export/import it.

const STORE_KEY = "health-app-v1";

let state = loadState();
let view = state.profile ? "today" : "profile";
let session = null; // in-progress workout, not persisted until finished
let eatSearch = "";

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load saved data", e);
  }
  return { profile: null, workouts: [], food: {}, customFoods: [] };
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function allFoods() {
  return FOODS.concat(state.customFoods);
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
  const nav = TABS.map(
    (t) => `<button class="tab ${view === t.id || (view === "log" && t.id === "train") ? "active" : ""}" data-go="${t.id}">${t.label}</button>`
  ).join("");
  document.getElementById("nav").innerHTML = nav;

  const main = document.getElementById("main");
  if (!state.profile && view !== "profile") view = "profile";
  if (view === "today") main.innerHTML = renderToday();
  else if (view === "train") main.innerHTML = renderTrain();
  else if (view === "log") main.innerHTML = renderLog();
  else if (view === "eat") main.innerHTML = renderEat();
  else if (view === "learn") main.innerHTML = renderLearn();
  else main.innerHTML = renderProfile();
}

// ---------- Today ----------

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
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  return state.workouts.filter((w) => new Date(w.date + "T12:00") >= monday).length;
}

function renderToday() {
  const p = state.profile;
  const targets = macroTargets(p);
  const totals = dayTotals(state.food[todayStr()] || []);
  const program = getProgram(p.daysPerWeek, p.conditioning);
  const done = weekWorkoutCount();
  const nextDay = program[Math.min(done, program.length - 1)];
  const lastLog = state.workouts[state.workouts.length - 1];

  return `
    <h1>Today</h1>
    <div class="card">
      <h2>Training</h2>
      <p class="muted">${done} of ${p.daysPerWeek} sessions logged this week.</p>
      <p>Up next: <strong>${nextDay.day}</strong> — ${nextDay.blocks.length} exercises${nextDay.finisher ? " + conditioning finisher" : ""}</p>
      <button class="btn primary" data-start="${program.indexOf(nextDay)}">Start ${nextDay.day}</button>
      ${lastLog ? `<p class="muted small">Last session: ${lastLog.day} on ${lastLog.date}</p>` : ""}
    </div>
    <div class="card">
      <h2>Nutrition</h2>
      ${macroBar("Calories", totals.cal, targets.cal, "kcal")}
      ${macroBar("Protein", totals.p, targets.p, "g")}
      ${macroBar("Carbs", totals.c, targets.c, "g")}
      ${macroBar("Fat", totals.f, targets.f, "g")}
      <button class="btn" data-go="eat">Log food</button>
    </div>`;
}

// ---------- Train ----------

function renderTrain() {
  const p = state.profile;
  const program = getProgram(p.daysPerWeek, p.conditioning);
  const days = program
    .map(
      (d, i) => `
      <div class="card">
        <div class="row-between">
          <h2>${d.day}</h2>
          <button class="btn primary" data-start="${i}">Start</button>
        </div>
        <ul class="plain">
          ${d.blocks.map((b) => `<li>${b.name} — ${b.sets} x ${b.lo === b.hi ? b.lo : b.lo + "-" + b.hi}${b.note ? ` <span class="muted">(${b.note})</span>` : ""}</li>`).join("")}
        </ul>
        ${d.finisher ? `<p class="finisher">Finisher: ${d.finisher}</p>` : ""}
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
          return `${e.name} ${top.weight || 0}x${top.reps || 0}`;
        })
        .join(" · ");
      return `<li><strong>${w.date}</strong> — ${w.day}${best ? `<br><span class="muted small">${best}</span>` : ""}</li>`;
    })
    .join("");

  return `
    <h1>Train</h1>
    <p class="muted">${p.daysPerWeek}-day split${p.conditioning ? " with conditioning finishers" : ""}. Change it in Profile.</p>
    ${days}
    <div class="card">
      <h2>History</h2>
      ${history ? `<ul class="plain history">${history}</ul>` : `<p class="muted">No workouts logged yet.</p>`}
    </div>`;
}

function startWorkout(dayIndex) {
  const p = state.profile;
  const program = getProgram(p.daysPerWeek, p.conditioning);
  const day = program[dayIndex];
  session = {
    day: day.day,
    finisher: day.finisher,
    blocks: day.blocks.map((b) => {
      const sug = suggestNext(state.workouts, b);
      return {
        ...b,
        suggestion: sug,
        setLogs: Array.from({ length: b.sets }, () => ({ weight: sug ? sug.weight : "", reps: "" })),
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
        <h3>${b.name}</h3>
        <p class="muted small">${b.sets} sets x ${b.lo === b.hi ? b.lo : b.lo + "-" + b.hi} reps${b.note ? ` — ${b.note}` : ""}</p>
        ${b.suggestion ? `<p class="suggest">${b.suggestion.msg}</p>` : `<p class="muted small">First time logging this — pick a weight you can control for ${b.hi} reps.</p>`}
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
    <h1>${session.day}</h1>
    ${blocks}
    ${session.finisher ? `<div class="card"><h3>Finisher</h3><p>${session.finisher}</p></div>` : ""}
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
        .join("")}`
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
    ${firstTime ? `<p class="muted">Everything is computed from this: your training split, calories, and macros. Data stays in this browser.</p>` : ""}
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
      <button class="btn primary" data-action="save-profile">${firstTime ? "Create my plan" : "Save changes"}</button>
    </div>
    ${
      firstTime
        ? ""
        : `
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
  state.profile = profile;
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
  const t = e.target.closest("[data-go],[data-start],[data-action],[data-add-food],[data-del-food]");
  if (!t) return;
  if (t.dataset.go) go(t.dataset.go);
  else if (t.dataset.start !== undefined) startWorkout(parseInt(t.dataset.start, 10));
  else if (t.dataset.addFood) addFood(t.dataset.addFood);
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
  else if (t.dataset.action === "export") exportBackup();
  else if (t.dataset.action === "import") importBackup();
  else if (t.dataset.action === "reset") {
    if (confirm("Erase ALL data (profile, workouts, food logs)? Export a backup first if unsure.")) {
      localStorage.removeItem(STORE_KEY);
      state = loadState();
      session = null;
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
  }
});

render();
