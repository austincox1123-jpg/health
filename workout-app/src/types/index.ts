// ---------- Goals & Phases ----------

export type GoalType =
  | 'fat_loss' | 'strength' | 'hypertrophy' | 'endurance'
  | 'athletic_performance' | 'general_fitness' | 'power' | 'custom';

export type PhaseType =
  | 'base' | 'build' | 'hypertrophy' | 'strength' | 'peak'
  | 'power' | 'taper' | 'deload' | 'active_recovery' | 'custom';

export type SessionType = 'strength' | 'cardio' | 'hiit' | 'mobility' | 'rest' | 'active_recovery';
export type VolumeLevel = 'low' | 'moderate' | 'high' | 'very_high';
export type IntensityLevel = 'low' | 'moderate' | 'high' | 'maximal';
export type SetType = 'working' | 'warmup' | 'drop' | 'failure' | 'amrap';
export type BlockType = 'straight' | 'superset' | 'circuit';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AnnualPlan {
  id: string;
  name: string;
  year: number;
  primaryGoal: GoalType;
  createdAt: Date;
  quarters: QuarterBlock[];
  notes: string;
}

export interface QuarterBlock {
  id: string;
  annualPlanId: string;
  label: string;
  quarterNumber: 1 | 2 | 3 | 4;
  goal: GoalType;
  phases: Phase[];
  notes: string;
}

export interface Phase {
  id: string;
  quarterId: string;
  name: string;
  type: PhaseType;
  startDate: Date;
  endDate: Date;
  durationWeeks: number;
  targetVolumeLevel: VolumeLevel;
  targetIntensityLevel: IntensityLevel;
  weeklyTargetSessions: number;
  notes: string;
  weeks: WeekPlan[];
}

export interface WeekPlan {
  id: string;
  phaseId: string;
  weekNumber: number;
  startDate: Date;
  isDeload: boolean;
  targetVolume?: number;
  plannedSessions: PlannedSession[];
  notes: string;
}

export interface PlannedSession {
  id: string;
  weekId: string;
  dayOfWeek: DayOfWeek;
  workoutTemplateId?: string;
  label: string;
  sessionType: SessionType;
  notes: string;
}

export interface PlanEvent {
  id: string;
  date: Date;
  label: string;
}

// ---------- Workouts ----------

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  sessionType: 'strength' | 'cardio' | 'hiit' | 'mobility';
  estimatedDurationMinutes: number;
  exerciseBlocks: ExerciseBlock[];
  tags: string[];
  createdAt: Date;
  lastUsed?: Date;
  timesUsed: number;
}

export interface ExerciseBlock {
  id: string;
  type: BlockType;
  exercises: PlannedExercise[];
  restBetweenSetsSeconds: number;
  restAfterBlockSeconds: number;
  notes: string;
}

export interface PlannedExercise {
  id: string;
  exerciseId: string;
  sets: PlannedSet[];
  notes: string;
}

export interface PlannedSet {
  id: string;
  setType: SetType;
  targetReps?: number;
  targetRepsMax?: number;
  targetWeight?: number;
  targetRPE?: number;
  targetDurationSeconds?: number;
  targetDistance?: number;
}

export interface CompletedWorkout {
  id: string;
  templateId?: string;
  name: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  exerciseBlocks: CompletedBlock[];
  totalVolume: number;
  totalSets: number;
  notes: string;
  sessionRPE?: number;
  phaseId?: string;
  weekId?: string;
}

export interface CompletedBlock {
  id: string;
  type: BlockType;
  exercises: CompletedExercise[];
}

export interface CompletedExercise {
  id: string;
  exerciseId: string;
  sets: CompletedSet[];
  notes: string;
}

export interface CompletedSet {
  id: string;
  setType: SetType;
  reps?: number;
  weight?: number;
  rpe?: number;
  durationSeconds?: number;
  distance?: number;
  isPR: boolean;
  estimatedOneRepMax?: number;
}

// ---------- Exercises ----------

export type ExerciseCategory =
  | 'chest' | 'back' | 'shoulders' | 'biceps' | 'triceps'
  | 'forearms' | 'core' | 'quads' | 'hamstrings' | 'glutes'
  | 'calves' | 'full_body' | 'cardio' | 'olympic';

export type MuscleGroup =
  | 'pectorals' | 'lats' | 'rhomboids' | 'trapezius' | 'deltoids'
  | 'biceps' | 'triceps' | 'forearms' | 'abs' | 'obliques'
  | 'erector_spinae' | 'glutes' | 'quads' | 'hamstrings' | 'calves'
  | 'hip_flexors' | 'adductors' | 'abductors';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine'
  | 'smith_machine' | 'bodyweight' | 'resistance_band' | 'trx'
  | 'pull_up_bar' | 'bench' | 'box' | 'cardio_machine';

export type MovementPattern =
  | 'horizontal_push' | 'horizontal_pull' | 'vertical_push' | 'vertical_pull'
  | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation' | 'core_stability'
  | 'olympic' | 'plyometric' | 'cardio' | 'isolation';

export type Modality = 'strength' | 'cardio' | 'mobility' | 'plyometric';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  movementPattern: MovementPattern;
  modality: Modality;
  instructions: string[];
  tips: string[];
  isCustom: boolean;
  createdAt?: Date;
}

// ---------- Metrics & PRs ----------

export interface BodyMetrics {
  id: string;
  date: Date;
  weight?: number;
  bodyFatPercent?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    leftArm?: number;
    rightArm?: number;
    leftThigh?: number;
    rightThigh?: number;
  };
  notes: string;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  date: Date;
  value: number;
  reps?: number;
  estimatedOneRepMax?: number;
  workoutId: string;
}

// ---------- Settings ----------

export type WeightUnit = 'lbs' | 'kg';
export type WeekStart = 'monday' | 'sunday';
export type RPEDisplay = 'rpe' | 'rir';

export interface AppSettings {
  weightUnit: WeightUnit;
  weekStart: WeekStart;
  defaultRestSeconds: number;
  rpeDisplay: RPEDisplay;
  heightInches?: number;
}

export const DEFAULT_SETTINGS: AppSettings = {
  weightUnit: 'lbs',
  weekStart: 'monday',
  defaultRestSeconds: 90,
  rpeDisplay: 'rpe',
};

// ---------- Nutrition ----------

export type Allergen =
  | 'dairy' | 'gluten' | 'tree_nuts' | 'peanuts' | 'shellfish'
  | 'fish' | 'eggs' | 'soy' | 'sesame';

export type FoodCategory =
  | 'protein' | 'grain' | 'fruit' | 'vegetable' | 'dairy'
  | 'fat' | 'snack' | 'beverage' | 'meal';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  servingLabel: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  allergens: Allergen[];
  tags: string[];
  isCustom: boolean;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface NutritionLogEntry {
  id: string;
  date: Date;
  mealType: MealType;
  foodId?: string;
  name: string;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes: string;
}

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type NutritionGoal = 'cut' | 'maintain' | 'bulk';

export interface NutritionProfile {
  sex: 'male' | 'female';
  age: number;
  heightInches: number;
  weightLbs: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  /** grams of protein per lb of bodyweight (0.7–1.2 typical) */
  proteinPerLb: number;
}

export interface NutritionPreferences {
  allergens: Allergen[];
  /** free-text food names/keywords the user refuses to eat */
  dislikes: string[];
}

export const DEFAULT_NUTRITION_PREFS: NutritionPreferences = {
  allergens: [],
  dislikes: [],
};
