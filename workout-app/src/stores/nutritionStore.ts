import { create } from 'zustand';
import { getAll, put, deleteById, getDB } from '../db';
import {
  DEFAULT_NUTRITION_PREFS,
  type FoodItem, type NutritionLogEntry, type NutritionPreferences, type NutritionProfile,
} from '../types';

interface NutritionState {
  foods: FoodItem[];
  logs: NutritionLogEntry[];
  profile: NutritionProfile | null;
  preferences: NutritionPreferences;
  loaded: boolean;
  load: () => Promise<void>;
  saveProfile: (profile: NutritionProfile) => Promise<void>;
  savePreferences: (prefs: NutritionPreferences) => Promise<void>;
  addFood: (food: FoodItem) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  saveLog: (entry: NutritionLogEntry) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

export const useNutritionStore = create<NutritionState>((set) => ({
  foods: [],
  logs: [],
  profile: null,
  preferences: DEFAULT_NUTRITION_PREFS,
  loaded: false,
  load: async () => {
    const [foods, logs] = await Promise.all([
      getAll<FoodItem>('foods'),
      getAll<NutritionLogEntry>('nutrition_logs'),
    ]);
    foods.sort((a, b) => a.name.localeCompare(b.name));
    logs.sort((a, b) => b.date.getTime() - a.date.getTime());
    const db = await getDB();
    const profile = ((await db.get('settings', 'nutritionProfile')) as NutritionProfile | undefined) ?? null;
    const preferences =
      ((await db.get('settings', 'nutritionPrefs')) as NutritionPreferences | undefined) ?? DEFAULT_NUTRITION_PREFS;
    set({ foods, logs, profile, preferences, loaded: true });
  },
  saveProfile: async (profile) => {
    set({ profile });
    const db = await getDB();
    await db.put('settings', profile, 'nutritionProfile');
  },
  savePreferences: async (preferences) => {
    set({ preferences });
    const db = await getDB();
    await db.put('settings', preferences, 'nutritionPrefs');
  },
  addFood: async (food) => {
    await put('foods', food, food.id);
    set((s) => ({
      foods: [...s.foods.filter((f) => f.id !== food.id), food].sort((a, b) => a.name.localeCompare(b.name)),
    }));
  },
  removeFood: async (id) => {
    await deleteById('foods', id);
    set((s) => ({ foods: s.foods.filter((f) => f.id !== id) }));
  },
  saveLog: async (entry) => {
    await put('nutrition_logs', entry, entry.id);
    set((s) => ({
      logs: [...s.logs.filter((l) => l.id !== entry.id), entry].sort((a, b) => b.date.getTime() - a.date.getTime()),
    }));
  },
  removeLog: async (id) => {
    await deleteById('nutrition_logs', id);
    set((s) => ({ logs: s.logs.filter((l) => l.id !== id) }));
  },
}));
