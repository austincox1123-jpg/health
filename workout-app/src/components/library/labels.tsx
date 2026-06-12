import type {
  Equipment,
  ExerciseCategory,
  Modality,
  MovementPattern,
  MuscleGroup,
} from '../../types';

/** "horizontal_push" -> "Horizontal Push" */
export function formatLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export const CATEGORIES: ExerciseCategory[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms', 'core',
  'quads', 'hamstrings', 'glutes', 'calves', 'full_body', 'cardio', 'olympic',
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'pectorals', 'lats', 'rhomboids', 'trapezius', 'deltoids', 'biceps',
  'triceps', 'forearms', 'abs', 'obliques', 'erector_spinae', 'glutes',
  'quads', 'hamstrings', 'calves', 'hip_flexors', 'adductors', 'abductors',
];

export const EQUIPMENT_OPTIONS: Equipment[] = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'smith_machine',
  'bodyweight', 'resistance_band', 'trx', 'pull_up_bar', 'bench', 'box',
  'cardio_machine',
];

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull',
  'squat', 'hinge', 'lunge', 'carry', 'rotation', 'core_stability',
  'olympic', 'plyometric', 'cardio', 'isolation',
];

export const MODALITIES: Modality[] = ['strength', 'cardio', 'mobility', 'plyometric'];

export function toOptions(values: readonly string[]): { value: string; label: string }[] {
  return values.map((v) => ({ value: v, label: formatLabel(v) }));
}
