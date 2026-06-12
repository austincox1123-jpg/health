import { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Tabs } from '../ui/Tabs';
import { useNutritionStore } from '../../stores/nutritionStore';
import { useMetricsStore } from '../../stores/metricsStore';
import { toast } from '../../stores/toastStore';
import { ACTIVITY_LABELS, GOAL_LABELS_NUTRITION } from '../../utils/nutritionCalc';
import type { ActivityLevel, NutritionGoal, NutritionProfile } from '../../types';

const ACTIVITY_OPTIONS = (Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(
  ([value, label]) => ({ value, label }),
);

const PROTEIN_TABS = [
  { value: '0.7', label: '0.7' },
  { value: '0.8', label: '0.8' },
  { value: '1.0', label: '1.0' },
  { value: '1.2', label: '1.2' },
];

const GOAL_TABS = (Object.entries(GOAL_LABELS_NUTRITION) as [NutritionGoal, string][]).map(
  ([value, label]) => ({ value, label }),
);

function proteinTabValue(perLb: number): string {
  return PROTEIN_TABS.find((t) => Number(t.value) === perLb)?.value ?? '0.8';
}

interface ProfileFormProps {
  initial: NutritionProfile | null;
  /** Prefill for weight when creating a profile (latest body metrics). */
  defaultWeightLbs?: number;
  onSaved?: () => void;
}

export function ProfileForm({ initial, defaultWeightLbs, onSaved }: ProfileFormProps) {
  const saveProfile = useNutritionStore((s) => s.saveProfile);

  const [sex, setSex] = useState<'male' | 'female'>(initial?.sex ?? 'male');
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [height, setHeight] = useState(initial ? String(initial.heightInches) : '');
  const [weight, setWeight] = useState(
    initial ? String(initial.weightLbs) : defaultWeightLbs ? String(defaultWeightLbs) : '',
  );
  const [activity, setActivity] = useState<ActivityLevel>(initial?.activityLevel ?? 'moderate');
  const [goal, setGoal] = useState<NutritionGoal>(initial?.goal ?? 'maintain');
  const [proteinPerLb, setProteinPerLb] = useState(proteinTabValue(initial?.proteinPerLb ?? 0.8));

  const ageN = Number(age);
  const heightN = Number(height);
  const weightN = Number(weight);
  const valid =
    Number.isFinite(ageN) && ageN > 0 &&
    Number.isFinite(heightN) && heightN > 0 &&
    Number.isFinite(weightN) && weightN > 0;

  const handleSave = async () => {
    if (!valid) return;
    await saveProfile({
      sex,
      age: Math.round(ageN),
      heightInches: heightN,
      weightLbs: weightN,
      activityLevel: activity,
      goal,
      proteinPerLb: Number(proteinPerLb),
    });
    toast('success', 'Nutrition profile saved');
    onSaved?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="section-label block mb-1.5">Sex</span>
        <Tabs<'male' | 'female'>
          tabs={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]}
          active={sex}
          onChange={setSex}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input label="Age" mono type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} />
        <Input
          label="Height (in)"
          mono
          type="number"
          min={1}
          step={0.5}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
        <Input
          label="Weight (lbs)"
          mono
          type="number"
          min={1}
          step={0.1}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <Select
        label="Activity Level"
        options={ACTIVITY_OPTIONS}
        value={activity}
        onChange={(e) => setActivity(e.target.value as ActivityLevel)}
      />
      <div>
        <span className="section-label block mb-1.5">Goal</span>
        <Tabs<NutritionGoal> tabs={GOAL_TABS} active={goal} onChange={setGoal} />
      </div>
      <div>
        <span className="section-label block mb-1.5">Protein (g per lb bodyweight)</span>
        <Tabs tabs={PROTEIN_TABS} active={proteinPerLb} onChange={setProteinPerLb} />
      </div>
      <div className="flex justify-end pt-1">
        <Button disabled={!valid} onClick={handleSave}>
          Save Profile
        </Button>
      </div>
    </div>
  );
}

/** Full-card first-run setup shown when no profile exists yet. */
export function ProfileSetup() {
  const metrics = useMetricsStore((s) => s.metrics);
  // metrics are sorted ascending by date — take the latest entry with a weight.
  const latestWeight = [...metrics].reverse().find((m) => m.weight && m.weight > 0)?.weight;

  return (
    <Card className="max-w-2xl">
      <CardHeader title="Set Up Nutrition Profile" />
      <p className="text-sm text-text-secondary mb-4">
        Targets are computed locally with the Mifflin-St Jeor equation — calories from your goal,
        protein from bodyweight, fat at 25% of calories, the rest to carbs.
      </p>
      <ProfileForm initial={null} defaultWeightLbs={latestWeight} />
    </Card>
  );
}
