import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import {
  EQUIPMENT_OPTIONS,
  MODALITIES,
  MOVEMENT_PATTERNS,
  MUSCLE_GROUPS,
  toOptions,
} from './labels';

export interface LibraryFilters {
  search: string;
  muscleGroup: string;
  equipment: string;
  movementPattern: string;
  modality: string;
}

export const EMPTY_FILTERS: LibraryFilters = {
  search: '',
  muscleGroup: '',
  equipment: '',
  movementPattern: '',
  modality: '',
};

interface ExerciseFiltersProps {
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
  resultCount: number;
}

export function ExerciseFilters({ filters, onChange, resultCount }: ExerciseFiltersProps) {
  const set = (patch: Partial<LibraryFilters>) => onChange({ ...filters, ...patch });
  const hasActiveFilters =
    filters.search !== '' ||
    filters.muscleGroup !== '' ||
    filters.equipment !== '' ||
    filters.movementPattern !== '' ||
    filters.modality !== '';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="relative lg:col-span-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <Input
            type="search"
            placeholder="Search exercises…"
            aria-label="Search exercises"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            className="pl-8"
          />
        </div>
        <Select
          aria-label="Filter by muscle group"
          placeholder="All Muscles"
          options={toOptions(MUSCLE_GROUPS)}
          value={filters.muscleGroup}
          onChange={(e) => set({ muscleGroup: e.target.value })}
        />
        <Select
          aria-label="Filter by equipment"
          placeholder="All Equipment"
          options={toOptions(EQUIPMENT_OPTIONS)}
          value={filters.equipment}
          onChange={(e) => set({ equipment: e.target.value })}
        />
        <Select
          aria-label="Filter by movement pattern"
          placeholder="All Patterns"
          options={toOptions(MOVEMENT_PATTERNS)}
          value={filters.movementPattern}
          onChange={(e) => set({ movementPattern: e.target.value })}
        />
        <Select
          aria-label="Filter by modality"
          placeholder="All Modalities"
          options={toOptions(MODALITIES)}
          value={filters.modality}
          onChange={(e) => set({ modality: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-3">
        <p className="text-xs text-text-secondary">
          <span className="font-mono text-text-primary font-bold">{resultCount}</span>{' '}
          {resultCount === 1 ? 'exercise' : 'exercises'}
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
