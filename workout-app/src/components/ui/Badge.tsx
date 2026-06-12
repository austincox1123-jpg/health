import type { ReactNode } from 'react';

type BadgeColor = 'blue' | 'purple' | 'orange' | 'red' | 'yellow' | 'green' | 'gray';

const colorClasses: Record<BadgeColor, string> = {
  blue: 'bg-accent/15 text-accent border-accent/40',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
  orange: 'bg-accent-alt/15 text-accent-alt border-accent-alt/40',
  red: 'bg-danger/15 text-danger border-danger/40',
  yellow: 'bg-warning/15 text-warning border-warning/40',
  green: 'bg-success/15 text-success border-success/40',
  gray: 'bg-surface-alt text-text-secondary border-border',
};

export function Badge({ color = 'gray', children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-label whitespace-nowrap ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}

export function sessionTypeColor(type: string): BadgeColor {
  switch (type) {
    case 'strength': return 'orange';
    case 'cardio': return 'blue';
    case 'hiit': return 'red';
    case 'mobility': return 'purple';
    case 'active_recovery': return 'green';
    case 'rest': return 'gray';
    default: return 'gray';
  }
}

export function phaseTypeColor(type: string): BadgeColor {
  switch (type) {
    case 'base': return 'blue';
    case 'build':
    case 'hypertrophy': return 'purple';
    case 'strength': return 'orange';
    case 'peak':
    case 'power': return 'red';
    case 'taper': return 'yellow';
    case 'deload':
    case 'active_recovery': return 'green';
    default: return 'gray';
  }
}
