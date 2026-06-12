import type { GoalType, PhaseType, VolumeLevel, IntensityLevel } from '../types';

export interface PhaseTemplate {
  name: string;
  type: PhaseType;
  durationWeeks: number;
  targetVolumeLevel: VolumeLevel;
  targetIntensityLevel: IntensityLevel;
}

export const PHASE_COLORS: Record<PhaseType, string> = {
  base: '#3B82F6',
  build: '#8B5CF6',
  hypertrophy: '#8B5CF6',
  strength: '#F97316',
  peak: '#EF4444',
  power: '#EF4444',
  taper: '#EAB308',
  deload: '#22C55E',
  active_recovery: '#22C55E',
  custom: '#94A3B8',
};

export const GOAL_LABELS: Record<GoalType, string> = {
  fat_loss: 'Fat Loss',
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  endurance: 'Endurance',
  athletic_performance: 'Athletic Performance',
  general_fitness: 'General Fitness',
  power: 'Power',
  custom: 'Custom',
};

export const PHASE_LABELS: Record<PhaseType, string> = {
  base: 'Base',
  build: 'Build',
  hypertrophy: 'Hypertrophy',
  strength: 'Strength',
  peak: 'Peak',
  power: 'Power',
  taper: 'Taper',
  deload: 'Deload',
  active_recovery: 'Active Recovery',
  custom: 'Custom',
};

/**
 * Suggested phase sequences per goal. Sequences shorter than a year are
 * repeated until the 52-week calendar is filled.
 */
export const phaseTemplates: Record<GoalType, PhaseTemplate[]> = {
  fat_loss: [
    { name: 'Base', type: 'base', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Build', type: 'build', durationWeeks: 6, targetVolumeLevel: 'high', targetIntensityLevel: 'moderate' },
    { name: 'Deficit', type: 'custom', durationWeeks: 8, targetVolumeLevel: 'high', targetIntensityLevel: 'high' },
    { name: 'Maintenance', type: 'active_recovery', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'low' },
  ],
  strength: [
    { name: 'Base', type: 'base', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Hypertrophy', type: 'hypertrophy', durationWeeks: 6, targetVolumeLevel: 'very_high', targetIntensityLevel: 'moderate' },
    { name: 'Strength', type: 'strength', durationWeeks: 6, targetVolumeLevel: 'high', targetIntensityLevel: 'high' },
    { name: 'Peak', type: 'peak', durationWeeks: 3, targetVolumeLevel: 'low', targetIntensityLevel: 'maximal' },
    { name: 'Deload', type: 'deload', durationWeeks: 1, targetVolumeLevel: 'low', targetIntensityLevel: 'low' },
  ],
  hypertrophy: [
    { name: 'Base', type: 'base', durationWeeks: 3, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Hypertrophy', type: 'hypertrophy', durationWeeks: 8, targetVolumeLevel: 'very_high', targetIntensityLevel: 'moderate' },
    { name: 'Strength', type: 'strength', durationWeeks: 4, targetVolumeLevel: 'high', targetIntensityLevel: 'high' },
    { name: 'Deload', type: 'deload', durationWeeks: 1, targetVolumeLevel: 'low', targetIntensityLevel: 'low' },
  ],
  endurance: [
    { name: 'Base', type: 'base', durationWeeks: 6, targetVolumeLevel: 'moderate', targetIntensityLevel: 'low' },
    { name: 'Build', type: 'build', durationWeeks: 8, targetVolumeLevel: 'high', targetIntensityLevel: 'moderate' },
    { name: 'Peak', type: 'peak', durationWeeks: 4, targetVolumeLevel: 'very_high', targetIntensityLevel: 'high' },
    { name: 'Taper', type: 'taper', durationWeeks: 2, targetVolumeLevel: 'low', targetIntensityLevel: 'moderate' },
  ],
  athletic_performance: [
    { name: 'Base', type: 'base', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Build', type: 'build', durationWeeks: 4, targetVolumeLevel: 'high', targetIntensityLevel: 'moderate' },
    { name: 'Power', type: 'power', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'high' },
    { name: 'Peak', type: 'peak', durationWeeks: 3, targetVolumeLevel: 'low', targetIntensityLevel: 'maximal' },
    { name: 'Taper', type: 'taper', durationWeeks: 1, targetVolumeLevel: 'low', targetIntensityLevel: 'low' },
  ],
  general_fitness: [
    { name: 'Base', type: 'base', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Build', type: 'build', durationWeeks: 4, targetVolumeLevel: 'high', targetIntensityLevel: 'moderate' },
    { name: 'Deload', type: 'deload', durationWeeks: 1, targetVolumeLevel: 'low', targetIntensityLevel: 'low' },
  ],
  power: [
    { name: 'Base', type: 'base', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Strength', type: 'strength', durationWeeks: 5, targetVolumeLevel: 'high', targetIntensityLevel: 'high' },
    { name: 'Power', type: 'power', durationWeeks: 5, targetVolumeLevel: 'moderate', targetIntensityLevel: 'maximal' },
    { name: 'Deload', type: 'deload', durationWeeks: 1, targetVolumeLevel: 'low', targetIntensityLevel: 'low' },
  ],
  custom: [
    { name: 'Base', type: 'base', durationWeeks: 4, targetVolumeLevel: 'moderate', targetIntensityLevel: 'moderate' },
    { name: 'Build', type: 'build', durationWeeks: 6, targetVolumeLevel: 'high', targetIntensityLevel: 'moderate' },
    { name: 'Deload', type: 'deload', durationWeeks: 1, targetVolumeLevel: 'low', targetIntensityLevel: 'low' },
  ],
};
