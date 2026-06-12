import { useMemo, useState } from 'react';
import { addDays, format, isSameDay, isToday, startOfDay, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useNutritionStore } from '../stores/nutritionStore';
import { macroTargets } from '../utils/nutritionCalc';
import { ProfileSetup } from '../components/nutrition/ProfileSetup';
import { MacroTargetsBar } from '../components/nutrition/MacroTargetsBar';
import { DailyTotalsBar } from '../components/nutrition/DailyTotalsBar';
import { FoodLog } from '../components/nutrition/FoodLog';
import { RecommendationsPanel } from '../components/nutrition/RecommendationsPanel';
import { PreferencesModal } from '../components/nutrition/PreferencesModal';
import { CaloriesTrendChart } from '../components/nutrition/CaloriesTrendChart';
import { totalsForEntries } from '../components/nutrition/recommend';

export function NutritionPage() {
  const { profile, logs, loaded } = useNutritionStore();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [prefsOpen, setPrefsOpen] = useState(false);

  const dayEntries = useMemo(
    () => logs.filter((l) => isSameDay(l.date, selectedDate)),
    [logs, selectedDate],
  );
  const consumed = useMemo(() => totalsForEntries(dayEntries), [dayEntries]);

  if (!loaded) {
    return (
      <div className="space-y-5">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  const targets = macroTargets(profile);

  return (
    <div className="space-y-5">
      <MacroTargetsBar profile={profile} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            aria-label="Previous day"
            onClick={() => setSelectedDate((d) => subDays(d, 1))}
          >
            <ChevronLeft size={14} />
          </Button>
          <div className="flex items-center gap-2 px-2 min-w-44 justify-center">
            <span className="font-mono text-sm font-bold text-text-primary">
              {format(selectedDate, 'EEE, MMM d')}
            </span>
            {isToday(selectedDate) && <Badge color="blue">Today</Badge>}
          </div>
          <Button
            variant="secondary"
            size="sm"
            aria-label="Next day"
            onClick={() => setSelectedDate((d) => addDays(d, 1))}
          >
            <ChevronRight size={14} />
          </Button>
          {!isToday(selectedDate) && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(startOfDay(new Date()))}>
              Today
            </Button>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={() => setPrefsOpen(true)}>
          <SlidersHorizontal size={13} /> Preferences
        </Button>
      </div>

      <DailyTotalsBar consumed={consumed} targets={targets} />

      <div className="grid gap-5 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2 space-y-5">
          <FoodLog date={selectedDate} entries={dayEntries} />
          <CaloriesTrendChart logs={logs} targetCalories={targets.calories} />
        </div>
        <RecommendationsPanel date={selectedDate} entries={dayEntries} targets={targets} />
      </div>

      <PreferencesModal open={prefsOpen} onClose={() => setPrefsOpen(false)} />
    </div>
  );
}
