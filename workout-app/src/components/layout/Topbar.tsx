import { useLocation, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

const titles: [string, string][] = [
  ['/workouts/log', 'Live Workout'],
  ['/workouts', 'Workouts'],
  ['/plan', 'Periodization Plan'],
  ['/progress', 'Progress'],
  ['/library', 'Exercise Library'],
  ['/settings', 'Settings'],
  ['/', 'Dashboard'],
];

export function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = titles.find(([p]) => pathname.startsWith(p) && (p !== '/' || pathname === '/'))?.[1] ?? 'Dashboard';

  return (
    <header className="h-14 shrink-0 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-baseline gap-3">
        <h1 className="text-base font-extrabold uppercase tracking-label text-text-primary">{title}</h1>
        <span className="font-mono text-xs text-text-muted">{format(new Date(), 'EEE MMM d, yyyy')}</span>
      </div>
      {pathname !== '/workouts/log' && (
        <Button size="sm" onClick={() => navigate('/workouts/log')}>
          <Play size={14} /> Start Workout
        </Button>
      )}
    </header>
  );
}
