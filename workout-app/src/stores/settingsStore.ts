import { create } from 'zustand';
import { getDB } from '../db';
import { DEFAULT_SETTINGS, type AppSettings } from '../types';

interface SettingsState {
  settings: AppSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  load: async () => {
    const db = await getDB();
    const stored = (await db.get('settings', 'app')) as Partial<AppSettings> | undefined;
    set({ settings: { ...DEFAULT_SETTINGS, ...stored }, loaded: true });
  },
  update: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    const db = await getDB();
    await db.put('settings', next, 'app');
  },
}));
