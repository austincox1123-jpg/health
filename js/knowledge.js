// Curated, evidence-based knowledge library.
// Summaries reflect the research consensus as of 2026; links use stable
// PubMed search URLs (so they surface new papers too) plus trusted
// evidence-review sites.
const KNOWLEDGE = [
  {
    title: "Training volume drives muscle growth",
    cat: "Hypertrophy",
    summary:
      "Weekly hard sets per muscle group is the best-supported driver of hypertrophy. Meta-analyses show a dose-response relationship: more sets generally means more growth, with ~10-20 hard sets per muscle per week the productive range for most intermediates. Beyond that, returns diminish and recovery suffers.",
    takeaways: [
      "Count weekly hard sets per muscle; start near 10-12 and add only if recovering well.",
      "A 'hard set' is taken close to failure (0-3 reps in reserve).",
      "Coming from CrossFit, your direct volume for chest/arms/lats is probably low — the program here fixes that.",
    ],
    links: [
      { label: "PubMed: Schoenfeld volume dose-response", url: "https://pubmed.ncbi.nlm.nih.gov/?term=schoenfeld+resistance+training+volume+hypertrophy+dose-response" },
      { label: "Stronger by Science: training volume", url: "https://www.strongerbyscience.com/volume/" },
    ],
  },
  {
    title: "Proximity to failure (reps in reserve)",
    cat: "Hypertrophy",
    summary:
      "Sets stimulate growth most in the final reps before failure. Training to ~0-3 reps in reserve (RIR) produces similar hypertrophy to grinding every set to absolute failure, with less fatigue. For strength work, stopping 1-3 reps shy preserves bar speed and lets you accumulate quality volume.",
    takeaways: [
      "Most accessory sets: stop 1-2 reps shy of failure; take the last set of isolation moves to failure if you like.",
      "Heavy main lifts (4-6 reps): keep 1-3 reps in reserve to manage fatigue and protect technique.",
      "If you could have done 5+ more reps, the set was too easy — add weight or reps.",
    ],
    links: [
      { label: "PubMed: proximity to failure hypertrophy", url: "https://pubmed.ncbi.nlm.nih.gov/?term=resistance+training+proximity+to+failure+hypertrophy" },
      { label: "Stronger by Science: training to failure", url: "https://www.strongerbyscience.com/training-to-failure/" },
    ],
  },
  {
    title: "Progressive overload & double progression",
    cat: "Strength",
    summary:
      "Strength is highly specific: to get stronger at a lift, practice that lift with heavy loads and add weight or reps over time. Double progression — work within a rep range, and add weight once you hit the top of the range on all sets — is a simple, sustainable way to force overload without stalling. This app's suggestions implement exactly that.",
    takeaways: [
      "Log every set; the app tells you when to add weight.",
      "Expect fast 'newbie-like' gains on bodybuilding-style lifts you haven't trained directly in CrossFit.",
      "When a lift stalls 2-3 sessions in a row, drop the weight ~10% and build back up.",
    ],
    links: [
      { label: "PubMed: progressive overload resistance training", url: "https://pubmed.ncbi.nlm.nih.gov/?term=progressive+overload+resistance+training+strength" },
      { label: "Stronger by Science: program design", url: "https://www.strongerbyscience.com/complete-strength-training-guide/" },
    ],
  },
  {
    title: "Training frequency",
    cat: "Programming",
    summary:
      "When weekly volume is matched, training a muscle 2x vs 1x per week produces similar or slightly better growth, and spreading sets across more days makes each session more productive and recoverable. Upper/lower and push/pull/legs splits hit everything about twice a week — which is why this app uses them.",
    takeaways: [
      "Hit each muscle ~2x per week.",
      "More frequency is mainly a tool to distribute volume, not magic on its own.",
    ],
    links: [
      { label: "PubMed: training frequency hypertrophy meta-analysis", url: "https://pubmed.ncbi.nlm.nih.gov/?term=resistance+training+frequency+hypertrophy+meta-analysis" },
    ],
  },
  {
    title: "Rest periods: take more than CrossFit taught you",
    cat: "Programming",
    summary:
      "Longer rests (2-3+ min on compounds) beat short rests for both strength and hypertrophy because they let you do more total work at a given load. The CrossFit habit of racing the clock works against you in a bodybuilding/strength context.",
    takeaways: [
      "Main lifts: rest 2-4 min. Accessories: 1.5-2 min. Isolation: ~1 min is fine.",
      "Supersetting opposing muscles (e.g. curls + pushdowns) saves time without hurting performance.",
    ],
    links: [
      { label: "PubMed: rest interval resistance training", url: "https://pubmed.ncbi.nlm.nih.gov/?term=rest+interval+resistance+training+hypertrophy" },
    ],
  },
  {
    title: "Protein: how much and when",
    cat: "Nutrition",
    summary:
      "The landmark Morton et al. (2018) meta-analysis found muscle gain benefits plateau around 1.6 g/kg/day, with ~2.2 g/kg (1 g/lb) as a sensible upper target — especially in a deficit or recomp. Distribution matters far less than the daily total; 3-5 feedings of 25-40 g each is a practical pattern.",
    takeaways: [
      "Your target in this app is ~1 g per lb of bodyweight per day.",
      "Anchor each meal around a protein source; use shakes/Greek yogurt to close gaps.",
      "The post-workout 'anabolic window' is wide — total daily intake dominates.",
    ],
    links: [
      { label: "PubMed: Morton protein supplementation meta-analysis", url: "https://pubmed.ncbi.nlm.nih.gov/?term=morton+protein+supplementation+meta-analysis+resistance" },
      { label: "Examine: protein intake guide", url: "https://examine.com/guides/protein-intake/" },
    ],
  },
  {
    title: "Energy balance: bulk, cut, or recomp",
    cat: "Nutrition",
    summary:
      "Muscle gain is fastest in a small calorie surplus (~5-15% over maintenance); bigger surpluses mostly add fat. Fat loss requires a deficit, and high protein + lifting preserves muscle while cutting. Lifters new to bodybuilding-style training (like a CrossFitter switching over) can often recomp — gain muscle and lose fat near maintenance calories.",
    takeaways: [
      "Lean bulk: aim to gain ~0.25-0.5% of bodyweight per week; slower is leaner.",
      "Cut: lose 0.5-1% of bodyweight per week; faster than that costs muscle.",
      "Weigh yourself a few mornings a week and judge by the weekly average, not single days.",
    ],
    links: [
      { label: "PubMed: energy surplus resistance training body composition", url: "https://pubmed.ncbi.nlm.nih.gov/?term=energy+surplus+resistance+training+body+composition" },
      { label: "Stronger by Science: nutrition articles", url: "https://www.strongerbyscience.com/category/nutrition/" },
    ],
  },
  {
    title: "Keeping your engine: concurrent training",
    cat: "Conditioning",
    summary:
      "Cardio does not meaningfully blunt muscle or strength gains at moderate doses — the 'interference effect' shows up mainly with high-volume, high-impact endurance work (lots of running). Cycling, rowing, and incline walking interfere least. 2-3 conditioning sessions a week preserves most of the engine you built in CrossFit.",
    takeaways: [
      "Bias conditioning toward bike/row/sled — joint-friendly and low interference.",
      "Separate hard cardio from lifting by 6+ hours, or put it after lifting, or on rest days.",
      "1-2 interval sessions + 1-2 easy zone-2 sessions per week covers both ends.",
    ],
    links: [
      { label: "PubMed: concurrent training interference meta-analysis", url: "https://pubmed.ncbi.nlm.nih.gov/?term=concurrent+training+interference+hypertrophy+meta-analysis" },
    ],
  },
  {
    title: "Sleep & recovery",
    cat: "Recovery",
    summary:
      "Sleep restriction measurably reduces muscle protein synthesis, testosterone, training output, and fat loss (more weight lost as lean mass in a deficit). It is the highest-leverage recovery tool you have — well ahead of any supplement.",
    takeaways: [
      "Target 7-9 hours; consistency of sleep/wake times matters too.",
      "Deload (lighter week) every 6-10 weeks or when joints/motivation/performance dip together.",
    ],
    links: [
      { label: "PubMed: sleep restriction muscle resistance training", url: "https://pubmed.ncbi.nlm.nih.gov/?term=sleep+restriction+muscle+protein+synthesis+resistance" },
    ],
  },
  {
    title: "Supplements worth your money",
    cat: "Nutrition",
    summary:
      "Only a handful of supplements have strong evidence: creatine monohydrate (3-5 g/day, the most-studied ergogenic aid in existence), caffeine pre-training, and protein powder as convenient food. Most everything else is marginal or unproven.",
    takeaways: [
      "Creatine monohydrate 5 g daily, any time, no cycling needed.",
      "Caffeine ~3-6 mg/kg pre-workout helps strength and work capacity.",
      "Skip BCAAs if you eat enough protein; skip most 'test boosters' and fat burners entirely.",
    ],
    links: [
      { label: "Examine: creatine", url: "https://examine.com/supplements/creatine/" },
      { label: "PubMed: creatine supplementation resistance training", url: "https://pubmed.ncbi.nlm.nih.gov/?term=creatine+monohydrate+supplementation+resistance+training+meta-analysis" },
    ],
  },
  {
    title: "From CrossFit to the gym: what changes",
    cat: "Programming",
    summary:
      "You're keeping the barbell skill, work capacity, and consistency habit — big advantages. What changes: progress is now measured per-lift over weeks (not per-WOD), you'll rest longer, isolate small muscles directly, and push close to failure on controlled reps instead of racing a clock. Expect rapid early progress on hypertrophy work your CrossFit programming never targeted.",
    takeaways: [
      "Resist the urge to turn lifting sessions into metcons — the finishers cover conditioning.",
      "Slow down rep tempo; control the eccentric instead of cycling reps.",
      "Your numbers on new accessory lifts will climb fast for months — ride that wave with the logger.",
    ],
    links: [
      { label: "Renaissance Periodization (YouTube)", url: "https://www.youtube.com/@RenaissancePeriodization" },
      { label: "Jeff Nippard (YouTube)", url: "https://www.youtube.com/@JeffNippard" },
    ],
  },
];

// Standing searches & sources for staying current with NEW research.
const STAY_CURRENT = [
  {
    label: "PubMed: new hypertrophy RCTs/meta-analyses (sorted newest first)",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=resistance+training+hypertrophy&filter=pubt.meta-analysis&filter=pubt.randomizedcontrolledtrial&sort=date",
  },
  {
    label: "PubMed: new strength training research",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=resistance+training+strength+adaptations&sort=date",
  },
  {
    label: "PubMed: new sports nutrition / protein research",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=protein+intake+resistance+training+body+composition&sort=date",
  },
  {
    label: "PubMed: new concurrent training research",
    url: "https://pubmed.ncbi.nlm.nih.gov/?term=concurrent+training+resistance+endurance&sort=date",
  },
  {
    label: "Google Scholar alerts (set email alerts for any query)",
    url: "https://scholar.google.com/scholar_alerts",
  },
  {
    label: "Stronger by Science (research reviews in plain English)",
    url: "https://www.strongerbyscience.com/",
  },
  {
    label: "MASS Research Review (monthly study breakdowns)",
    url: "https://massresearchreview.com/",
  },
  {
    label: "Examine.com (supplement & nutrition evidence database)",
    url: "https://examine.com/",
  },
  {
    label: "Journal of Strength and Conditioning Research",
    url: "https://journals.lww.com/nsca-jscr/pages/default.aspx",
  },
];
