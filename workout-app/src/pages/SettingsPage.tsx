import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { format } from 'date-fns';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { useSettingsStore } from '../stores/settingsStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { usePlanStore } from '../stores/planStore';
import { useMetricsStore } from '../stores/metricsStore';
import { toast } from '../stores/toastStore';
import { exportAllData, importAllData, clearAllStores, seedIfEmpty } from '../db';
import type { RPEDisplay, WeekStart, WeightUnit } from '../types';

async function reloadAllStores(): Promise<void> {
  await Promise.all([
    useSettingsStore.getState().load(),
    useExerciseStore.getState().load(),
    useWorkoutStore.getState().load(),
    usePlanStore.getState().load(),
    useMetricsStore.getState().load(),
  ]);
}

function SettingRow({ label, hint, children }: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-border last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-text-primary">{label}</div>
        {hint && <div className="text-xs text-text-secondary mt-0.5">{hint}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workout-app-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('success', 'Data exported');
    } catch {
      toast('error', 'Export failed');
    }
  };

  const handleImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as Record<string, unknown[]>;
      await importAllData(data);
      await reloadAllStores();
      toast('success', 'Data imported');
    } catch {
      toast('error', 'Import failed — invalid file');
    } finally {
      setBusy(false);
    }
  };

  const handleReset = async () => {
    setBusy(true);
    try {
      await clearAllStores();
      await seedIfEmpty();
      await reloadAllStores();
      toast('success', 'All data cleared');
      setResetOpen(false);
      setConfirmText('');
    } catch {
      toast('error', 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <Card padded={false} className="p-4">
        <CardHeader title="Preferences" />
        <SettingRow label="Weight unit" hint="Values are stored in lbs and convert automatically across the app.">
          <Tabs<WeightUnit>
            tabs={[
              { value: 'lbs', label: 'lbs' },
              { value: 'kg', label: 'kg' },
            ]}
            active={settings.weightUnit}
            onChange={(weightUnit) => update({ weightUnit })}
          />
        </SettingRow>
        <SettingRow label="Week starts on">
          <Tabs<WeekStart>
            tabs={[
              { value: 'monday', label: 'Monday' },
              { value: 'sunday', label: 'Sunday' },
            ]}
            active={settings.weekStart}
            onChange={(weekStart) => update({ weekStart })}
          />
        </SettingRow>
        <SettingRow label="Default rest timer" hint="Seconds between sets when no template override is set.">
          <Input
            mono
            type="number"
            min={0}
            step={5}
            className="w-24 text-right"
            value={settings.defaultRestSeconds}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n >= 0) update({ defaultRestSeconds: Math.round(n) });
            }}
            aria-label="Default rest timer in seconds"
          />
        </SettingRow>
        <SettingRow label="Effort display" hint="RPE 1-10 or reps in reserve.">
          <Tabs<RPEDisplay>
            tabs={[
              { value: 'rpe', label: 'RPE' },
              { value: 'rir', label: 'RIR' },
            ]}
            active={settings.rpeDisplay}
            onChange={(rpeDisplay) => update({ rpeDisplay })}
          />
        </SettingRow>
        <SettingRow label="Height (inches)" hint="Used to compute BMI from body-weight entries.">
          <Input
            mono
            type="number"
            min={0}
            step={0.5}
            className="w-24 text-right"
            value={settings.heightInches ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                update({ heightInches: undefined });
                return;
              }
              const n = Number(raw);
              if (Number.isFinite(n) && n >= 0) update({ heightInches: n });
            }}
            aria-label="Height in inches"
          />
        </SettingRow>
      </Card>

      <Card padded={false} className="p-4">
        <CardHeader title="Data" />
        <SettingRow label="Export data" hint="Download everything as a JSON backup file.">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={14} /> Export JSON
          </Button>
        </SettingRow>
        <SettingRow label="Import data" hint="Restore from a previously exported JSON file. Replaces existing data.">
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> Import JSON
            </Button>
          </>
        </SettingRow>
      </Card>

      <Card accentColor="#EF4444" padded={false} className="p-4">
        <CardHeader title="Danger Zone" />
        <SettingRow label="Clear all data" hint="Deletes plans, workouts, PRs, metrics, and settings. Cannot be undone.">
          <Button variant="danger" size="sm" onClick={() => setResetOpen(true)}>
            <Trash2 size={14} /> Clear All Data
          </Button>
        </SettingRow>
      </Card>

      <Modal
        open={resetOpen}
        onClose={() => {
          setResetOpen(false);
          setConfirmText('');
        }}
        title="Clear All Data"
      >
        <p className="text-sm text-text-secondary mb-4">
          This permanently deletes every plan, workout, personal record, body metric, and setting.
          The exercise library will be re-seeded. This cannot be undone.
        </p>
        <Input
          label="Type DELETE to confirm"
          mono
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
        <div className="flex justify-end gap-2 mt-5">
          <Button
            variant="ghost"
            onClick={() => {
              setResetOpen(false);
              setConfirmText('');
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" disabled={confirmText !== 'DELETE' || busy} onClick={handleReset}>
            {busy ? 'Clearing…' : 'Delete Everything'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
