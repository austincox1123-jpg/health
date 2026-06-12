import { useState } from 'react';
import type {
  Equipment,
  Exercise,
  ExerciseCategory,
  Modality,
  MovementPattern,
  MuscleGroup,
} from '../../types';
import { useExerciseStore } from '../../stores/exerciseStore';
import { toast } from '../../stores/toastStore';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import {
  CATEGORIES,
  EQUIPMENT_OPTIONS,
  formatLabel,
  MODALITIES,
  MOVEMENT_PATTERNS,
  MUSCLE_GROUPS,
  toOptions,
} from './labels';

interface ToggleBadgeGroupProps<T extends string> {
  label: string;
  values: readonly T[];
  selected: T[];
  onToggle: (value: T) => void;
}

function ToggleBadgeGroup<T extends string>({ label, values, selected, onToggle }: ToggleBadgeGroupProps<T>) {
  return (
    <div>
      <span className="section-label block mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const active = selected.includes(v);
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(v)}
              className={`px-1.5 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-label transition-colors ${
                active
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'bg-surface-alt text-text-secondary border-border hover:text-text-primary'
              }`}
            >
              {formatLabel(v)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface CustomExerciseModalProps {
  open: boolean;
  onClose: () => void;
}

export function CustomExerciseModal({ open, onClose }: CustomExerciseModalProps) {
  const addCustom = useExerciseStore((s) => s.addCustom);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('chest');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>('horizontal_push');
  const [modality, setModality] = useState<Modality>('strength');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName('');
    setCategory('chest');
    setMuscleGroups([]);
    setEquipment([]);
    setMovementPattern('horizontal_push');
    setModality('strength');
    setInstructions('');
  };

  const valid = name.trim().length > 0 && muscleGroups.length > 0 && equipment.length > 0;

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      const exercise: Exercise = {
        id: `custom-${crypto.randomUUID()}`,
        name: name.trim(),
        category,
        muscleGroups,
        secondaryMuscles: [],
        equipment,
        movementPattern,
        modality,
        instructions: instructions
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0),
        tips: [],
        isCustom: true,
        createdAt: new Date(),
      };
      await addCustom(exercise);
      toast('success', `Added "${exercise.name}" to the library`);
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Custom Exercise">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
      >
        <Input
          label="Name"
          placeholder="e.g. Deficit Bulgarian Split Squat"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            options={toOptions(CATEGORIES)}
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
          />
          <Select
            label="Modality"
            options={toOptions(MODALITIES)}
            value={modality}
            onChange={(e) => setModality(e.target.value as Modality)}
          />
        </div>
        <Select
          label="Movement Pattern"
          options={toOptions(MOVEMENT_PATTERNS)}
          value={movementPattern}
          onChange={(e) => setMovementPattern(e.target.value as MovementPattern)}
        />
        <ToggleBadgeGroup
          label="Primary Muscles"
          values={MUSCLE_GROUPS}
          selected={muscleGroups}
          onToggle={(m) => setMuscleGroups((prev) => toggleInList(prev, m))}
        />
        <ToggleBadgeGroup
          label="Equipment"
          values={EQUIPMENT_OPTIONS}
          selected={equipment}
          onToggle={(eq) => setEquipment((prev) => toggleInList(prev, eq))}
        />
        <Textarea
          label="Instructions (one step per line)"
          placeholder={'Set up with feet shoulder-width apart\nBrace your core\nDrive through mid-foot'}
          rows={5}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!valid || saving}>
            {saving ? 'Saving…' : 'Save Exercise'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
