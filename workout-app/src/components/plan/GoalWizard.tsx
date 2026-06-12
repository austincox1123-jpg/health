import { useState } from 'react';
import {
  Activity,
  BicepsFlexed,
  Dumbbell,
  Flame,
  HeartPulse,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge, phaseTypeColor } from '../ui/Badge';
import { usePlanStore } from '../../stores/planStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { toast } from '../../stores/toastStore';
import { generateAnnualPlan, type PlanWizardInput } from '../../utils/planGenerator';
import { generatePlanWorkouts } from '../../utils/workoutGenerator';
import { PHASE_COLORS, GOAL_LABELS, PHASE_LABELS } from '../../data/phaseTemplates';
import { formatShort, formatFull } from '../../utils/dates';
import {
  allPlanPhases,
  fromDateInput,
  toDateInput,
  VOLUME_LABELS,
  INTENSITY_LABELS,
} from './planShared';
import type { AnnualPlan, GoalType, WorkoutTemplate } from '../../types';

const GOAL_ICONS: Record<GoalType, LucideIcon> = {
  fat_loss: Flame,
  strength: Dumbbell,
  hypertrophy: BicepsFlexed,
  endurance: Activity,
  athletic_performance: Trophy,
  general_fitness: HeartPulse,
  power: Zap,
  custom: SlidersHorizontal,
};

const GOAL_ORDER: GoalType[] = [
  'fat_loss', 'strength', 'hypertrophy', 'endurance',
  'athletic_performance', 'general_fitness', 'power', 'custom',
];

const EQUIPMENT_OPTIONS: { value: PlanWizardInput['equipment']; label: string }[] = [
  { value: 'full_gym', label: 'Full Gym' },
  { value: 'home_gym', label: 'Home Gym' },
  { value: 'bodyweight', label: 'Bodyweight Only' },
];

const STEPS = ['Goal', 'Setup', 'Preview'];

interface EventRow {
  id: string;
  date: string;
  label: string;
}

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'active' : 'todo';
        return (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <span className="w-8 h-px bg-border" />}
            <span
              className={`w-6 h-6 rounded-sm border flex items-center justify-center text-xs font-mono font-bold ${
                state === 'active'
                  ? 'bg-accent border-accent text-white'
                  : state === 'done'
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-surface-alt border-border text-text-muted'
              }`}
            >
              {n}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-label ${
                state === 'active' ? 'text-text-primary' : 'text-text-secondary'
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MiniGantt({ plan }: { plan: AnnualPlan }) {
  const phases = allPlanPhases(plan);
  const totalWeeks = phases.reduce((acc, ph) => acc + ph.durationWeeks, 0) || 1;
  return (
    <div className="flex h-9 w-full rounded-sm overflow-hidden border border-border">
      {phases.map((ph) => (
        <div
          key={ph.id}
          title={`${ph.name} · ${ph.durationWeeks} wk`}
          className="flex flex-col items-center justify-center overflow-hidden border-r border-background/40 last:border-r-0"
          style={{
            width: `${(ph.durationWeeks / totalWeeks) * 100}%`,
            backgroundColor: `${PHASE_COLORS[ph.type]}CC`,
          }}
        >
          <span className="text-[9px] font-bold text-white truncate max-w-full px-0.5">{ph.name}</span>
          <span className="text-[9px] font-mono text-white/80">{ph.durationWeeks}w</span>
        </div>
      ))}
    </div>
  );
}

export function GoalWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const savePlan = usePlanStore((s) => s.savePlan);
  const setActivePlan = usePlanStore((s) => s.setActivePlan);
  const saveTemplate = useWorkoutStore((s) => s.saveTemplate);

  const today = new Date();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<GoalType>('general_fitness');
  const [year, setYear] = useState(String(today.getFullYear()));
  const [startDate, setStartDate] = useState(toDateInput(today));
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState<PlanWizardInput['equipment']>('full_gym');
  const [events, setEvents] = useState<EventRow[]>([]);
  const [preview, setPreview] = useState<AnnualPlan | null>(null);
  const [previewTemplates, setPreviewTemplates] = useState<WorkoutTemplate[]>([]);

  const reset = () => {
    setStep(1);
    setGoal('general_fitness');
    setYear(String(new Date().getFullYear()));
    setStartDate(toDateInput(new Date()));
    setDaysPerWeek(4);
    setEquipment('full_gym');
    setEvents([]);
    setPreview(null);
    setPreviewTemplates([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const buildInput = (): PlanWizardInput => ({
    goal,
    year: Number(year) || today.getFullYear(),
    startDate: fromDateInput(startDate),
    daysPerWeek,
    equipment,
    events: events
      .filter((e) => e.date && e.label.trim())
      .map((e) => ({ date: fromDateInput(e.date), label: e.label.trim() })),
  });

  const buildPreview = () => {
    const input = buildInput();
    const { templates, plan } = generatePlanWorkouts(input, generateAnnualPlan(input));
    setPreview(plan);
    setPreviewTemplates(templates);
  };

  const regenerate = () => buildPreview();

  const goNext = () => {
    if (step === 2) {
      const start = fromDateInput(startDate);
      if (Number.isNaN(start.getTime())) {
        toast('error', 'Pick a valid start date');
        return;
      }
      buildPreview();
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const accept = async () => {
    if (!preview) return;
    for (const template of previewTemplates) {
      await saveTemplate(template);
    }
    await savePlan(preview);
    await setActivePlan(preview.id);
    toast(
      'success',
      `Plan generated with ${previewTemplates.length} workout template${previewTemplates.length === 1 ? '' : 's'}`,
    );
    close();
  };

  return (
    <Modal open={open} onClose={close} title="New Annual Plan" wide>
      <StepIndicator step={step} />

      {step === 1 && (
        <div>
          <p className="section-label mb-3">Primary Goal</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GOAL_ORDER.map((g) => {
              const Icon = GOAL_ICONS[g];
              const active = goal === g;
              return (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-sm border transition-colors ${
                    active
                      ? 'border-accent bg-accent/10 text-text-primary'
                      : 'border-border bg-surface-alt text-text-secondary hover:border-accent/50 hover:text-text-primary'
                  }`}
                >
                  <Icon size={22} className={active ? 'text-accent' : ''} />
                  <span className="text-xs font-bold uppercase tracking-label text-center">
                    {GOAL_LABELS[g]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Plan Year"
              type="number"
              mono
              min={2000}
              max={2100}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <Input
              label="Start Date"
              type="date"
              mono
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <p className="section-label mb-1.5">Training Days / Week</p>
            <div className="inline-flex border border-border rounded-sm overflow-hidden">
              {[2, 3, 4, 5, 6, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setDaysPerWeek(n)}
                  className={`px-4 py-2 text-sm font-mono font-bold transition-colors ${
                    daysPerWeek === n
                      ? 'bg-accent text-white'
                      : 'bg-surface-alt text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-1.5">Equipment Access</p>
            <div className="inline-flex border border-border rounded-sm overflow-hidden">
              {EQUIPMENT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setEquipment(o.value)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-label transition-colors ${
                    equipment === o.value
                      ? 'bg-accent text-white'
                      : 'bg-surface-alt text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="section-label mb-1.5">Fixed Events</p>
            <p className="text-xs text-text-secondary mb-2">
              Races, competitions, or deadlines the plan should note.
            </p>
            <div className="space-y-2">
              {events.map((ev) => (
                <div key={ev.id} className="flex gap-2 items-center">
                  <Input
                    type="date"
                    mono
                    className="max-w-[170px]"
                    value={ev.date}
                    onChange={(e) =>
                      setEvents((rows) => rows.map((r) => (r.id === ev.id ? { ...r, date: e.target.value } : r)))
                    }
                  />
                  <Input
                    placeholder="Event label"
                    value={ev.label}
                    onChange={(e) =>
                      setEvents((rows) => rows.map((r) => (r.id === ev.id ? { ...r, label: e.target.value } : r)))
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove event"
                    onClick={() => setEvents((rows) => rows.filter((r) => r.id !== ev.id))}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setEvents((rows) => [...rows, { id: crypto.randomUUID(), date: '', label: '' }])
                }
              >
                <Plus size={14} />
                Add Event
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-extrabold text-text-primary">{preview.name}</p>
              <p className="text-xs text-text-secondary">
                {GOAL_LABELS[preview.primaryGoal]} · starts{' '}
                <span className="font-mono">{formatFull(allPlanPhases(preview)[0]?.startDate ?? new Date())}</span>
                {' '}· <span className="font-mono">{daysPerWeek}</span> days/wk
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={regenerate}>
              <RefreshCw size={14} />
              Regenerate
            </Button>
          </div>

          <MiniGantt plan={preview} />

          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-surface-alt text-left">
                  <th className="section-label px-3 py-2">Phase</th>
                  <th className="section-label px-3 py-2">Type</th>
                  <th className="section-label px-3 py-2">Dates</th>
                  <th className="section-label px-3 py-2 text-right">Weeks</th>
                  <th className="section-label px-3 py-2">Volume</th>
                  <th className="section-label px-3 py-2">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {allPlanPhases(preview).map((ph) => (
                  <tr key={ph.id} className="border-t border-border">
                    <td className="px-3 py-1.5 font-semibold text-text-primary">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-sm"
                          style={{ backgroundColor: PHASE_COLORS[ph.type] }}
                        />
                        {ph.name}
                      </span>
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge color={phaseTypeColor(ph.type)}>{PHASE_LABELS[ph.type]}</Badge>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-text-secondary">
                      {formatShort(ph.startDate)} – {formatShort(ph.endDate)}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-right text-text-primary">{ph.durationWeeks}</td>
                    <td className="px-3 py-1.5 text-text-secondary">{VOLUME_LABELS[ph.targetVolumeLevel]}</td>
                    <td className="px-3 py-1.5 text-text-secondary">{INTENSITY_LABELS[ph.targetIntensityLevel]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {previewTemplates.length > 0 && (
            <div>
              <p className="section-label mb-1.5">
                Workout Templates ({previewTemplates.length})
              </p>
              <p className="text-xs text-text-secondary mb-2">
                Created automatically and linked to your planned sessions. Edit them later in Workouts.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {previewTemplates.map((t) => (
                  <span
                    key={t.id}
                    className="px-2 py-1 rounded-sm border border-border bg-surface-alt text-xs font-semibold text-text-secondary"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-border">
        <Button variant="ghost" onClick={step === 1 ? close : () => setStep((s) => s - 1)}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 3 ? (
          <Button onClick={goNext}>Next</Button>
        ) : (
          <Button onClick={accept} disabled={!preview}>
            Accept Plan
          </Button>
        )}
      </div>
    </Modal>
  );
}
