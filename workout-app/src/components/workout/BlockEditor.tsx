import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Copy, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useExerciseStore } from '../../stores/exerciseStore';
import type {
  BlockType,
  ExerciseBlock,
  PlannedExercise,
  PlannedSet,
  SetType,
} from '../../types';
import { ExerciseSearch } from './ExerciseSearch';

// ---------- shared bits ----------

const BLOCK_TYPE_OPTIONS: { value: BlockType; label: string }[] = [
  { value: 'straight', label: 'Straight Sets' },
  { value: 'superset', label: 'Superset' },
  { value: 'circuit', label: 'Circuit' },
];

const SET_TYPE_OPTIONS: { value: SetType; label: string }[] = [
  { value: 'working', label: 'WORK' },
  { value: 'warmup', label: 'WARM' },
  { value: 'drop', label: 'DROP' },
  { value: 'failure', label: 'FAIL' },
  { value: 'amrap', label: 'AMRAP' },
];

function blockTypeBadgeColor(type: BlockType): 'gray' | 'purple' | 'orange' {
  if (type === 'superset') return 'purple';
  if (type === 'circuit') return 'orange';
  return 'gray';
}

const cellInputClass =
  'w-full bg-surface-alt border border-border rounded-sm px-1.5 py-1 text-xs font-mono text-text-primary text-center placeholder-text-muted focus:outline-none focus:border-accent';

function NumCell({
  value,
  onChange,
  placeholder,
  step,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  step?: number;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      step={step}
      value={value ?? ''}
      placeholder={placeholder ?? '—'}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      className={cellInputClass}
    />
  );
}

export function newPlannedSet(): PlannedSet {
  return { id: crypto.randomUUID(), setType: 'working', targetReps: 8 };
}

// ---------- exercise row ----------

interface ExerciseEditorProps {
  exercise: PlannedExercise;
  position: string;
  onChange: (patch: Partial<PlannedExercise>) => void;
  onRemove: () => void;
}

function ExerciseEditor({ exercise, position, onChange, onRemove }: ExerciseEditorProps) {
  const byId = useExerciseStore((s) => s.byId);
  const info = byId(exercise.exerciseId);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exercise.id,
  });

  const updateSet = (setId: string, patch: Partial<PlannedSet>) =>
    onChange({ sets: exercise.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) });

  const copySet = (set: PlannedSet) => {
    const idx = exercise.sets.findIndex((s) => s.id === set.id);
    const clone: PlannedSet = { ...set, id: crypto.randomUUID() };
    const next = [...exercise.sets];
    next.splice(idx + 1, 0, clone);
    onChange({ sets: next });
  };

  const removeSet = (setId: string) =>
    onChange({ sets: exercise.sets.filter((s) => s.id !== setId) });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border border-border rounded-sm bg-background/40 ${isDragging ? 'opacity-50 z-10 relative' : ''}`}
    >
      <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder exercise"
        >
          <GripVertical size={14} />
        </button>
        <span className="font-mono text-[10px] text-text-muted">{position}</span>
        <span className="text-xs font-bold text-text-primary flex-1 truncate">
          {info?.name ?? 'Unknown exercise'}
        </span>
        {info && (
          <span className="text-[10px] uppercase tracking-label text-text-secondary hidden sm:inline">
            {info.category.replace(/_/g, ' ')}
          </span>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="text-text-muted hover:text-danger"
          aria-label="Remove exercise"
        >
          <X size={14} />
        </button>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-label text-text-secondary">
            <th className="px-2 py-1 text-left w-8">#</th>
            <th className="px-1 py-1 text-left w-20">Type</th>
            <th className="px-1 py-1 w-14">Reps</th>
            <th className="px-1 py-1 w-14">Max</th>
            <th className="px-1 py-1 w-16">Wt</th>
            <th className="px-1 py-1 w-14">RPE</th>
            <th className="px-1 py-1 w-14">Sec</th>
            <th className="px-1 py-1 w-14" />
          </tr>
        </thead>
        <tbody>
          {exercise.sets.map((set, si) => (
            <tr key={set.id} className="border-t border-border/60">
              <td className="px-2 py-1 font-mono text-text-secondary">{si + 1}</td>
              <td className="px-1 py-1">
                <select
                  value={set.setType}
                  onChange={(e) => updateSet(set.id, { setType: e.target.value as SetType })}
                  className="w-full bg-surface-alt border border-border rounded-sm px-1 py-1 text-[10px] font-bold text-text-primary focus:outline-none focus:border-accent appearance-none"
                >
                  {SET_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-1 py-1">
                <NumCell value={set.targetReps} onChange={(v) => updateSet(set.id, { targetReps: v })} />
              </td>
              <td className="px-1 py-1">
                <NumCell value={set.targetRepsMax} onChange={(v) => updateSet(set.id, { targetRepsMax: v })} />
              </td>
              <td className="px-1 py-1">
                <NumCell value={set.targetWeight} step={2.5} onChange={(v) => updateSet(set.id, { targetWeight: v })} />
              </td>
              <td className="px-1 py-1">
                <NumCell value={set.targetRPE} step={0.5} onChange={(v) => updateSet(set.id, { targetRPE: v })} />
              </td>
              <td className="px-1 py-1">
                <NumCell
                  value={set.targetDurationSeconds}
                  onChange={(v) => updateSet(set.id, { targetDurationSeconds: v })}
                />
              </td>
              <td className="px-1 py-1">
                <div className="flex items-center justify-end gap-1.5 pr-1">
                  <button
                    type="button"
                    onClick={() => copySet(set)}
                    className="text-text-muted hover:text-text-primary"
                    aria-label="Copy set"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSet(set.id)}
                    className="text-text-muted hover:text-danger"
                    aria-label="Remove set"
                  >
                    <X size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-2 py-1.5 border-t border-border/60">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ sets: [...exercise.sets, newPlannedSet()] })}
        >
          <Plus size={12} /> Add Set
        </Button>
      </div>
    </div>
  );
}

// ---------- block ----------

interface BlockEditorProps {
  block: ExerciseBlock;
  index: number;
  onChange: (patch: Partial<ExerciseBlock>) => void;
  onRemove: () => void;
}

export function BlockEditor({ block, index, onChange, onRemove }: BlockEditorProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleExerciseDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = block.exercises.findIndex((ex) => ex.id === active.id);
    const newIndex = block.exercises.findIndex((ex) => ex.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange({ exercises: arrayMove(block.exercises, oldIndex, newIndex) });
  };

  const updateExercise = (exerciseId: string, patch: Partial<PlannedExercise>) =>
    onChange({
      exercises: block.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...patch } : ex)),
    });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`border border-border rounded-sm bg-surface ${isDragging ? 'opacity-50 z-10 relative' : ''}`}
    >
      {/* block header */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-border bg-surface-alt/40">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder block"
        >
          <GripVertical size={16} />
        </button>
        <span className="font-mono text-xs text-text-secondary">B{index + 1}</span>
        <Badge color={blockTypeBadgeColor(block.type)}>{block.type}</Badge>
        <select
          value={block.type}
          onChange={(e) => onChange({ type: e.target.value as BlockType })}
          className="bg-surface-alt border border-border rounded-sm px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent appearance-none"
          aria-label="Block type"
        >
          {BLOCK_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-label text-text-secondary">
              Rest/Set s
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={block.restBetweenSetsSeconds}
              onChange={(e) => onChange({ restBetweenSetsSeconds: Number(e.target.value) || 0 })}
              className={`${cellInputClass} w-16`}
            />
          </label>
          <label className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-label text-text-secondary">
              Rest/Block s
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={block.restAfterBlockSeconds}
              onChange={(e) => onChange({ restAfterBlockSeconds: Number(e.target.value) || 0 })}
              className={`${cellInputClass} w-16`}
            />
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="text-text-muted hover:text-danger"
            aria-label="Delete block"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* exercises */}
      <div className="p-3 space-y-2">
        {block.exercises.length === 0 && (
          <p className="text-xs text-text-muted py-1">No exercises yet — search below to add.</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleExerciseDragEnd}>
          <SortableContext items={block.exercises.map((ex) => ex.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {block.exercises.map((ex, ei) => (
                <ExerciseEditor
                  key={ex.id}
                  exercise={ex}
                  position={`${index + 1}.${ei + 1}`}
                  onChange={(patch) => updateExercise(ex.id, patch)}
                  onRemove={() =>
                    onChange({ exercises: block.exercises.filter((x) => x.id !== ex.id) })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <ExerciseSearch
          onSelect={(exercise) =>
            onChange({
              exercises: [
                ...block.exercises,
                { id: crypto.randomUUID(), exerciseId: exercise.id, sets: [newPlannedSet()], notes: '' },
              ],
            })
          }
        />
      </div>
    </div>
  );
}
