import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Flag, Plus, Search, Trash2, Zap } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useWorkoutStore } from '../stores/workoutStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { useSettingsStore } from '../stores/settingsStore';
import { toast } from '../stores/toastStore';
import { useElapsed, useCountdown } from '../hooks/useTimer';
import {
  calculateVolume,
  estimateOneRepMax,
  formatDuration,
  formatWeight,
  kgToLbs,
} from '../utils/calculations';
import { RestTimer } from '../components/workout/RestTimer';
import { TemplatePicker } from '../components/workout/TemplatePicker';
import {
  SetTable,
  placeholderForIndex,
  type BlockDraft,
  type SetDraft,
} from '../components/workout/SetTable';
import type {
  CompletedBlock,
  CompletedSet,
  CompletedWorkout,
  Exercise,
  WorkoutTemplate,
} from '../types';

interface Session {
  templateId?: string;
  name: string;
  startTime: Date;
  blocks: BlockDraft[];
  sessionRPE: string;
  notes: string;
}

const RPE_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

function emptySet(base?: Partial<SetDraft>): SetDraft {
  return {
    id: crypto.randomUUID(),
    setType: 'working',
    reps: '',
    weight: '',
    rpe: '',
    logged: false,
    isPR: false,
    ...base,
  };
}

function sessionFromTemplate(t: WorkoutTemplate): Session {
  return {
    templateId: t.id,
    name: t.name,
    startTime: new Date(),
    sessionRPE: '',
    notes: '',
    blocks: t.exerciseBlocks.map((b) => ({
      id: crypto.randomUUID(),
      type: b.type,
      restBetweenSetsSeconds: b.restBetweenSetsSeconds,
      exercises: b.exercises.map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.exerciseId,
        notes: ex.notes,
        sets: ex.sets.map((s) =>
          emptySet({
            setType: s.setType,
            targetReps: s.targetReps,
            targetRepsMax: s.targetRepsMax,
            targetWeight: s.targetWeight,
            targetRPE: s.targetRPE,
            targetDurationSeconds: s.targetDurationSeconds,
          }),
        ),
      })),
    })),
  };
}

function parseIntInput(s: string): number | undefined {
  const n = parseInt(s, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function parseFloatInput(s: string): number | undefined {
  const n = parseFloat(s);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function WorkoutLoggerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const templates = useWorkoutStore((s) => s.templates);
  const completed = useWorkoutStore((s) => s.completed);
  const exercises = useExerciseStore((s) => s.exercises);
  const exerciseById = useExerciseStore((s) => s.byId);
  const settings = useSettingsStore((s) => s.settings);
  const unit = settings.weightUnit;

  const [session, setSession] = useState<Session | null>(null);
  const [restTotal, setRestTotal] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const elapsed = useElapsed(session?.startTime ?? null);
  const countdown = useCountdown();

  // Auto-start from ?template=<id>
  useEffect(() => {
    const templateId = searchParams.get('template');
    if (!templateId || session) return;
    const t = templates.find((x) => x.id === templateId);
    if (t) {
      setSession(sessionFromTemplate(t));
    } else {
      toast('error', 'Template not found');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, session, templates, setSearchParams]);

  // Most recent completed sets per exercise (for placeholders)
  const lastSetsByExercise = useMemo(() => {
    const map = new Map<string, CompletedSet[]>();
    if (!session) return map;
    const ids = new Set<string>();
    for (const b of session.blocks) for (const ex of b.exercises) ids.add(ex.exerciseId);
    for (const id of ids) {
      outer: for (const w of completed) {
        for (const block of w.exerciseBlocks) {
          for (const ex of block.exercises) {
            if (ex.exerciseId === id && ex.sets.length > 0) {
              map.set(id, ex.sets);
              break outer;
            }
          }
        }
      }
    }
    return map;
  }, [session, completed]);

  const startFromScratch = useCallback(() => {
    setSession({
      name: 'Workout',
      startTime: new Date(),
      sessionRPE: '',
      notes: '',
      blocks: [],
    });
  }, []);

  const updateBlocks = useCallback((fn: (blocks: BlockDraft[]) => BlockDraft[]) => {
    setSession((s) => (s ? { ...s, blocks: fn(s.blocks) } : s));
  }, []);

  const updateSet = useCallback(
    (blockId: string, exId: string, setId: string, patch: Partial<SetDraft>) => {
      updateBlocks((blocks) =>
        blocks.map((b) =>
          b.id !== blockId
            ? b
            : {
                ...b,
                exercises: b.exercises.map((ex) =>
                  ex.id !== exId
                    ? ex
                    : { ...ex, sets: ex.sets.map((s) => (s.id !== setId ? s : { ...s, ...patch })) },
                ),
              },
        ),
      );
    },
    [updateBlocks],
  );

  /** Best estimated 1RM already logged for an exercise in the current session. */
  const sessionBest = useCallback(
    (exerciseId: string): number => {
      if (!session) return 0;
      let best = 0;
      for (const b of session.blocks) {
        for (const ex of b.exercises) {
          if (ex.exerciseId !== exerciseId) continue;
          for (const s of ex.sets) {
            if (s.logged && s.estimatedOneRepMax && s.estimatedOneRepMax > best) {
              best = s.estimatedOneRepMax;
            }
          }
        }
      }
      return best;
    },
    [session],
  );

  const toggleLog = useCallback(
    (blockId: string, exId: string, setId: string) => {
      if (!session) return;
      const block = session.blocks.find((b) => b.id === blockId);
      const exercise = block?.exercises.find((ex) => ex.id === exId);
      const setIndex = exercise?.sets.findIndex((s) => s.id === setId) ?? -1;
      if (!block || !exercise || setIndex < 0) return;
      const set = exercise.sets[setIndex];

      if (set.logged) {
        updateSet(blockId, exId, setId, { logged: false, isPR: false, estimatedOneRepMax: undefined });
        return;
      }

      // Resolve effective values: typed input → placeholder (last performance) → target
      const ph = placeholderForIndex(lastSetsByExercise.get(exercise.exerciseId) ?? [], setIndex, set, unit);
      const reps = parseIntInput(set.reps) ?? ph.reps;
      const weightDisplay = parseFloatInput(set.weight) ?? ph.weight;
      const weightLbs =
        weightDisplay != null ? (unit === 'kg' ? kgToLbs(weightDisplay) : weightDisplay) : undefined;

      let est: number | undefined;
      let isPR = false;
      if (set.setType !== 'warmup' && weightLbs != null && reps != null) {
        est = estimateOneRepMax(weightLbs, reps);
        const prior = Math.max(
          useWorkoutStore.getState().bestOneRepMax(exercise.exerciseId),
          sessionBest(exercise.exerciseId),
        );
        if (est > prior) {
          isPR = true;
          const name = exerciseById(exercise.exerciseId)?.name ?? 'Exercise';
          toast('pr', `New PR: ${name} — est. 1RM ${formatWeight(est, unit)}`);
        }
      }

      updateSet(blockId, exId, setId, {
        logged: true,
        isPR,
        estimatedOneRepMax: est,
        reps: reps != null ? String(reps) : set.reps,
        weight: weightDisplay != null ? String(weightDisplay) : set.weight,
      });

      const restSeconds = block.restBetweenSetsSeconds || settings.defaultRestSeconds;
      countdown.start(restSeconds);
      setRestTotal(restSeconds);
    },
    [session, unit, lastSetsByExercise, sessionBest, updateSet, exerciseById, settings.defaultRestSeconds, countdown],
  );

  const addSet = useCallback(
    (blockId: string, exId: string) => {
      updateBlocks((blocks) =>
        blocks.map((b) =>
          b.id !== blockId
            ? b
            : {
                ...b,
                exercises: b.exercises.map((ex) => {
                  if (ex.id !== exId) return ex;
                  const last = ex.sets[ex.sets.length - 1];
                  return {
                    ...ex,
                    sets: [
                      ...ex.sets,
                      emptySet(
                        last
                          ? {
                              setType: last.setType,
                              targetReps: last.targetReps,
                              targetRepsMax: last.targetRepsMax,
                              targetWeight: last.targetWeight,
                              targetRPE: last.targetRPE,
                              targetDurationSeconds: last.targetDurationSeconds,
                            }
                          : undefined,
                      ),
                    ],
                  };
                }),
              },
        ),
      );
    },
    [updateBlocks],
  );

  const removeSet = useCallback(
    (blockId: string, exId: string, setId: string) => {
      updateBlocks((blocks) =>
        blocks.map((b) =>
          b.id !== blockId
            ? b
            : {
                ...b,
                exercises: b.exercises.map((ex) =>
                  ex.id !== exId ? ex : { ...ex, sets: ex.sets.filter((s) => s.id !== setId) },
                ),
              },
        ),
      );
    },
    [updateBlocks],
  );

  const removeExercise = useCallback(
    (blockId: string, exId: string) => {
      updateBlocks((blocks) =>
        blocks
          .map((b) =>
            b.id !== blockId ? b : { ...b, exercises: b.exercises.filter((ex) => ex.id !== exId) },
          )
          .filter((b) => b.exercises.length > 0),
      );
    },
    [updateBlocks],
  );

  const addExercise = useCallback(
    (exercise: Exercise) => {
      updateBlocks((blocks) => [
        ...blocks,
        {
          id: crypto.randomUUID(),
          type: 'straight',
          restBetweenSetsSeconds: settings.defaultRestSeconds,
          exercises: [
            {
              id: crypto.randomUUID(),
              exerciseId: exercise.id,
              notes: '',
              sets: [emptySet(), emptySet(), emptySet()],
            },
          ],
        },
      ]);
      setShowAddExercise(false);
      setExerciseQuery('');
    },
    [updateBlocks, settings.defaultRestSeconds],
  );

  const loggedCount = useMemo(() => {
    if (!session) return 0;
    return session.blocks.reduce(
      (acc, b) => acc + b.exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.logged).length, 0),
      0,
    );
  }, [session]);

  const unloggedCount = useMemo(() => {
    if (!session) return 0;
    return session.blocks.reduce(
      (acc, b) => acc + b.exercises.reduce((a, ex) => a + ex.sets.filter((s) => !s.logged).length, 0),
      0,
    );
  }, [session]);

  const finishWorkout = useCallback(async () => {
    if (!session || saving) return;
    if (loggedCount === 0) {
      toast('error', 'No sets logged yet — log at least one set to finish.');
      setShowFinishConfirm(false);
      return;
    }
    setSaving(true);
    try {
      const endTime = new Date();
      const workoutId = crypto.randomUUID();

      interface PRDraft {
        exerciseId: string;
        weight?: number;
        reps?: number;
        estimatedOneRepMax?: number;
      }
      const prDrafts: PRDraft[] = [];

      const exerciseBlocks: CompletedBlock[] = session.blocks
        .map((b) => ({
          id: b.id,
          type: b.type,
          exercises: b.exercises
            .map((ex) => ({
              id: ex.id,
              exerciseId: ex.exerciseId,
              notes: ex.notes,
              sets: ex.sets
                .filter((s) => s.logged)
                .map((s): CompletedSet => {
                  const weightDisplay = parseFloatInput(s.weight);
                  const weightLbs =
                    weightDisplay != null
                      ? unit === 'kg'
                        ? kgToLbs(weightDisplay)
                        : weightDisplay
                      : undefined;
                  const reps = parseIntInput(s.reps);
                  if (s.isPR) {
                    prDrafts.push({
                      exerciseId: ex.exerciseId,
                      weight: weightLbs,
                      reps,
                      estimatedOneRepMax: s.estimatedOneRepMax,
                    });
                  }
                  return {
                    id: s.id,
                    setType: s.setType,
                    reps,
                    weight: weightLbs,
                    rpe: parseFloatInput(s.rpe),
                    isPR: s.isPR,
                    estimatedOneRepMax: s.estimatedOneRepMax,
                  };
                }),
            }))
            .filter((ex) => ex.sets.length > 0),
        }))
        .filter((b) => b.exercises.length > 0);

      const allSets = exerciseBlocks.flatMap((b) => b.exercises.flatMap((ex) => ex.sets));
      const workout: CompletedWorkout = {
        id: workoutId,
        templateId: session.templateId,
        name: session.name.trim() || 'Workout',
        date: session.startTime,
        startTime: session.startTime,
        endTime,
        durationMinutes: Math.max(
          1,
          Math.round((endTime.getTime() - session.startTime.getTime()) / 60000),
        ),
        exerciseBlocks,
        totalVolume: calculateVolume(allSets),
        totalSets: allSets.length,
        notes: session.notes,
        sessionRPE: session.sessionRPE ? Number(session.sessionRPE) : undefined,
      };

      const store = useWorkoutStore.getState();
      await store.saveCompleted(workout);
      for (const pr of prDrafts) {
        await store.savePR({
          id: crypto.randomUUID(),
          exerciseId: pr.exerciseId,
          date: endTime,
          value: pr.weight ?? pr.estimatedOneRepMax ?? 0,
          reps: pr.reps,
          estimatedOneRepMax: pr.estimatedOneRepMax,
          workoutId,
        });
      }
      if (session.templateId) {
        const tpl = store.templates.find((t) => t.id === session.templateId);
        if (tpl) {
          await store.saveTemplate({ ...tpl, lastUsed: new Date(), timesUsed: tpl.timesUsed + 1 });
        }
      }

      countdown.skip();
      toast('success', `Workout saved — ${allSets.length} sets, ${formatWeight(workout.totalVolume, unit)} total volume`);
      navigate(`/workouts/${workoutId}`);
    } finally {
      setSaving(false);
    }
  }, [session, saving, loggedCount, unit, countdown, navigate]);

  const discard = useCallback(() => {
    countdown.skip();
    setSession(null);
    setShowDiscardConfirm(false);
    setSearchParams({}, { replace: true });
    toast('info', 'Workout discarded');
  }, [countdown, setSearchParams]);

  // ---------- Start screen ----------
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-text-primary">Log Workout</h1>
        </div>
        <Card>
          <CardHeader title="Start from a template" />
          <TemplatePicker onPick={(t) => setSession(sessionFromTemplate(t))} />
        </Card>
        <Card>
          <CardHeader title="Or go freestyle" />
          <Button variant="secondary" onClick={startFromScratch} className="w-full">
            <Zap size={15} /> Start from Scratch
          </Button>
        </Card>
      </div>
    );
  }

  // ---------- Active session ----------
  const filteredExercises = exerciseQuery.trim()
    ? exercises.filter((e) => e.name.toLowerCase().includes(exerciseQuery.trim().toLowerCase()))
    : exercises;

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Workout Name"
              value={session.name}
              onChange={(e) => setSession((s) => (s ? { ...s, name: e.target.value } : s))}
            />
          </div>
          <div>
            <span className="section-label block mb-1.5">Elapsed</span>
            <div className="font-mono font-bold text-2xl text-text-primary tabular-nums leading-9">
              {formatDuration(elapsed)}
            </div>
          </div>
          <div className="w-28">
            <Select
              label="Session RPE"
              value={session.sessionRPE}
              onChange={(e) => setSession((s) => (s ? { ...s, sessionRPE: e.target.value } : s))}
              options={RPE_OPTIONS}
              placeholder="—"
              className="font-mono"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="text-xs text-text-secondary">
            <span className="font-mono font-bold text-text-primary">{loggedCount}</span> sets logged
            {unloggedCount > 0 && (
              <>
                {' '}· <span className="font-mono">{unloggedCount}</span> remaining
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={() => setShowDiscardConfirm(true)}>
              <Trash2 size={13} /> Discard
            </Button>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => {
                if (unloggedCount > 0) setShowFinishConfirm(true);
                else void finishWorkout();
              }}
            >
              <Flag size={13} /> Finish Workout
            </Button>
          </div>
        </div>
      </Card>

      {/* Exercise blocks */}
      {session.blocks.length === 0 && (
        <Card>
          <div className="text-center py-6 text-sm text-text-secondary">
            Empty workout — add your first exercise below.
          </div>
        </Card>
      )}
      {session.blocks.map((block) => (
        <Card key={block.id}>
          {block.type !== 'straight' && (
            <div className="mb-3">
              <Badge color={block.type === 'superset' ? 'purple' : 'blue'}>{block.type}</Badge>
            </div>
          )}
          <div className="space-y-5">
            {block.exercises.map((ex) => (
              <SetTable
                key={ex.id}
                exerciseName={exerciseById(ex.exerciseId)?.name ?? 'Unknown exercise'}
                draft={ex}
                weightUnit={unit}
                lastSets={lastSetsByExercise.get(ex.exerciseId) ?? []}
                onUpdateSet={(setId, patch) => updateSet(block.id, ex.id, setId, patch)}
                onToggleLog={(setId) => toggleLog(block.id, ex.id, setId)}
                onAddSet={() => addSet(block.id, ex.id)}
                onRemoveSet={(setId) => removeSet(block.id, ex.id, setId)}
                onRemoveExercise={() => removeExercise(block.id, ex.id)}
              />
            ))}
          </div>
        </Card>
      ))}

      <Button variant="secondary" onClick={() => setShowAddExercise(true)} className="w-full">
        <Plus size={15} /> Add Exercise
      </Button>

      <Card>
        <CardHeader title="Notes" />
        <Textarea
          value={session.notes}
          placeholder="How did it go?"
          onChange={(e) => setSession((s) => (s ? { ...s, notes: e.target.value } : s))}
        />
      </Card>

      <RestTimer
        remaining={countdown.remaining}
        running={countdown.running}
        total={restTotal}
        onExtend={() => {
          countdown.extend(30);
          setRestTotal((t) => t + 30);
        }}
        onSkip={countdown.skip}
      />

      {/* Add exercise modal */}
      <Modal open={showAddExercise} onClose={() => setShowAddExercise(false)} title="Add Exercise">
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              value={exerciseQuery}
              onChange={(e) => setExerciseQuery(e.target.value)}
              placeholder="Search exercises…"
              className="pl-9"
              autoFocus
            />
          </div>
          <ul className="divide-y divide-border max-h-80 overflow-y-auto">
            {filteredExercises.slice(0, 40).map((e) => (
              <li key={e.id}>
                <button
                  onClick={() => addExercise(e)}
                  className="w-full flex items-center justify-between gap-2 px-1 py-2.5 text-left hover:bg-surface-alt/60 transition-colors rounded-sm"
                >
                  <span className="text-sm font-semibold text-text-primary">{e.name}</span>
                  <Badge>{e.category.replace('_', ' ')}</Badge>
                </button>
              </li>
            ))}
            {filteredExercises.length === 0 && (
              <li className="py-6 text-center text-sm text-text-secondary">
                <Dumbbell size={20} className="mx-auto mb-2 text-text-muted" />
                No exercises match “{exerciseQuery}”
              </li>
            )}
          </ul>
        </div>
      </Modal>

      {/* Finish confirm */}
      <Modal open={showFinishConfirm} onClose={() => setShowFinishConfirm(false)} title="Finish Workout?">
        <p className="text-sm text-text-secondary mb-4">
          You have <span className="font-mono font-bold text-text-primary">{unloggedCount}</span>{' '}
          unlogged {unloggedCount === 1 ? 'set' : 'sets'}. They will not be saved.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowFinishConfirm(false)}>
            Keep Logging
          </Button>
          <Button
            disabled={saving}
            onClick={() => {
              setShowFinishConfirm(false);
              void finishWorkout();
            }}
          >
            Finish Anyway
          </Button>
        </div>
      </Modal>

      {/* Discard confirm */}
      <Modal open={showDiscardConfirm} onClose={() => setShowDiscardConfirm(false)} title="Discard Workout?">
        <p className="text-sm text-text-secondary mb-4">
          This will throw away everything logged this session. This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDiscardConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={discard}>
            Discard Workout
          </Button>
        </div>
      </Modal>
    </div>
  );
}
