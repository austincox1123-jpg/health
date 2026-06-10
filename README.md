# HEALTH — Personal Training & Nutrition App

A zero-dependency, fully static web app for planning workouts, tracking macros, and staying current with strength & nutrition research. No accounts, no servers, no AI/API costs — all logic is rule-based and all data stays in your browser's localStorage.

## Features

- **Train** — a periodized annual plan (48-week macrocycle: 4 quarterly blocks → 3 monthly mesocycles each → 3 build weeks + 1 deload) presented as a dashboard: phase banner, annual breakout, and a browsable week grid showing every workout at once. Rep schemes shift automatically per block (Foundation → Strength → Hypertrophy → Peak & Test). Every day is fully customizable — add/remove/reorder exercises, change sets/reps, rename days, edit finishers — and edits carry through the whole year. Logs every set and suggests when to add weight (double progression).
- **Eat** — calorie/macro targets from your stats (Mifflin-St Jeor TDEE), a built-in food database plus custom foods, daily logging, and snack/meal suggestions matched to your *remaining* macros.
- **Learn** — curated evidence-based topic summaries with links to the research, plus saved PubMed searches (sorted newest-first) to keep up with new studies.
- **Profile** — stats, goals, split settings, and JSON export/import for backups.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Create a **public** repo (free GitHub Pages requires public) and push this folder.
2. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Visit `https://<username>.github.io/<repo>/`. On your phone, use "Add to Home Screen" for an app-like experience at the gym.

> Your logs never leave your device — only the app code is in the repo. Note that localStorage is per-browser/per-device, so use **Profile → Export backup** to move data between devices.
