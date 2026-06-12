import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { ChevronDown, ChevronRight, Scale, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { EmptyState } from '../ui/EmptyState';
import { CHART } from '../../utils/chartTheme';
import { useMetricsStore } from '../../stores/metricsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from '../../stores/toastStore';
import {
  computeBMI, estimateLeanMass, formatWeight, kgToLbs, lbsToKg,
} from '../../utils/calculations';
import { formatShort, formatFull } from '../../utils/dates';
import type { BodyMetrics } from '../../types';

const TICK = { fill: CHART.axis, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' };

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'leftArm', label: 'L Arm' },
  { key: 'rightArm', label: 'R Arm' },
  { key: 'leftThigh', label: 'L Thigh' },
  { key: 'rightThigh', label: 'R Thigh' },
] as const;

type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]['key'];

export function BodyMetricsPanel() {
  const metrics = useMetricsStore((s) => s.metrics);
  const saveMetric = useMetricsStore((s) => s.save);
  const removeMetric = useMetricsStore((s) => s.remove);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.update);
  const unit = settings.weightUnit;

  const [open, setOpen] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [dateStr, setDateStr] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weightStr, setWeightStr] = useState('');
  const [bodyFatStr, setBodyFatStr] = useState('');
  const [measurementStrs, setMeasurementStrs] = useState<Record<MeasurementKey, string>>({
    chest: '', waist: '', hips: '', leftArm: '', rightArm: '', leftThigh: '', rightThigh: '',
  });
  const [heightStr, setHeightStr] = useState(settings.heightInches !== undefined ? String(settings.heightInches) : '');

  const weightData = useMemo(
    () =>
      metrics
        .filter((m) => m.weight !== undefined)
        .map((m) => ({
          label: formatShort(m.date),
          weight: unit === 'kg' ? lbsToKg(m.weight as number) : m.weight as number,
        })),
    [metrics, unit],
  );

  const latestWithWeight = useMemo(
    () => [...metrics].reverse().find((m) => m.weight !== undefined),
    [metrics],
  );

  const bmi =
    latestWithWeight?.weight !== undefined && settings.heightInches !== undefined && settings.heightInches > 0
      ? computeBMI(latestWithWeight.weight, settings.heightInches)
      : null;
  const leanMass =
    latestWithWeight?.weight !== undefined && latestWithWeight.bodyFatPercent !== undefined
      ? estimateLeanMass(latestWithWeight.weight, latestWithWeight.bodyFatPercent)
      : null;

  function commitHeight() {
    const n = parseFloat(heightStr);
    if (!Number.isNaN(n) && n > 0) {
      void updateSettings({ heightInches: n });
    }
  }

  async function handleSave() {
    const weightInput = parseFloat(weightStr);
    const bodyFatInput = parseFloat(bodyFatStr);
    const hasWeight = !Number.isNaN(weightInput) && weightInput > 0;
    const hasBodyFat = !Number.isNaN(bodyFatInput) && bodyFatInput > 0;
    if (!dateStr || (!hasWeight && !hasBodyFat)) {
      toast('error', 'Enter a date and at least a weight or body fat %.');
      return;
    }
    const measurements: Partial<Record<MeasurementKey, number>> = {};
    let hasMeasurement = false;
    for (const field of MEASUREMENT_FIELDS) {
      const v = parseFloat(measurementStrs[field.key]);
      if (!Number.isNaN(v) && v > 0) {
        measurements[field.key] = v;
        hasMeasurement = true;
      }
    }
    const entry: BodyMetrics = {
      id: crypto.randomUUID(),
      date: new Date(`${dateStr}T12:00:00`),
      weight: hasWeight ? (unit === 'kg' ? kgToLbs(weightInput) : weightInput) : undefined,
      bodyFatPercent: hasBodyFat ? bodyFatInput : undefined,
      measurements: hasMeasurement ? measurements : undefined,
      notes: '',
    };
    await saveMetric(entry);
    setWeightStr('');
    setBodyFatStr('');
    setMeasurementStrs({
      chest: '', waist: '', hips: '', leftArm: '', rightArm: '', leftThigh: '', rightThigh: '',
    });
    toast('success', 'Body metrics saved.');
  }

  const entriesNewestFirst = useMemo(() => [...metrics].reverse(), [metrics]);

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full text-left"
        aria-expanded={open}
      >
        {open ? <ChevronDown size={14} className="text-text-secondary" /> : <ChevronRight size={14} className="text-text-secondary" />}
        <span className="section-label">Body Metrics</span>
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left: trend chart + computed stats */}
          <div>
            {weightData.length === 0 ? (
              <EmptyState icon={Scale} headline="No weight entries" description="Log your body weight to see the trend over time." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weightData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="label" tick={TICK} axisLine={{ stroke: CHART.grid }} tickLine={false} />
                  <YAxis tick={TICK} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={CHART.tooltip}
                    formatter={(value) => [`${Number(value)} ${unit}`, 'weight']}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke={CHART.success}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART.success, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-surface-alt border border-border rounded-sm p-3">
                <p className="section-label mb-1">Latest Weight</p>
                <p className="stat-value text-lg">
                  {latestWithWeight?.weight !== undefined ? formatWeight(latestWithWeight.weight, unit) : '—'}
                </p>
              </div>
              <div className="bg-surface-alt border border-border rounded-sm p-3">
                <p className="section-label mb-1">BMI</p>
                <p className="stat-value text-lg">{bmi !== null ? bmi : '—'}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <input
                    type="number"
                    value={heightStr}
                    onChange={(e) => setHeightStr(e.target.value)}
                    onBlur={commitHeight}
                    placeholder="Height"
                    aria-label="Height in inches"
                    className="w-16 bg-surface border border-border rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-text-primary focus:outline-none focus:border-accent"
                  />
                  <span className="font-mono text-[10px] text-text-muted">in</span>
                </div>
              </div>
              <div className="bg-surface-alt border border-border rounded-sm p-3">
                <p className="section-label mb-1">Lean Mass</p>
                <p className="stat-value text-lg">{leanMass !== null ? formatWeight(leanMass, unit) : '—'}</p>
              </div>
            </div>
          </div>

          {/* Right: entry form + entries table */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Input label="Date" type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} mono />
              <Input
                label={`Weight (${unit})`}
                type="number"
                step="0.1"
                min="0"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                mono
              />
              <Input
                label="Body Fat %"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={bodyFatStr}
                onChange={(e) => setBodyFatStr(e.target.value)}
                mono
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMeasurements((s) => !s)}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary"
              aria-expanded={showMeasurements}
            >
              {showMeasurements ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Measurements (in)
            </button>
            {showMeasurements && (
              <div className="grid grid-cols-4 gap-3">
                {MEASUREMENT_FIELDS.map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    type="number"
                    step="0.1"
                    min="0"
                    value={measurementStrs[field.key]}
                    onChange={(e) =>
                      setMeasurementStrs((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    mono
                  />
                ))}
              </div>
            )}

            <Button size="sm" onClick={() => void handleSave()}>
              Save Entry
            </Button>

            {entriesNewestFirst.length > 0 && (
              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-sm">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-surface">
                    <tr className="border-b border-border">
                      <th className="section-label text-left py-2 px-3">Date</th>
                      <th className="section-label text-right py-2 px-3">Weight</th>
                      <th className="section-label text-right py-2 px-3">BF %</th>
                      <th className="py-2 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {entriesNewestFirst.map((m) => (
                      <tr key={m.id} className="border-b border-border/50 last:border-0">
                        <td className="py-1.5 px-3 font-mono text-xs text-text-secondary whitespace-nowrap">
                          {formatFull(m.date)}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-right text-text-primary">
                          {m.weight !== undefined ? formatWeight(m.weight, unit) : '—'}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-right text-text-primary">
                          {m.bodyFatPercent !== undefined ? `${m.bodyFatPercent}%` : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              void removeMetric(m.id);
                              toast('info', 'Entry deleted.');
                            }}
                            className="text-text-muted hover:text-danger"
                            aria-label={`Delete entry ${formatFull(m.date)}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
