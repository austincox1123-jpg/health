import { Card } from '../ui/Card';
import type { MacroTargets } from '../../utils/nutritionCalc';
import type { MacroTotals } from './recommend';

const BAR_COLORS = {
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
} as const;

/** Calories: blue under target, yellow within 10% over, red >10% over. */
function caloriesColor(consumed: number, target: number): string {
  if (target <= 0 || consumed <= target) return BAR_COLORS.accent;
  const over = consumed / target;
  return over > 1.1 ? BAR_COLORS.danger : BAR_COLORS.warning;
}

/** Protein: green once the target is met, blue while under. */
function proteinColor(consumed: number, target: number): string {
  return consumed >= target && target > 0 ? BAR_COLORS.success : BAR_COLORS.accent;
}

/** Carbs / fat: blue under target, yellow when over. */
function macroColor(consumed: number, target: number): string {
  return target > 0 && consumed > target ? BAR_COLORS.warning : BAR_COLORS.accent;
}

interface MacroRowProps {
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}

function MacroRow({ label, consumed, target, unit, color }: MacroRowProps) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const remaining = target - consumed;
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between mb-1">
        <span className="section-label">{label}</span>
        <span className="font-mono text-xs text-text-primary">
          {Math.round(consumed).toLocaleString()}
          <span className="text-text-muted"> / {target.toLocaleString()}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 bg-surface-alt rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="font-mono text-[11px] mt-1 text-text-secondary">
        {remaining >= 0
          ? `${Math.round(remaining).toLocaleString()}${unit} left`
          : `${Math.round(-remaining).toLocaleString()}${unit} over`}
      </p>
    </div>
  );
}

export function DailyTotalsBar({ consumed, targets }: { consumed: MacroTotals; targets: MacroTargets }) {
  return (
    <Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        <MacroRow
          label="Calories"
          consumed={consumed.calories}
          target={targets.calories}
          unit=""
          color={caloriesColor(consumed.calories, targets.calories)}
        />
        <MacroRow
          label="Protein"
          consumed={consumed.proteinG}
          target={targets.proteinG}
          unit="g"
          color={proteinColor(consumed.proteinG, targets.proteinG)}
        />
        <MacroRow
          label="Carbs"
          consumed={consumed.carbsG}
          target={targets.carbsG}
          unit="g"
          color={macroColor(consumed.carbsG, targets.carbsG)}
        />
        <MacroRow
          label="Fat"
          consumed={consumed.fatG}
          target={targets.fatG}
          unit="g"
          color={macroColor(consumed.fatG, targets.fatG)}
        />
      </div>
    </Card>
  );
}
