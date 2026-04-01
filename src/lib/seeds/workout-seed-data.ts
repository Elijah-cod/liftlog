import type { BlockRole, LoadType } from "@/lib/types";

export interface ExerciseSeed {
  id: string;
  name: string;
  subtitle: string;
  loadType: LoadType;
  mediaPath: string;
  perSide?: boolean;
}

export interface TemplateExerciseSeed {
  id: string;
  exerciseDefinitionId: string;
  plannedSets: number;
  restSeconds: number;
  sortOrder: number;
  blockKey?: string;
  blockRole?: BlockRole;
}

export interface TemplateSeed {
  id: string;
  workoutName: string;
  workoutLabel: string;
  exercises: TemplateExerciseSeed[];
}

export const exerciseSeeds: ExerciseSeed[] = [
  {
    id: "flat-dumbbell-press",
    name: "Flat Dumbbell Press",
    subtitle: "3 sets · 8-12 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "lat-pulldowns",
    name: "Lat Pulldowns",
    subtitle: "3 sets · 8-12 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    subtitle: "3 sets · 10-15 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "reverse-lunges",
    name: "Reverse Lunges (*knee friendly)",
    subtitle: "3 sets · 8-12 reps per side",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
    perSide: true,
  },
  {
    id: "rkc-plank",
    name: "RKC Plank",
    subtitle: "2 sets · 30-60 second holds",
    loadType: "timed",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "barbell-back-squat",
    name: "Barbell Back Squat Progression",
    subtitle: "3 sets · 6-10 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "barbell-deadlift",
    name: "Barbell Deadlift Progression",
    subtitle: "3 sets · 6-10 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "walking-lunges",
    name: "Walking Lunges (Quad Focused)",
    subtitle: "3 sets · 8-12 reps per side",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
    perSide: true,
  },
  {
    id: "seated-leg-extensions",
    name: "Seated Leg Extensions",
    subtitle: "3 sets · 10-15 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "reverse-crunches",
    name: "Reverse Crunches",
    subtitle: "3 sets · 10-20 reps",
    loadType: "bodyweight",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "low-incline-dumbbell-press",
    name: "Low Incline Dumbbell Press",
    subtitle: "3 sets · 8-12 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "seated-mid-chest-cable-fly",
    name: "Seated Mid-Chest Cable Fly",
    subtitle: "3 sets · 10-15 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "half-kneeling-cable-row",
    name: "Half-Kneeling Cable Row",
    subtitle: "3 sets · 10-15 reps per side",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
    perSide: true,
  },
  {
    id: "incline-dumbbell-overhead-extensions",
    name: "Incline Dumbbell Overhead Extensions",
    subtitle: "3 sets · 10-15 reps",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
  },
  {
    id: "dumbbell-preacher-curl",
    name: "Dumbbell Preacher Curl",
    subtitle: "3 sets · 8-12 reps per side",
    loadType: "weighted",
    mediaPath: "/media/exercise-placeholder.svg",
    perSide: true,
  },
];

export const templateSeeds: TemplateSeed[] = [
  {
    id: "workout-a",
    workoutName: "Workout A",
    workoutLabel: "Upper",
    exercises: [
      { id: "a-1", exerciseDefinitionId: "flat-dumbbell-press", plannedSets: 3, restSeconds: 120, sortOrder: 1 },
      { id: "a-2", exerciseDefinitionId: "lat-pulldowns", plannedSets: 3, restSeconds: 90, sortOrder: 2, blockKey: "a-s1", blockRole: "A" },
      { id: "a-3", exerciseDefinitionId: "dumbbell-romanian-deadlift", plannedSets: 3, restSeconds: 90, sortOrder: 3, blockKey: "a-s1", blockRole: "B" },
      { id: "a-4", exerciseDefinitionId: "reverse-lunges", plannedSets: 3, restSeconds: 60, sortOrder: 4 },
      { id: "a-5", exerciseDefinitionId: "rkc-plank", plannedSets: 2, restSeconds: 60, sortOrder: 5 },
    ],
  },
  {
    id: "workout-b",
    workoutName: "Workout B",
    workoutLabel: "Lower",
    exercises: [
      { id: "b-1", exerciseDefinitionId: "barbell-back-squat", plannedSets: 3, restSeconds: 120, sortOrder: 1 },
      { id: "b-2", exerciseDefinitionId: "barbell-deadlift", plannedSets: 3, restSeconds: 120, sortOrder: 2 },
      { id: "b-3", exerciseDefinitionId: "walking-lunges", plannedSets: 3, restSeconds: 60, sortOrder: 3 },
      { id: "b-4", exerciseDefinitionId: "seated-leg-extensions", plannedSets: 3, restSeconds: 90, sortOrder: 4 },
      { id: "b-5", exerciseDefinitionId: "reverse-crunches", plannedSets: 3, restSeconds: 60, sortOrder: 5 },
    ],
  },
  {
    id: "workout-c",
    workoutName: "Workout C",
    workoutLabel: "Pull",
    exercises: [
      { id: "c-1", exerciseDefinitionId: "low-incline-dumbbell-press", plannedSets: 3, restSeconds: 120, sortOrder: 1 },
      { id: "c-2", exerciseDefinitionId: "seated-mid-chest-cable-fly", plannedSets: 3, restSeconds: 90, sortOrder: 2 },
      { id: "c-3", exerciseDefinitionId: "lat-pulldowns", plannedSets: 3, restSeconds: 90, sortOrder: 3 },
      { id: "c-4", exerciseDefinitionId: "half-kneeling-cable-row", plannedSets: 3, restSeconds: 90, sortOrder: 4 },
      { id: "c-5", exerciseDefinitionId: "incline-dumbbell-overhead-extensions", plannedSets: 3, restSeconds: 90, sortOrder: 5, blockKey: "c-s1", blockRole: "A" },
      { id: "c-6", exerciseDefinitionId: "dumbbell-preacher-curl", plannedSets: 3, restSeconds: 90, sortOrder: 6, blockKey: "c-s1", blockRole: "B" },
    ],
  },
];

