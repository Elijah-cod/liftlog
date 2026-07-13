export const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "core",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type TrainingGoal = "strength" | "muscle" | "general";
export type TrainingLocation = "gym" | "home";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type Equipment =
  | "barbell"
  | "dumbbell"
  | "cable"
  | "machine"
  | "bodyweight"
  | "band"
  | "kettlebell"
  | "cardio";

export type MovementPattern =
  | "horizontal-push"
  | "vertical-push"
  | "horizontal-pull"
  | "vertical-pull"
  | "squat"
  | "hinge"
  | "lunge"
  | "isolation"
  | "carry"
  | "core"
  | "cardio"
  | "rehab";

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  canonicalName: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  pattern: MovementPattern;
  difficulty: ExperienceLevel;
  homeFriendly: boolean;
  isRehab: boolean;
  tutorialUrl: string;
  tutorialSource: "MuscleWiki" | "YouTube";
  formCues: string[];
  repRange: [number, number];
}

export interface TrainingProfile {
  goal: TrainingGoal;
  location: TrainingLocation;
  experience: ExperienceLevel;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  minutesPerSession: 30 | 45 | 60 | 75;
  age: number;
  heightCm: number;
  weightKg: number;
  availableEquipment: Equipment[];
  priorityMuscles: MuscleGroup[];
  limitations: string[];
}

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  muscle: MuscleGroup;
  equipment: Equipment;
  sets: number;
  repRange: [number, number];
  restSeconds: number;
  setType: "warmup" | "working" | "rehab" | "cardio";
  rationale: string;
  tutorialUrl: string;
}

export interface PlannedDay {
  id: string;
  name: string;
  focus: string;
  estimatedMinutes: number;
  exercises: PlannedExercise[];
}

export interface GeneratedPlan {
  name: string;
  summary: string;
  days: PlannedDay[];
  weeklySets: Record<MuscleGroup, number>;
  priorityNote: string;
  generatedAt: string;
}

export interface ProgressionInput {
  exerciseName: string;
  weight: number;
  completedReps: number;
  targetRange: [number, number];
  repsInReserve: 0 | 1 | 2 | 3 | 4;
  unit: "kg" | "lb";
  completedAllSets?: boolean;
  deload?: boolean;
}

export interface ProgressionGuidance {
  action: "add-weight" | "add-reps" | "hold" | "reduce" | "deload";
  nextWeight: number;
  nextRepTarget: number;
  headline: string;
  detail: string;
}
