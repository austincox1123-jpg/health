import { Plus, SkipForward, Timer } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDuration } from '../../utils/calculations';

interface RestTimerProps {
  remaining: number;
  running: boolean;
  /** Total seconds for this rest period (initial + extensions), used for the progress bar. */
  total: number;
  onExtend: () => void;
  onSkip: () => void;
}

/** Fixed bottom-bar rest countdown. Renders nothing when no rest is running. */
export function RestTimer({ remaining, running, total, onExtend, onSkip }: RestTimerProps) {
  if (!running) return null;

  const pct = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-border">
      <div className="h-0.5 bg-surface-alt">
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Timer size={18} className="text-accent" />
          <span className="section-label">Rest</span>
          <span className="font-mono font-bold text-2xl text-text-primary tabular-nums">
            {formatDuration(remaining)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onExtend}>
            <Plus size={13} /> <span className="font-mono">30s</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onSkip}>
            <SkipForward size={13} /> Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
