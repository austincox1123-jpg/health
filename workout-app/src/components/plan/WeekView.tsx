import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { addDays, format, isToday } from 'date-fns';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge, sessionTypeColor, phaseTypeColor } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { usePlanStore } from '../../stores/planStore';
import { useWorkoutStore } from '../../stores/workoutStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { toast } from '../../stores/toastStore';
import { PHASE_COLORS, PHASE_LABELS } from '../../data/phaseTemplates';
import { orderedDays, DAY_LABELS, formatShort, formatFull } from '../../utils/dates';
import {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_OPTIONS,
  removeSessionFromPlan,
  weekCompliance,
} from './planShared';
import type { AnnualPlan, DayOfWeek, Phase, PlannedSession, SessionType, WeekPlan } from '../../types';

// ---------- Session edit modal ----------

interface SessionDraft {
  session: PlannedSession;
  isNew: boolean;
}

function SessionModal({ draft, onClose, plan }: { draft: SessionDraft; onClose: () => void; plan: AnnualPlan }) {
  const templates = useWorkoutStore((s) => s.templates);
  const updateSession = usePlanStore((s) => s.updateSession);
  const savePlan = usePlanStore((s) => s.savePlan);

  const [label, setLabel] = useState(draft.session.label);
  const [sessionType, setSessionType] = useState<SessionType>(draft.session.sessionType);
  const [templateId, setTemplateId] = useState(draft.session.workoutTemplateId ?? '');
  const [notes, setNotes] = useState(draft.session.notes);

  const handleSave = async () => {
    await updateSession({
      ...draft.session,
      label: label.trim() || SESSION_TYPE_LABELS[sessionType],
      sessionType,
      workoutTemplateId: templateId || undefined,
      notes,
    });
    toast('success', draft.isNew ? 'Session added' : 'Session saved');
    onClose();
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove this planned session?')) return;
    await savePlan(removeSessionFromPlan(plan, draft.session.weekId, draft.session.id));
    toast('info', 'Session removed');
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={draft.isNew ? 'Add Session' : 'Edit Session'}>
      <div className="space-y-4">
        <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Upper Push" />
        <Select
          label="Session Type"
          value={sessionType}
          options={SESSION_TYPE_OPTIONS}
          onChange={(e) => setSessionType(e.target.value as SessionType)}
        />
        <Select
          label="Workout Template"
          value={templateId}
          placeholder="None"
          options={templates.map((t) => ({ value: t.id, label: t.name }))}
          onChange={(e) => setTemplateId(e.target.value)}
        />
        <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex items-center justify-between pt-2 border-t border-border">
          {!draft.isNew ? (
            <Button variant="danger" size="sm" onClick={handleRemove}>
              <Trash2 size={14} />
              Remove
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Session</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ---------- Draggable session card ----------

function SessionCard({ session, onEdit }: { session: PlannedSession; onEdit: () => void }) {
  const templates = useWorkoutStore((s) => s.templates);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session },
  });
  const template = session.workoutTemplateId
    ? templates.find((t) => t.id === session.workoutTemplateId)
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`bg-surface border border-border rounded-sm p-2 ${isDragging ? 'opacity-70 z-30 relative shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-1">
        <button
          {...listeners}
          {...attributes}
          className="text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing mt-0.5 touch-none"
          aria-label={`Move ${session.label}`}
        >
          <GripVertical size={12} />
        </button>
        <button onClick={onEdit} className="flex-1 min-w-0 text-left">
          <Badge color={sessionTypeColor(session.sessionType)}>
            {SESSION_TYPE_LABELS[session.sessionType]}
          </Badge>
          <span className="block text-xs font-semibold text-text-primary mt-1 truncate">
            {session.label}
          </span>
          {template && (
            <span className="block text-[10px] text-text-secondary truncate">{template.name}</span>
          )}
        </button>
      </div>
    </div>
  );
}

// ---------- Droppable day column ----------

function DayColumn({
  day,
  date,
  sessions,
  onAdd,
  onEdit,
}: {
  day: DayOfWeek;
  date: Date;
  sessions: PlannedSession[];
  onAdd: () => void;
  onEdit: (s: PlannedSession) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${day}` });
  const today = isToday(date);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-surface-alt border rounded-sm min-h-[180px] transition-colors ${
        isOver ? 'border-accent bg-accent/5' : today ? 'border-accent/60' : 'border-border'
      }`}
    >
      <div className={`px-2 py-1.5 border-b border-border flex items-baseline justify-between ${today ? 'bg-accent/10' : ''}`}>
        <span className="text-[10px] font-bold uppercase tracking-label text-text-secondary">
          {DAY_LABELS[day]}
        </span>
        <span className={`text-[10px] font-mono ${today ? 'text-accent font-bold' : 'text-text-muted'}`}>
          {format(date, 'M/d')}
        </span>
      </div>
      <div className="flex-1 p-1.5 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="h-full min-h-[60px] flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-label text-text-muted">Rest</span>
          </div>
        ) : (
          sessions.map((s) => <SessionCard key={s.id} session={s} onEdit={() => onEdit(s)} />)
        )}
      </div>
      <div className="p-1.5 pt-0">
        <Button variant="ghost" size="sm" className="w-full" onClick={onAdd}>
          <Plus size={12} />
          Add
        </Button>
      </div>
    </div>
  );
}

// ---------- Week view ----------

interface WeekViewProps {
  plan: AnnualPlan;
  phase: Phase;
  week: WeekPlan;
}

export function WeekView({ plan, phase, week }: WeekViewProps) {
  const weekStart = useSettingsStore((s) => s.settings.weekStart);
  const completed = useWorkoutStore((s) => s.completed);
  const updateSession = usePlanStore((s) => s.updateSession);
  const [draft, setDraft] = useState<SessionDraft | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const days = orderedDays(weekStart);

  // Map each absolute day-of-week to its calendar date inside this plan week.
  const dateByDay = new Map<number, Date>();
  for (let i = 0; i < 7; i += 1) {
    const d = addDays(week.startDate, i);
    dateByDay.set(d.getDay(), d);
  }

  const weekEnd = addDays(week.startDate, 7);
  const isPastWeek = weekEnd.getTime() <= Date.now();
  const compliance = weekCompliance(week, completed);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || typeof over.id !== 'string' || !over.id.startsWith('day-')) return;
    const newDay = Number(over.id.slice(4)) as DayOfWeek;
    const session = active.data.current?.session as PlannedSession | undefined;
    if (!session || session.dayOfWeek === newDay) return;
    await updateSession({ ...session, dayOfWeek: newDay });
    toast('success', `Moved to ${DAY_LABELS[newDay]}`);
  };

  const openAdd = (day: DayOfWeek) => {
    setDraft({
      isNew: true,
      session: {
        id: crypto.randomUUID(),
        weekId: week.id,
        dayOfWeek: day,
        label: '',
        sessionType: 'strength',
        notes: '',
      },
    });
  };

  return (
    <div className="space-y-4">
      <Card accentColor={PHASE_COLORS[phase.type]}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">
              Week of {formatFull(week.startDate)}
            </h3>
            <span className="text-xs font-mono text-text-secondary">
              {formatShort(week.startDate)} – {formatShort(addDays(week.startDate, 6))}
            </span>
          </div>
          <Badge color={phaseTypeColor(phase.type)}>
            {phase.name} · {PHASE_LABELS[phase.type]}
          </Badge>
          {week.isDeload && <Badge color="green">Deload</Badge>}
          {week.targetVolume !== undefined && (
            <span className="text-xs text-text-secondary">
              Target <span className="font-mono text-text-primary font-semibold">{week.targetVolume}</span> sets
            </span>
          )}
          {isPastWeek && (
            <span className="text-xs font-mono text-text-secondary ml-auto">
              <span
                className={
                  compliance.pct >= 80 ? 'text-success' : compliance.pct >= 50 ? 'text-warning' : 'text-danger'
                }
              >
                {compliance.done}/{compliance.planned} done · {compliance.pct}%
              </span>
            </span>
          )}
        </div>
      </Card>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
          {days.map((d) => {
            const day = d as DayOfWeek;
            const sessions = week.plannedSessions
              .filter((s) => s.dayOfWeek === day)
              .sort((a, b) => a.label.localeCompare(b.label));
            return (
              <DayColumn
                key={day}
                day={day}
                date={dateByDay.get(day) ?? week.startDate}
                sessions={sessions}
                onAdd={() => openAdd(day)}
                onEdit={(s) => setDraft({ isNew: false, session: s })}
              />
            );
          })}
        </div>
      </DndContext>

      {draft && <SessionModal draft={draft} plan={plan} onClose={() => setDraft(null)} />}
    </div>
  );
}
