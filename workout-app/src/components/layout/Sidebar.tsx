import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CalendarRange, Dumbbell, TrendingUp, Library, Settings, Zap, Apple,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/plan', label: 'Plan', icon: CalendarRange },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-52 shrink-0 bg-surface border-r border-border flex flex-col min-h-screen sticky top-0 max-h-screen">
      <div className="px-5 py-5 border-b border-border flex items-center gap-2">
        <Zap size={20} className="text-accent" />
        <span className="font-extrabold tracking-label uppercase text-text-primary">Forge</span>
      </div>
      <nav className="flex-1 py-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm font-semibold transition-colors border-l-2 ${
                isActive
                  ? 'border-accent text-text-primary bg-surface-alt'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-alt/50'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-border text-[10px] text-text-muted uppercase tracking-label">
        Offline · Local data
      </div>
    </aside>
  );
}
