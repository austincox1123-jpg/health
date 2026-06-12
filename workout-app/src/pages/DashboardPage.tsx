import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDays, format, isSameMonth, subDays } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CalendarRange, Check, ClipboardList, Dumbbell, Flame, Trophy, ArrowRight, CalendarClock,
} from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Badge, phaseTypeColor, sessionTypeColor } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { usePlanStore } from '../stores/planStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { PHASE_COLORS, PHASE_LABELS } from '../data/phaseTemplates';
import { CHART } from '../utils/chartTheme';
import { formatWeight, formatDuration } from '../utils/calculations';
import { getWeekStart, orderedDays, DAY_LABELS, daysUntil, formatShort, sameDay } from '../utils/dates';
import type { CompletedWorkout, PersonalRecord, WeekPlan } from '../types';

// ---------- helpers ----------

function dayKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function computeStreak(completed: CompletedWorkout[]): number {
  const days = new Set(completed.map((w) => dayKey(w.date)));
  const today = new Date();
  let cursor = days.has(dayKey(today)) ? today : subDays(today, 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

// ---------- subcomponents ----------

function PhaseBanner() {
  const currentPhase = usePlanStore((s) => s.currentPhase);
  const currentWeek = usePlanStore((s) => s.currentWeek);
  const completed = useWorkoutStore((s) => s.completed);
  const weekStart = useSettingsStore((s) => s.settings.weekStart);

  const phase = currentPhase();
  const week = currentWeek();

  if (!phase) {
    return (
      <Card>
        <EmptyState
          icon={CalendarRange}
          headline="No active training block"
          description="Build an annual plan to see your current phase, weekly targets, and planned sessions here."
          action={
            <Link to="/plan">
              <Button>Open Plan Builder</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  // weekNumber is the ISO week of the year — position within the phase is its index
  const weekNumber = week ? phase.weeks.findIndex((w) => w.id === week.id) + 1 : 1;
  const totalWeeks = phase.durationWeeks || phase.weeks.length || 1;
  const progressPct = Math.min(100, Math.round((weekNumber / totalWeeks) * 100));

  const ws = getWeekStart(new Date(), weekStart);
  const we = addDays(ws, 7);
  const setsThisWeek = completed
    .filter((w) => w.date.getTime() >= ws.getTime() && w.date.getTime() < we.getTime())
    .reduce((acc, w) => acc + w.totalSets, 0);

  const endsIn = daysUntil(phase.endDate);
  const accent = PHASE_COLORS[phase.type];

  return (
    <Card accentColor={accent}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-lg font-extrabold text-text-primary truncate">{phase.name}</h2>
            <Badge color={phaseTypeColor(phase.type)}>{PHASE_LABELS[phase.type]}</Badge>
            {week?.isDeload && <Badge color="green">Deload</Badge>}
          </div>
          <div className="section-label">
            Week <span className="font-mono">{weekNumber}</span> of{' '}
            <span className="font-mono">{totalWeeks}</span>
          </div>
          <div className="mt-2 h-1.5 w-56 max-w-full bg-surface-alt rounded-sm overflow-hidden">
            <div className="h-full rounded-sm" style={{ width: `${progressPct}%`, backgroundColor: accent }} />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="section-label mb-0.5">Volume this week</div>
            <div className="text-xl font-mono font-bold text-text-primary">
              {setsThisWeek}
              {week?.targetVolume !== undefined && (
                <span className="text-text-secondary text-sm"> / {week.targetVolume} sets</span>
              )}
              {week?.targetVolume === undefined && <span className="text-text-secondary text-sm"> sets</span>}
            </div>
          </div>
          <div>
            <div className="section-label mb-0.5">Intensity</div>
            <div className="text-xl font-bold text-text-primary capitalize">
              {phase.targetIntensityLevel.replace('_', ' ')}
            </div>
          </div>
          <div>
            <div className="section-label mb-0.5">Phase ends</div>
            <div className="text-xl font-mono font-bold text-text-primary">
              {endsIn >= 0 ? `in ${endsIn} d` : 'ended'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function WeekStrip() {
  const navigate = useNavigate();
  const weekStart = useSettingsStore((s) => s.settings.weekStart);
  const currentWeek = usePlanStore((s) => s.currentWeek);
  const completed = useWorkoutStore((s) => s.completed);

  const today = new Date();
  const start = getWeekStart(today, weekStart);
  const days = orderedDays(weekStart);
  const week: WeekPlan | undefined = currentWeek();

  return (
    <div>
      <h3 className="section-label mb-2">This Week</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((dow, i) => {
          const date = addDays(start, i);
          const isToday = sameDay(date, today);
          const session = week?.plannedSessions.find((ps) => ps.dayOfWeek === dow);
          const done = completed.find((w) => sameDay(w.date, date));
          return (
            <button
              key={dow}
              onClick={() => navigate(done ? `/workouts/${done.id}` : '/workouts/log')}
              className={`bg-surface border border-border rounded-sm p-2.5 text-left hover:border-accent transition-colors min-w-0 ${
                isToday ? 'ring-1 ring-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-label text-text-secondary">
                  {DAY_LABELS[dow]} <span className="font-mono text-text-muted">{format(date, 'd')}</span>
                </span>
                {done && <Check size={14} className="text-success shrink-0" />}
              </div>
              {session ? (
                <>
                  <div className="text-xs font-semibold text-text-primary truncate mb-1">{session.label}</div>
                  <Badge color={sessionTypeColor(session.sessionType)}>{session.sessionType.replace('_', ' ')}</Badge>
                </>
              ) : (
                <div className="text-xs text-text-muted">—</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon }: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Dumbbell;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="section-label mb-1">{label}</div>
          <div className="text-2xl font-mono font-bold text-text-primary truncate">{value}</div>
          {sub && <div className="text-xs text-text-secondary mt-0.5 truncate">{sub}</div>}
        </div>
        <Icon size={18} className="text-text-muted shrink-0" />
      </div>
    </Card>
  );
}

function MetricsRow() {
  const completed = useWorkoutStore((s) => s.completed);
  const currentWeek = usePlanStore((s) => s.currentWeek);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);

  const now = new Date();
  const thisMonth = completed.filter((w) => isSameMonth(w.date, now));
  const volumeThisMonth = thisMonth.reduce((acc, w) => acc + w.totalVolume, 0);
  const streak = useMemo(() => computeStreak(completed), [completed]);

  // Next non-rest planned session, scanning today forward across up to 2 weeks.
  let nextLabel = '—';
  let nextSub: string | undefined;
  for (let i = 0; i < 14; i += 1) {
    const date = addDays(now, i);
    const week = currentWeek(date);
    const session = week?.plannedSessions.find(
      (ps) => ps.dayOfWeek === date.getDay() && ps.sessionType !== 'rest',
    );
    if (session) {
      nextLabel = session.label;
      nextSub = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_LABELS[session.dayOfWeek];
      break;
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Workouts this month" value={String(thisMonth.length)} icon={Dumbbell} />
      <StatCard label="Volume this month" value={formatWeight(volumeThisMonth, weightUnit)} icon={ClipboardList} />
      <StatCard label="Current streak" value={`${streak} d`} icon={Flame} />
      <StatCard label="Next session" value={nextLabel} sub={nextSub} icon={CalendarClock} />
    </div>
  );
}

function RecentWorkouts() {
  const navigate = useNavigate();
  const completed = useWorkoutStore((s) => s.completed);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);
  const recent = completed.slice(0, 3);

  return (
    <Card padded={false} className="p-4">
      <CardHeader
        title="Recent Workouts"
        action={
          <Link to="/workouts" className="text-xs text-accent hover:underline">
            All workouts
          </Link>
        }
      />
      {recent.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          headline="No workouts logged yet"
          description="Log your first session to see it here."
          action={
            <Link to="/workouts/log">
              <Button size="sm">Log a Workout</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {recent.map((w) => (
            <button
              key={w.id}
              onClick={() => navigate(`/workouts/${w.id}`)}
              className="w-full flex items-center justify-between gap-3 bg-surface-alt border border-border rounded-sm px-3 py-2.5 text-left hover:border-accent transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text-primary truncate">{w.name}</div>
                <div className="text-xs text-text-secondary font-mono">{formatShort(w.date)}</div>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-text-secondary shrink-0">
                <span>{formatDuration(w.durationMinutes * 60)}</span>
                <span>{formatWeight(w.totalVolume, weightUnit)}</span>
                <span>{w.totalSets} sets</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function PRsThisMonth() {
  const personalRecords = useWorkoutStore((s) => s.personalRecords);
  const byId = useExerciseStore((s) => s.byId);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);

  const now = new Date();
  const prs: PersonalRecord[] = personalRecords.filter((pr) => isSameMonth(pr.date, now));
  const sevenDaysAgo = subDays(now, 7).getTime();

  return (
    <Card padded={false} className="p-4">
      <CardHeader title="PRs This Month" />
      {prs.length === 0 ? (
        <EmptyState
          icon={Trophy}
          headline="No PRs this month"
          description="Hit a new personal record and it will show up here."
        />
      ) : (
        <div className="max-h-56 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="section-label pb-2 font-bold">Exercise</th>
                <th className="section-label pb-2 font-bold text-right">Weight</th>
                <th className="section-label pb-2 font-bold text-right">Reps</th>
                <th className="section-label pb-2 font-bold text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {prs.map((pr) => (
                <tr key={pr.id} className="border-t border-border">
                  <td className="py-2 text-text-primary">
                    <span className="inline-flex items-center gap-2">
                      {byId(pr.exerciseId)?.name ?? 'Unknown exercise'}
                      {pr.date.getTime() >= sevenDaysAgo && <Badge color="orange">New</Badge>}
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-text-primary">
                    {formatWeight(pr.value, weightUnit)}
                  </td>
                  <td className="py-2 text-right font-mono text-text-secondary">{pr.reps ?? '—'}</td>
                  <td className="py-2 text-right font-mono text-text-secondary">{formatShort(pr.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function VolumeTeaser() {
  const completed = useWorkoutStore((s) => s.completed);
  const weekStart = useSettingsStore((s) => s.settings.weekStart);
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);

  const data = useMemo(() => {
    const thisWeekStart = getWeekStart(new Date(), weekStart);
    return Array.from({ length: 8 }, (_, i) => {
      const ws = addDays(thisWeekStart, (i - 7) * 7);
      const we = addDays(ws, 7);
      const volume = completed
        .filter((w) => w.date.getTime() >= ws.getTime() && w.date.getTime() < we.getTime())
        .reduce((acc, w) => acc + w.totalVolume, 0);
      return { week: formatShort(ws), volume };
    });
  }, [completed, weekStart]);

  return (
    <Card padded={false} className="p-4">
      <CardHeader
        title="Weekly Volume — Last 8 Weeks"
        action={
          <Link to="/progress" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
            View Progress <ArrowRight size={12} />
          </Link>
        }
      />
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
              stroke={CHART.axis}
              tick={{ fill: CHART.axis, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: CHART.grid }}
            />
            <YAxis
              stroke={CHART.axis}
              tick={{ fill: CHART.axis, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              tickLine={false}
              axisLine={{ stroke: CHART.grid }}
              width={56}
            />
            <Tooltip
              cursor={{ fill: '#2A2F3E', opacity: 0.4 }}
              contentStyle={CHART.tooltip}
              formatter={(value) => [formatWeight(Number(value), weightUnit), 'Volume']}
            />
            <Bar dataKey="volume" fill={CHART.accent} radius={[2, 2, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// ---------- page ----------

export function DashboardPage() {
  return (
    <div className="space-y-5">
      <PhaseBanner />
      <WeekStrip />
      <MetricsRow />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentWorkouts />
        <PRsThisMonth />
      </div>
      <VolumeTeaser />
    </div>
  );
}
