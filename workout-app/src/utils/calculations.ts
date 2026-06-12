import type { CompletedSet, CompletedWorkout } from '../types';

// 1RM Estimation (Epley)
export function estimateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export function calculateVolume(sets: CompletedSet[]): number {
  return sets.reduce((acc, set) => {
    if (set.weight && set.reps) return acc + set.weight * set.reps;
    return acc;
  }, 0);
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.4536 * 10) / 10;
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}

export function getPhaseDurationWeeks(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

export function getCompliancePercent(planned: number, completed: number): number {
  if (planned === 0) return 100;
  return Math.round((completed / planned) * 100);
}

export function workoutTotalSets(workout: CompletedWorkout): number {
  return workout.exerciseBlocks.reduce(
    (acc, block) => acc + block.exercises.reduce((a, ex) => a + ex.sets.length, 0),
    0,
  );
}

export function formatWeight(lbsValue: number, unit: 'lbs' | 'kg'): string {
  return unit === 'kg' ? `${lbsToKg(lbsValue)} kg` : `${Math.round(lbsValue).toLocaleString()} lbs`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function computeBMI(weightLbs: number, heightInches: number): number {
  return Math.round(((weightLbs * 703) / (heightInches * heightInches)) * 10) / 10;
}

export function estimateLeanMass(weightLbs: number, bodyFatPercent: number): number {
  return Math.round(weightLbs * (1 - bodyFatPercent / 100) * 10) / 10;
}

export function rpeToRir(rpe: number): number {
  return Math.max(0, 10 - rpe);
}
