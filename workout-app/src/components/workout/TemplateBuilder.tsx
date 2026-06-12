import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from '../../stores/toastStore';
import type { BlockType, ExerciseBlock, WorkoutTemplate } from '../../types';
import { BlockEditor } from './BlockEditor';

type TemplateSessionType = WorkoutTemplate['sessionType'];

const SESSION_TYPE_OPTIONS: { value: TemplateSessionType; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'mobility', label: 'Mobility' },
];

interface TemplateBuilderProps {
  open: boolean;
  /** Existing template to edit, or null to create a new one. */
  template: WorkoutTemplate | null;
  onClose: () => void;
}

/**
 * Full-screen template builder modal. Mount with a `key` tied to the template
 * being edited so draft state resets between sessions.
 */
export function TemplateBuilder({ open, template, onClose }: TemplateBuilderProps) {
  const saveTemplate = useWorkoutStore((s) => s.saveTemplate);
  const defaultRestSeconds = useSettingsStore((s) => s.settings.defaultRestSeconds);

  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [sessionType, setSessionType] = useState<TemplateSessionType>(
    template?.sessionType ?? 'strength',
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    template?.estimatedDurationMinutes ?? 60,
  );
  const [tagsInput, setTagsInput] = useState(template?.tags.join(', ') ?? '');
  const [blocks, setBlocks] = useState<ExerciseBlock[]>(template?.exerciseBlocks ?? []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const addBlock = (type: BlockType) =>
    setBlocks((bs) => [
      ...bs,
      {
        id: crypto.randomUUID(),
        type,
        exercises: [],
        restBetweenSetsSeconds: defaultRestSeconds,
        restAfterBlockSeconds: 120,
        notes: '',
      },
    ]);

  const updateBlock = (id: string, patch: Partial<ExerciseBlock>) =>
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const handleBlockDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setBlocks((bs) => {
      const oldIndex = bs.findIndex((b) => b.id === active.id);
      const newIndex = bs.findIndex((b) => b.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return bs;
      return arrayMove(bs, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast('error', 'Template name is required');
      return;
    }
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const next: WorkoutTemplate = {
      id: template?.id ?? crypto.randomUUID(),
      name: trimmed,
      description: description.trim(),
      sessionType,
      estimatedDurationMinutes: Math.max(0, Math.round(durationMinutes) || 0),
      exerciseBlocks: blocks,
      tags,
      createdAt: template?.createdAt ?? new Date(),
      lastUsed: template?.lastUsed,
      timesUsed: template?.timesUsed ?? 0,
    };
    await saveTemplate(next);
    toast('success', template ? `Updated "${trimmed}"` : `Created "${trimmed}"`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={template ? 'Edit Template' : 'New Template'} wide>
      <div className="space-y-5">
        {/* meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Upper Power A"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Session Type"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as TemplateSessionType)}
              options={SESSION_TYPE_OPTIONS}
            />
            <Input
              label="Est. Duration (min)"
              mono
              type="number"
              inputMode="numeric"
              min={0}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
            />
          </div>
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Focus, cues, intent…"
            rows={2}
          />
          <Input
            label="Tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="push, heavy, week-a"
          />
        </div>

        {/* blocks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="section-label">Exercise Blocks</h3>
            <div className="flex items-center gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => addBlock('straight')}>
                <Plus size={12} /> Straight
              </Button>
              <Button variant="secondary" size="sm" onClick={() => addBlock('superset')}>
                <Plus size={12} /> Superset
              </Button>
              <Button variant="secondary" size="sm" onClick={() => addBlock('circuit')}>
                <Plus size={12} /> Circuit
              </Button>
            </div>
          </div>

          {blocks.length === 0 ? (
            <p className="text-xs text-text-muted border border-dashed border-border rounded-sm px-3 py-6 text-center">
              No blocks yet. Add a straight-set, superset, or circuit block to start building.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlockDragEnd}
            >
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {blocks.map((block, i) => (
                    <BlockEditor
                      key={block.id}
                      block={block}
                      index={i}
                      onChange={(patch) => updateBlock(block.id, patch)}
                      onRemove={() => setBlocks((bs) => bs.filter((b) => b.id !== block.id))}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()}>
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
