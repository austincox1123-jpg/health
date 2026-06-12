import { useState } from 'react';
import { CalendarRange, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { Card } from '../components/ui/Card';
import { usePlanStore } from '../stores/planStore';
import { toast } from '../stores/toastStore';
import { formatShort } from '../utils/dates';
import { PlanSummaryStrip } from '../components/plan/PlanSummaryStrip';
import { AnnualGantt } from '../components/plan/AnnualGantt';
import { QuarterView } from '../components/plan/QuarterView';
import { WeekView } from '../components/plan/WeekView';
import { PhaseEditModal } from '../components/plan/PhaseEditModal';
import { GoalWizard } from '../components/plan/GoalWizard';
import type { Phase, WeekPlan } from '../types';

type View =
  | { kind: 'annual' }
  | { kind: 'quarter'; quarterId: string }
  | { kind: 'week'; phaseId: string; weekId: string };

export function PlanPage() {
  const plans = usePlanStore((s) => s.plans);
  const activePlanId = usePlanStore((s) => s.activePlanId);
  const setActivePlan = usePlanStore((s) => s.setActivePlan);
  const deletePlan = usePlanStore((s) => s.deletePlan);

  const [view, setView] = useState<View>({ kind: 'annual' });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);

  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];

  if (!plan) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-extrabold text-text-primary">Periodization</h1>
        <Card padded={false}>
          <EmptyState
            icon={CalendarRange}
            headline="No annual plan yet"
            description="Build a periodized year of training around your primary goal — phases, weekly micro-cycles, and session targets."
            action={
              <Button onClick={() => setWizardOpen(true)}>
                <Plus size={16} />
                New Annual Plan
              </Button>
            }
          />
        </Card>
        <GoalWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
      </div>
    );
  }

  // Resolve view targets against the current plan, falling back gracefully
  // when the referenced quarter/phase/week no longer exists.
  const quarter =
    view.kind === 'quarter' ? plan.quarters.find((q) => q.id === view.quarterId) : undefined;
  let weekTarget: { phase: Phase; week: WeekPlan } | undefined;
  if (view.kind === 'week') {
    for (const q of plan.quarters) {
      for (const ph of q.phases) {
        if (ph.id !== view.phaseId) continue;
        const w = ph.weeks.find((wk) => wk.id === view.weekId);
        if (w) weekTarget = { phase: ph, week: w };
      }
    }
  }
  const effectiveView: View =
    (view.kind === 'quarter' && !quarter) || (view.kind === 'week' && !weekTarget)
      ? { kind: 'annual' }
      : view;

  const editingPhase = editingPhaseId
    ? plan.quarters.flatMap((q) => q.phases).find((ph) => ph.id === editingPhaseId) ?? null
    : null;

  const weekQuarter = weekTarget
    ? plan.quarters.find((q) => q.id === weekTarget!.phase.quarterId)
    : undefined;

  const handleDeletePlan = async () => {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;
    await deletePlan(plan.id);
    const remaining = plans.filter((p) => p.id !== plan.id);
    await setActivePlan(remaining[0]?.id ?? null);
    setView({ kind: 'annual' });
    toast('info', 'Plan deleted');
  };

  const crumb = (label: string, onClick?: () => void, key?: string) => (
    <span key={key ?? label} className="flex items-center gap-1.5">
      {onClick ? (
        <button
          onClick={onClick}
          className="text-xs font-bold uppercase tracking-label text-text-secondary hover:text-accent transition-colors"
        >
          {label}
        </button>
      ) : (
        <span className="text-xs font-bold uppercase tracking-label text-text-primary">{label}</span>
      )}
    </span>
  );

  const breadcrumbs: React.ReactNode[] = [];
  if (effectiveView.kind === 'annual') {
    breadcrumbs.push(crumb('Annual', undefined, 'annual'));
  } else {
    breadcrumbs.push(crumb('Annual', () => setView({ kind: 'annual' }), 'annual'));
    if (effectiveView.kind === 'quarter' && quarter) {
      breadcrumbs.push(crumb(quarter.label, undefined, 'quarter'));
    }
    if (effectiveView.kind === 'week' && weekTarget) {
      if (weekQuarter) {
        breadcrumbs.push(
          crumb(weekQuarter.label, () => setView({ kind: 'quarter', quarterId: weekQuarter.id }), 'quarter'),
        );
      }
      breadcrumbs.push(crumb(`Week of ${formatShort(weekTarget.week.startDate)}`, undefined, 'week'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-extrabold text-text-primary mr-auto">Periodization</h1>
        {plans.length > 1 && (
          <Select
            className="w-56"
            value={plan.id}
            options={plans.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(e) => {
              void setActivePlan(e.target.value);
              setView({ kind: 'annual' });
            }}
            aria-label="Select plan"
          />
        )}
        <Button variant="secondary" size="sm" onClick={() => setWizardOpen(true)}>
          <Plus size={14} />
          New Annual Plan
        </Button>
        <Button variant="danger" size="sm" onClick={handleDeletePlan} aria-label="Delete plan">
          <Trash2 size={14} />
        </Button>
      </div>

      <PlanSummaryStrip plan={plan} />

      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex items-center gap-1.5 mr-auto" aria-label="Plan breadcrumb">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={12} className="text-text-muted" />}
              {c}
            </span>
          ))}
        </nav>
        {effectiveView.kind === 'quarter' && quarter && (
          <Tabs
            tabs={plan.quarters.map((q) => ({ value: q.id, label: `Q${q.quarterNumber}` }))}
            active={quarter.id}
            onChange={(quarterId) => setView({ kind: 'quarter', quarterId })}
          />
        )}
      </div>

      {effectiveView.kind === 'annual' && (
        <AnnualGantt
          plan={plan}
          onPhaseClick={(ph) => setEditingPhaseId(ph.id)}
          onQuarterSelect={(q) => setView({ kind: 'quarter', quarterId: q.id })}
        />
      )}

      {effectiveView.kind === 'quarter' && quarter && (
        <QuarterView
          quarter={quarter}
          onEditPhase={(ph) => setEditingPhaseId(ph.id)}
          onWeekSelect={(ph, wk) => setView({ kind: 'week', phaseId: ph.id, weekId: wk.id })}
        />
      )}

      {effectiveView.kind === 'week' && weekTarget && (
        <WeekView plan={plan} phase={weekTarget.phase} week={weekTarget.week} />
      )}

      <PhaseEditModal plan={plan} phase={editingPhase} onClose={() => setEditingPhaseId(null)} />
      <GoalWizard open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
