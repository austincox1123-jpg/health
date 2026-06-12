import { create } from 'zustand';
import { getAll, put, deleteById, seedIfEmpty } from '../db';
import type { Exercise } from '../types';

interface ExerciseState {
  exercises: Exercise[];
  loaded: boolean;
  load: () => Promise<void>;
  addCustom: (exercise: Exercise) => Promise<void>;
  remove: (id: string) => Promise<void>;
  byId: (id: string) => Exercise | undefined;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loaded: false,
  load: async () => {
    await seedIfEmpty();
    const exercises = await getAll<Exercise>('exercises');
    exercises.sort((a, b) => a.name.localeCompare(b.name));
    set({ exercises, loaded: true });
  },
  addCustom: async (exercise) => {
    await put('exercises', exercise, exercise.id);
    set((s) => ({
      exercises: [...s.exercises, exercise].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },
  remove: async (id) => {
    await deleteById('exercises', id);
    set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) }));
  },
  byId: (id) => get().exercises.find((e) => e.id === id),
}));
