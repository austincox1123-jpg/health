/** Shared Recharts dark-theme constants. */
export const CHART = {
  grid: '#2A2F3E',
  axis: '#94A3B8',
  accent: '#3B82F6',
  accentAlt: '#F97316',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  purple: '#8B5CF6',
  tooltip: {
    backgroundColor: '#1C2030',
    border: '1px solid #2A2F3E',
    borderRadius: 2,
    fontSize: 12,
    fontFamily: 'JetBrains Mono, monospace',
    color: '#F1F5F9',
  } as const,
};

export const MUSCLE_CATEGORY_COLORS: Record<string, string> = {
  chest: '#3B82F6',
  back: '#8B5CF6',
  shoulders: '#F97316',
  biceps: '#22C55E',
  triceps: '#14B8A6',
  forearms: '#84CC16',
  core: '#EAB308',
  quads: '#EF4444',
  hamstrings: '#EC4899',
  glutes: '#F43F5E',
  calves: '#A855F7',
  full_body: '#94A3B8',
  cardio: '#06B6D4',
  olympic: '#F59E0B',
};
