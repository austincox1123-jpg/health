import { create } from 'zustand';
import { getAll, put, deleteById } from '../db';
import type { BodyMetrics } from '../types';

interface MetricsState {
  metrics: BodyMetrics[];
  loaded: boolean;
  load: () => Promise<void>;
  save: (entry: BodyMetrics) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  metrics: [],
  loaded: false,
  load: async () => {
    const metrics = await getAll<BodyMetrics>('body_metrics');
    metrics.sort((a, b) => a.date.getTime() - b.date.getTime());
    set({ metrics, loaded: true });
  },
  save: async (entry) => {
    await put('body_metrics', entry, entry.id);
    set((s) => ({
      metrics: [...s.metrics.filter((m) => m.id !== entry.id), entry].sort(
        (a, b) => a.date.getTime() - b.date.getTime(),
      ),
    }));
  },
  remove: async (id) => {
    await deleteById('body_metrics', id);
    set((s) => ({ metrics: s.metrics.filter((m) => m.id !== id) }));
  },
}));
