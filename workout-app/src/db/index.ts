import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  AnnualPlan, QuarterBlock, Phase, WeekPlan, PlannedSession,
  WorkoutTemplate, CompletedWorkout, Exercise, BodyMetrics, PersonalRecord,
} from '../types';
import { exerciseLibrary } from '../data/exerciseLibrary';

interface WorkoutAppDB extends DBSchema {
  annual_plans: { key: string; value: AnnualPlan };
  quarter_blocks: { key: string; value: QuarterBlock };
  phases: { key: string; value: Phase };
  week_plans: { key: string; value: WeekPlan };
  planned_sessions: { key: string; value: PlannedSession };
  workout_templates: { key: string; value: WorkoutTemplate };
  completed_workouts: { key: string; value: CompletedWorkout };
  exercises: { key: string; value: Exercise };
  body_metrics: { key: string; value: BodyMetrics };
  personal_records: { key: string; value: PersonalRecord };
  settings: { key: string; value: unknown };
}

const STORE_NAMES = [
  'annual_plans', 'quarter_blocks', 'phases', 'week_plans', 'planned_sessions',
  'workout_templates', 'completed_workouts', 'exercises', 'body_metrics',
  'personal_records', 'settings',
] as const;

export type StoreName = (typeof STORE_NAMES)[number];

/**
 * idb's DBSchema carries a string index signature, which makes its typed
 * methods reject our StoreName union — the generic helpers below go through
 * an untyped view instead.
 */
async function getRawDB(): Promise<IDBPDatabase> {
  return (await getDB()) as unknown as IDBPDatabase;
}

let dbPromise: Promise<IDBPDatabase<WorkoutAppDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<WorkoutAppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<WorkoutAppDB>('workout-app', 1, {
      upgrade(db) {
        for (const name of STORE_NAMES) {
          if (!db.objectStoreNames.contains(name)) {
            db.createObjectStore(name);
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await getRawDB();
  return (await db.getAll(store)) as T[];
}

export async function getById<T>(store: StoreName, id: string): Promise<T | undefined> {
  const db = await getRawDB();
  return (await db.get(store, id)) as T | undefined;
}

export async function put<T>(store: StoreName, value: T, key: string): Promise<void> {
  const db = await getRawDB();
  await db.put(store, value as never, key);
}

export async function putMany<T extends { id: string }>(store: StoreName, values: T[]): Promise<void> {
  const db = await getRawDB();
  const tx = db.transaction(store, 'readwrite');
  await Promise.all([...values.map((v) => tx.store.put(v as never, v.id)), tx.done]);
}

export async function deleteById(store: StoreName, id: string): Promise<void> {
  const db = await getRawDB();
  await db.delete(store, id);
}

export async function clearStore(store: StoreName): Promise<void> {
  const db = await getRawDB();
  await db.clear(store);
}

export async function clearAllStores(): Promise<void> {
  const db = await getRawDB();
  const tx = db.transaction(STORE_NAMES, 'readwrite');
  await Promise.all([...STORE_NAMES.map((s) => tx.objectStore(s).clear()), tx.done]);
}

/** Seed the exercise library on first load. */
export async function seedIfEmpty(): Promise<void> {
  const db = await getDB();
  const count = await db.count('exercises');
  if (count === 0) {
    await putMany('exercises', exerciseLibrary);
  }
}

export async function exportAllData(): Promise<Record<string, unknown[]>> {
  const db = await getRawDB();
  const out: Record<string, unknown[]> = {};
  for (const name of STORE_NAMES) {
    if (name === 'settings') {
      const keys = await db.getAllKeys('settings');
      const values = await db.getAll('settings');
      out.settings = keys.map((k, i) => ({ key: k, value: values[i] }));
    } else {
      out[name] = await db.getAll(name);
    }
  }
  return out;
}

export async function importAllData(data: Record<string, unknown[]>): Promise<void> {
  const db = await getRawDB();
  for (const name of STORE_NAMES) {
    const rows = data[name];
    if (!Array.isArray(rows)) continue;
    const tx = db.transaction(name, 'readwrite');
    await tx.store.clear();
    if (name === 'settings') {
      for (const row of rows as { key: string; value: unknown }[]) {
        await tx.store.put(row.value as never, row.key);
      }
    } else {
      for (const row of rows as { id: string }[]) {
        await tx.store.put(reviveDates(row) as never, row.id);
      }
    }
    await tx.done;
  }
}

const DATE_KEYS = new Set(['date', 'startDate', 'endDate', 'startTime', 'endTime', 'createdAt', 'lastUsed']);

function reviveDates<T>(obj: T): T {
  if (Array.isArray(obj)) return obj.map(reviveDates) as T;
  if (obj && typeof obj === 'object') {
    const out = { ...(obj as Record<string, unknown>) };
    for (const [k, v] of Object.entries(out)) {
      if (DATE_KEYS.has(k) && typeof v === 'string') out[k] = new Date(v);
      else if (v && typeof v === 'object') out[k] = reviveDates(v);
    }
    return out as T;
  }
  return obj;
}
