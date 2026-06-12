import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Plus, SearchX } from 'lucide-react';
import type { Exercise } from '../types';
import { useExerciseStore } from '../stores/exerciseStore';
import { useWorkoutStore } from '../stores/workoutStore';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';
import { ExerciseCard } from '../components/library/ExerciseCard';
import { ExerciseDetailPanel } from '../components/library/ExerciseDetailPanel';
import { CustomExerciseModal } from '../components/library/CustomExerciseModal';
import {
  EMPTY_FILTERS,
  ExerciseFilters,
  type LibraryFilters,
} from '../components/library/ExerciseFilters';

export function LibraryPage() {
  const { exercises, loaded, load } = useExerciseStore();
  const workoutsLoaded = useWorkoutStore((s) => s.loaded);
  const loadWorkouts = useWorkoutStore((s) => s.load);

  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!loaded) void load();
    if (!workoutsLoaded) void loadWorkouts();
  }, [loaded, load, workoutsLoaded, loadWorkouts]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (
        filters.muscleGroup &&
        !ex.muscleGroups.includes(filters.muscleGroup as Exercise['muscleGroups'][number])
      )
        return false;
      if (
        filters.equipment &&
        !ex.equipment.includes(filters.equipment as Exercise['equipment'][number])
      )
        return false;
      if (filters.movementPattern && ex.movementPattern !== filters.movementPattern) return false;
      if (filters.modality && ex.modality !== filters.modality) return false;
      return true;
    });
  }, [exercises, filters]);

  // Resolve from the store so the panel reflects live data (e.g. after deletion).
  const selected = selectedId ? exercises.find((e) => e.id === selectedId) ?? null : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="section-label">Exercise Library</h1>
          <p className="text-xl font-extrabold text-text-primary">Exercises</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} /> Add Exercise
        </Button>
      </div>

      <ExerciseFilters filters={filters} onChange={setFilters} resultCount={filtered.length} />

      {!loaded ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        exercises.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            headline="No exercises in the library"
            description="Add your first custom exercise to start building workouts."
            action={
              <Button onClick={() => setAddOpen(true)}>
                <Plus size={16} /> Add Exercise
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={SearchX}
            headline="No exercises match"
            description="Try a different search term or clear the active filters."
            action={
              <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear Filters
              </Button>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((ex) => (
            <ExerciseCard key={ex.id} exercise={ex} onSelect={(e) => setSelectedId(e.id)} />
          ))}
        </div>
      )}

      {selected && <ExerciseDetailPanel exercise={selected} onClose={() => setSelectedId(null)} />}

      <CustomExerciseModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
