import type { Exercise } from '../../types';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { MUSCLE_CATEGORY_COLORS } from '../../utils/chartTheme';
import { formatLabel } from './labels';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseCard({ exercise, onSelect }: ExerciseCardProps) {
  return (
    <Card
      accentColor={MUSCLE_CATEGORY_COLORS[exercise.category]}
      className="cursor-pointer hover:border-accent transition-colors"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(exercise)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(exercise);
        }
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-extrabold text-text-primary leading-tight">{exercise.name}</h3>
        {exercise.isCustom && <Badge color="orange">Custom</Badge>}
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {exercise.muscleGroups.map((m) => (
          <Badge key={m} color="blue">{formatLabel(m)}</Badge>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-text-secondary truncate">
          {exercise.equipment.map(formatLabel).join(', ')}
        </span>
        <Badge color="gray">{formatLabel(exercise.movementPattern)}</Badge>
      </div>
    </Card>
  );
}
