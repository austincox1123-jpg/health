import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { useSettingsStore } from './stores/settingsStore';
import { useExerciseStore } from './stores/exerciseStore';
import { useWorkoutStore } from './stores/workoutStore';
import { usePlanStore } from './stores/planStore';
import { useMetricsStore } from './stores/metricsStore';
import { SkeletonCard } from './components/ui/Skeleton';
import { DashboardPage } from './pages/DashboardPage';
import { PlanPage } from './pages/PlanPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { WorkoutLoggerPage } from './pages/WorkoutLoggerPage';
import { WorkoutDetailPage } from './pages/WorkoutDetailPage';
import { ProgressPage } from './pages/ProgressPage';
import { LibraryPage } from './pages/LibraryPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      useSettingsStore.getState().load(),
      useExerciseStore.getState().load(),
      useWorkoutStore.getState().load(),
      usePlanStore.getState().load(),
      useMetricsStore.getState().load(),
    ]).then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-background p-6 grid grid-cols-2 gap-4 content-start">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/workouts/log" element={<WorkoutLoggerPage />} />
        <Route path="/workouts/:id" element={<WorkoutDetailPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
