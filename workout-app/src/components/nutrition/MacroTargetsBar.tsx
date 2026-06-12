import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ProfileForm } from './ProfileSetup';
import { mifflinStJeorBMR, tdee, macroTargets, GOAL_LABELS_NUTRITION } from '../../utils/nutritionCalc';
import type { NutritionProfile } from '../../types';

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="min-w-0">
      <p className="section-label mb-0.5">{label}</p>
      <p className="font-mono text-base font-bold text-text-primary leading-tight">
        {value.toLocaleString()}
        <span className="text-[10px] text-text-secondary ml-1">{unit}</span>
      </p>
    </div>
  );
}

export function MacroTargetsBar({ profile }: { profile: NutritionProfile }) {
  const [editOpen, setEditOpen] = useState(false);
  const targets = macroTargets(profile);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <Stat label="BMR" value={mifflinStJeorBMR(profile)} unit="kcal" />
        <Stat label="TDEE" value={tdee(profile)} unit="kcal" />
        <div className="h-8 w-px bg-border hidden sm:block" />
        <Stat label="Target Cals" value={targets.calories} unit="kcal" />
        <Stat label="Protein" value={targets.proteinG} unit="g" />
        <Stat label="Carbs" value={targets.carbsG} unit="g" />
        <Stat label="Fat" value={targets.fatG} unit="g" />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-text-secondary hidden md:inline">
            {GOAL_LABELS_NUTRITION[profile.goal]}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil size={12} /> Edit
          </Button>
        </div>
      </div>
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Nutrition Profile">
        <ProfileForm initial={profile} onSaved={() => setEditOpen(false)} />
      </Modal>
    </Card>
  );
}
