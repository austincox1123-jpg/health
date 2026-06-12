import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ClipboardList, Copy, History, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, sessionTypeColor } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { EmptyState } from '../components/ui/EmptyState';
import { TemplateBuilder } from '../components/workout/TemplateBuilder';
import { useWorkoutStore } from '../stores/workoutStore';
import { useSettingsStore } from '../stores/settingsStore';
import { toast } from '../stores/toastStore';
import { formatWeight } from '../utils/calculations';
import type { WorkoutTemplate } from '../types';

type WorkoutsTab = 'templates' | 'history';

const SESSION_TYPE_FILTER_OPTIONS = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'mobility', label: 'Mobility' },
];

function exerciseCount(t: WorkoutTemplate): number {
  return t.exerciseBlocks.reduce((acc, b) => acc + b.exercises.length, 0);
}

export function WorkoutsPage() {
  const navigate = useNavigate();
  const { templates, completed, saveTemplate, deleteTemplate, deleteCompleted } = useWorkoutStore();
  const weightUnit = useSettingsStore((s) => s.settings.weightUnit);

  const [tab, setTab] = useState<WorkoutsTab>('templates');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<WorkoutTemplate | null>(null);

  const allTags = useMemo(
    () => [...new Set(templates.flatMap((t) => t.tags))].sort((a, b) => a.localeCompare(b)),
    [templates],
  );

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (q && !t.name.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
        return false;
      if (typeFilter && t.sessionType !== typeFilter) return false;
      if (tagFilter && !t.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [templates, search, typeFilter, tagFilter]);

  const openNew = () => {
    setEditing(null);
    setBuilderOpen(true);
  };

  const openEdit = (t: WorkoutTemplate) => {
    setEditing(t);
    setBuilderOpen(true);
  };

  const duplicateTemplate = async (t: WorkoutTemplate) => {
    const clone: WorkoutTemplate = {
      ...t,
      id: crypto.randomUUID(),
      name: `${t.name} (Copy)`,
      createdAt: new Date(),
      lastUsed: undefined,
      timesUsed: 0,
      exerciseBlocks: t.exerciseBlocks.map((b) => ({
        ...b,
        id: crypto.randomUUID(),
        exercises: b.exercises.map((ex) => ({
          ...ex,
          id: crypto.randomUUID(),
          sets: ex.sets.map((s) => ({ ...s, id: crypto.randomUUID() })),
        })),
      })),
    };
    await saveTemplate(clone);
    toast('success', `Duplicated "${t.name}"`);
  };

  const removeTemplate = async (t: WorkoutTemplate) => {
    if (!window.confirm(`Delete template "${t.name}"? This cannot be undone.`)) return;
    await deleteTemplate(t.id);
    toast('info', `Deleted "${t.name}"`);
  };

  const removeCompleted = async (id: string, name: string) => {
    if (!window.confirm(`Delete workout "${name}"? This cannot be undone.`)) return;
    await deleteCompleted(id);
    toast('info', `Deleted "${name}"`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold text-text-primary">Workouts</h1>
          <Tabs<WorkoutsTab>
            tabs={[
              { value: 'templates', label: 'Templates' },
              { value: 'history', label: 'History' },
            ]}
            active={tab}
            onChange={setTab}
          />
        </div>
        {tab === 'templates' && (
          <Button onClick={openNew}>
            <Plus size={14} /> New Template
          </Button>
        )}
      </div>

      {tab === 'templates' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates…"
              />
            </div>
            <div className="w-36">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={SESSION_TYPE_FILTER_OPTIONS}
                placeholder="All types"
              />
            </div>
            <div className="w-36">
              <Select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                options={allTags.map((t) => ({ value: t, label: t }))}
                placeholder="All tags"
              />
            </div>
          </div>

          {filteredTemplates.length === 0 ? (
            <Card>
              <EmptyState
                icon={ClipboardList}
                headline={templates.length === 0 ? 'No templates yet' : 'No matching templates'}
                description={
                  templates.length === 0
                    ? 'Build a reusable workout template to start training faster.'
                    : 'Try a different search or clear the filters.'
                }
                action={
                  templates.length === 0 ? (
                    <Button onClick={openNew}>
                      <Plus size={14} /> New Template
                    </Button>
                  ) : undefined
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTemplates.map((t) => (
                <Card key={t.id} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-extrabold text-text-primary truncate">{t.name}</h3>
                      {t.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </div>
                    <Badge color={sessionTypeColor(t.sessionType)}>{t.sessionType}</Badge>
                  </div>

                  <table className="w-full text-xs">
                    <tbody>
                      <tr>
                        <td className="py-0.5 text-[10px] font-bold uppercase tracking-label text-text-secondary">
                          Est. Duration
                        </td>
                        <td className="py-0.5 text-right font-mono text-text-primary">
                          {t.estimatedDurationMinutes} min
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-[10px] font-bold uppercase tracking-label text-text-secondary">
                          Exercises
                        </td>
                        <td className="py-0.5 text-right font-mono text-text-primary">
                          {exerciseCount(t)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-[10px] font-bold uppercase tracking-label text-text-secondary">
                          Last Used
                        </td>
                        <td className="py-0.5 text-right font-mono text-text-primary">
                          {t.lastUsed ? format(t.lastUsed, 'MMM d, yyyy') : '—'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-0.5 text-[10px] font-bold uppercase tracking-label text-text-secondary">
                          Times Used
                        </td>
                        <td className="py-0.5 text-right font-mono text-text-primary">{t.timesUsed}</td>
                      </tr>
                    </tbody>
                  </table>

                  {t.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-border">
                    <Button size="sm" onClick={() => navigate(`/workouts/log?template=${t.id}`)}>
                      <Play size={12} /> Start
                    </Button>
                    <div className="flex items-center gap-1 ml-auto">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)} aria-label="Edit template">
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void duplicateTemplate(t)}
                        aria-label="Duplicate template"
                      >
                        <Copy size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void removeTemplate(t)}
                        aria-label="Delete template"
                        className="hover:!text-danger"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : completed.length === 0 ? (
        <Card>
          <EmptyState
            icon={History}
            headline="No completed workouts"
            description="Workouts you log will show up here with volume, sets, and session RPE."
          />
        </Card>
      ) : (
        <Card padded={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] font-bold uppercase tracking-label text-text-secondary">
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5">Workout</th>
                <th className="px-4 py-2.5 text-right">Duration</th>
                <th className="px-4 py-2.5 text-right">Volume</th>
                <th className="px-4 py-2.5 text-right">Sets</th>
                <th className="px-4 py-2.5 text-right">RPE</th>
                <th className="px-4 py-2.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {completed.map((w) => (
                <tr
                  key={w.id}
                  onClick={() => navigate(`/workouts/${w.id}`)}
                  className="border-b border-border/60 last:border-b-0 hover:bg-surface-alt cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-mono text-text-secondary whitespace-nowrap">
                    {format(w.date, 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-text-primary">{w.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-text-primary">
                    {w.durationMinutes} min
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-text-primary">
                    {formatWeight(w.totalVolume, weightUnit)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-text-primary">{w.totalSets}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-text-primary">
                    {w.sessionRPE ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeCompleted(w.id, w.name);
                      }}
                      className="text-text-muted hover:text-danger"
                      aria-label="Delete workout"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {builderOpen && (
        <TemplateBuilder
          key={editing?.id ?? 'new'}
          open={builderOpen}
          template={editing}
          onClose={() => setBuilderOpen(false)}
        />
      )}
    </div>
  );
}
