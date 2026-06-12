import { ChevronRight, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import { useWorkoutStore } from '../../stores/workoutStore';
import { Badge, sessionTypeColor } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import type { WorkoutTemplate } from '../../types';

interface TemplatePickerProps {
  onPick: (template: WorkoutTemplate) => void;
}

/** Lists saved workout templates for starting a logging session. */
export function TemplatePicker({ onPick }: TemplatePickerProps) {
  const templates = useWorkoutStore((s) => s.templates);

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        headline="No templates yet"
        description="Build a workout template in the Workouts tab, or start from scratch below."
      />
    );
  }

  return (
    <ul className="divide-y divide-border">
      {templates.map((t) => {
        const exerciseCount = t.exerciseBlocks.reduce((acc, b) => acc + b.exercises.length, 0);
        return (
          <li key={t.id}>
            <button
              onClick={() => onPick(t)}
              className="w-full flex items-center justify-between gap-3 px-1 py-3 text-left hover:bg-surface-alt/60 transition-colors rounded-sm group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-extrabold text-text-primary truncate">{t.name}</span>
                  <Badge color={sessionTypeColor(t.sessionType)}>{t.sessionType}</Badge>
                </div>
                <div className="text-xs text-text-secondary">
                  <span className="font-mono">{exerciseCount}</span> exercises ·{' '}
                  <span className="font-mono">{t.estimatedDurationMinutes}</span> min
                  {t.lastUsed && (
                    <>
                      {' '}· last used <span className="font-mono">{format(t.lastUsed, 'MMM d')}</span>
                    </>
                  )}
                  {t.timesUsed > 0 && (
                    <>
                      {' '}· <span className="font-mono">{t.timesUsed}</span>×
                    </>
                  )}
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-text-muted group-hover:text-accent shrink-0 transition-colors"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
