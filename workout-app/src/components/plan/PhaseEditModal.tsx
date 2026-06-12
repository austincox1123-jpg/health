import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { usePlanStore } from '../../stores/planStore';
import { toast } from '../../stores/toastStore';
import { getPhaseDurationWeeks } from '../../utils/calculations';
import {
  PHASE_TYPE_OPTIONS,
  VOLUME_OPTIONS,
  INTENSITY_OPTIONS,
  updatePhaseInPlan,
  removePhaseFromPlan,
  toDateInput,
  fromDateInput,
} from './planShared';
import type { AnnualPlan, IntensityLevel, Phase, PhaseType, VolumeLevel } from '../../types';

interface PhaseEditModalProps {
  plan: AnnualPlan;
  phase: Phase | null;
  onClose: () => void;
}

interface PhaseForm {
  name: string;
  type: PhaseType;
  startDate: string;
  endDate: string;
  volume: VolumeLevel;
  intensity: IntensityLevel;
  weeklyTargetSessions: string;
  notes: string;
}

export function PhaseEditModal({ plan, phase, onClose }: PhaseEditModalProps) {
  const savePlan = usePlanStore((s) => s.savePlan);
  const [form, setForm] = useState<PhaseForm | null>(null);

  useEffect(() => {
    if (!phase) {
      setForm(null);
      return;
    }
    setForm({
      name: phase.name,
      type: phase.type,
      startDate: toDateInput(phase.startDate),
      endDate: toDateInput(phase.endDate),
      volume: phase.targetVolumeLevel,
      intensity: phase.targetIntensityLevel,
      weeklyTargetSessions: String(phase.weeklyTargetSessions),
      notes: phase.notes,
    });
  }, [phase]);

  if (!phase || !form) return null;

  const patch = (p: Partial<PhaseForm>) => setForm((f) => (f ? { ...f, ...p } : f));

  const start = fromDateInput(form.startDate);
  const end = fromDateInput(form.endDate);
  const validDates =
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end.getTime() > start.getTime();
  const durationWeeks = validDates ? Math.max(1, getPhaseDurationWeeks(start, end)) : phase.durationWeeks;

  const handleSave = async () => {
    if (!validDates) {
      toast('error', 'End date must be after start date');
      return;
    }
    const updated: Phase = {
      ...phase,
      name: form.name.trim() || phase.name,
      type: form.type,
      startDate: start,
      endDate: end,
      durationWeeks,
      targetVolumeLevel: form.volume,
      targetIntensityLevel: form.intensity,
      weeklyTargetSessions: Math.max(0, Math.min(7, Number(form.weeklyTargetSessions) || 0)),
      notes: form.notes,
    };
    await savePlan(updatePhaseInPlan(plan, updated));
    toast('success', 'Phase saved');
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete phase "${phase.name}"? Its planned weeks will be removed.`)) return;
    await savePlan(removePhaseFromPlan(plan, phase.id));
    toast('info', 'Phase deleted');
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Edit Phase">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Name" value={form.name} onChange={(e) => patch({ name: e.target.value })} />
          <Select
            label="Phase Type"
            value={form.type}
            options={PHASE_TYPE_OPTIONS}
            onChange={(e) => patch({ type: e.target.value as PhaseType })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            mono
            value={form.startDate}
            onChange={(e) => patch({ startDate: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            mono
            value={form.endDate}
            onChange={(e) => patch({ endDate: e.target.value })}
          />
        </div>
        <p className="text-xs text-text-secondary -mt-2">
          Duration: <span className="font-mono text-text-primary">{durationWeeks} wk</span>
          {!validDates && <span className="text-danger ml-2">End date must be after start date</span>}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Volume Level"
            value={form.volume}
            options={VOLUME_OPTIONS}
            onChange={(e) => patch({ volume: e.target.value as VolumeLevel })}
          />
          <Select
            label="Intensity Level"
            value={form.intensity}
            options={INTENSITY_OPTIONS}
            onChange={(e) => patch({ intensity: e.target.value as IntensityLevel })}
          />
        </div>

        <Input
          label="Weekly Target Sessions"
          type="number"
          mono
          min={0}
          max={7}
          value={form.weeklyTargetSessions}
          onChange={(e) => patch({ weeklyTargetSessions: e.target.value })}
        />

        <Textarea label="Notes" value={form.notes} onChange={(e) => patch({ notes: e.target.value })} />

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 size={14} />
            Delete Phase
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Phase</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
