import { create } from 'zustand';
import { getAll, put, deleteById } from '../db';
import type { WorkoutTemplate, CompletedWorkout, PersonalRecord } from '../types';

interface WorkoutState {
  templates: WorkoutTemplate[];
  completed: CompletedWorkout[];
  personalRecords: PersonalRecord[];
  loaded: boolean;
  load: () => Promise<void>;
  saveTemplate: (template: WorkoutTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  saveCompleted: (workout: CompletedWorkout) => Promise<void>;
  deleteCompleted: (id: string) => Promise<void>;
  savePR: (pr: PersonalRecord) => Promise<void>;
  /** Best estimated 1RM logged for an exercise before a given date (exclusive). */
  bestOneRepMax: (exerciseId: string, before?: Date) => number;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  templates: [],
  completed: [],
  personalRecords: [],
  loaded: false,
  load: async () => {
    const [templates, completed, personalRecords] = await Promise.all([
      getAll<WorkoutTemplate>('workout_templates'),
      getAll<CompletedWorkout>('completed_workouts'),
      getAll<PersonalRecord>('personal_records'),
    ]);
    completed.sort((a, b) => b.date.getTime() - a.date.getTime());
    templates.sort((a, b) => a.name.localeCompare(b.name));
    personalRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
    set({ templates, completed, personalRecords, loaded: true });
  },
  saveTemplate: async (template) => {
    await put('workout_templates', template, template.id);
    set((s) => ({
      templates: [...s.templates.filter((t) => t.id !== template.id), template].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
  },
  deleteTemplate: async (id) => {
    await deleteById('workout_templates', id);
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }));
  },
  saveCompleted: async (workout) => {
    await put('completed_workouts', workout, workout.id);
    set((s) => ({
      completed: [...s.completed.filter((w) => w.id !== workout.id), workout].sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      ),
    }));
  },
  deleteCompleted: async (id) => {
    await deleteById('completed_workouts', id);
    set((s) => ({ completed: s.completed.filter((w) => w.id !== id) }));
  },
  savePR: async (pr) => {
    await put('personal_records', pr, pr.id);
    set((s) => ({
      personalRecords: [pr, ...s.personalRecords.filter((p) => p.id !== pr.id)].sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
      ),
    }));
  },
  bestOneRepMax: (exerciseId, before) => {
    let best = 0;
    for (const w of get().completed) {
      if (before && w.date.getTime() >= before.getTime()) continue;
      for (const block of w.exerciseBlocks) {
        for (const ex of block.exercises) {
          if (ex.exerciseId !== exerciseId) continue;
          for (const s of ex.sets) {
            if (s.estimatedOneRepMax && s.estimatedOneRepMax > best) best = s.estimatedOneRepMax;
          }
        }
      }
    }
    return best;
  },
}));
