import { addDays, formatISO, subDays } from "date-fns";

import type {
  BlockRole,
  LoadType,
  ScheduledWorkoutPreview,
  SessionExercise,
  UserProfile,
  WorkoutSessionDetail,
} from "@/lib/types";
import {
  buildProgress,
  buildSessionWithProgress,
  compareMetricTrend,
} from "@/lib/session-utils";

interface ExerciseSeed {
  id: string;
  name: string;
  subtitle: string;
  loadType: LoadType;
  mediaPath: string;
  perSide?: boolean;
}

interface TemplateExerciseSeed {
  id: string;
  exerciseDefinitionId: string;
  plannedSets: number;
  restSeconds: number;
  sortOrder: number;
  blockKey?: string;
  blockRole?: BlockRole;
}

interface TemplateSeed {
  id: string;
  workoutName: string;
  workoutLabel: string;
  exercises: TemplateExerciseSeed[];
}

const athlete: UserProfile = {
  id: "demo-athlete",
  fullName: "Elijah",
  avatarUrl: null,
  unitPreference: "kg",
};

const exerciseSeeds: ExerciseSeed[] = [
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

const templateSeeds: TemplateSeed[] = [
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

function getExerciseDefinition(exerciseId: string) {
  const exercise = exerciseSeeds.find((entry) => entry.id === exerciseId);

  if (!exercise) {
    throw new Error(`Unknown exercise: ${exerciseId}`);
  }

  return exercise;
}

function createIsoNow() {
  return formatISO(new Date());
}

function buildSetLabel(setOrder: number, blockRole: BlockRole) {
  return `${setOrder}${blockRole ?? ""}`;
}

function buildBaseValue(loadType: LoadType, setIndex: number) {
  if (loadType === "timed") {
    return {
      weight: null,
      reps: null,
      durationSeconds: setIndex === 0 ? 40 : 35,
    };
  }

  if (loadType === "bodyweight") {
    return {
      weight: null,
      reps: 12 - setIndex,
      durationSeconds: null,
    };
  }

  return {
    weight: 10 + setIndex * 2.5,
    reps: 12 - setIndex,
    durationSeconds: null,
  };
}

function createSessionExercise(
  templateExercise: TemplateExerciseSeed,
  previousExercise: SessionExercise | undefined,
): SessionExercise {
  const definition = getExerciseDefinition(templateExercise.exerciseDefinitionId);
  const updatedAt = createIsoNow();

  const sets = Array.from({ length: templateExercise.plannedSets }, (_, index) => {
    const previousSet = previousExercise?.sets[index];
    const defaults = buildBaseValue(definition.loadType, index);

    return {
      id: `${templateExercise.id}-set-${index + 1}`,
      setOrder: index + 1,
      setLabel: buildSetLabel(index + 1, templateExercise.blockRole ?? null),
      blockRole: templateExercise.blockRole ?? null,
      loadType: definition.loadType,
      planned: true,
      isExtraSet: false,
      weight: previousSet?.previousWeight ?? defaults.weight,
      reps: previousSet?.previousReps ?? defaults.reps,
      durationSeconds: previousSet?.previousDurationSeconds ?? defaults.durationSeconds,
      completed: false,
      updatedAt,
      previousWeight: previousSet?.previousWeight ?? defaults.weight,
      previousReps: previousSet?.previousReps ?? defaults.reps,
      previousDurationSeconds: previousSet?.previousDurationSeconds ?? defaults.durationSeconds,
      previousTrend: compareMetricTrend(
        definition.loadType === "timed"
          ? defaults.durationSeconds
          : definition.loadType === "bodyweight"
            ? defaults.reps
            : defaults.reps,
        previousSet?.previousReps ?? defaults.reps,
      ),
    };
  });

  return {
    id: `session-exercise-${templateExercise.id}`,
    exerciseDefinitionId: definition.id,
    name: definition.name,
    subtitle: definition.subtitle,
    loadType: definition.loadType,
    perSide: definition.perSide ?? false,
    notes: "",
    noteUpdatedAt: updatedAt,
    restSeconds: templateExercise.restSeconds,
    sortOrder: templateExercise.sortOrder,
    blockKey: templateExercise.blockKey ?? null,
    blockRole: templateExercise.blockRole ?? null,
    plannedSets: templateExercise.plannedSets,
    mediaPath: definition.mediaPath,
    sets,
  };
}

function createCompletedHistorySession(
  templateId: string,
  scheduledDate: string,
  sessionId: string,
): WorkoutSessionDetail {
  const template = templateSeeds.find((entry) => entry.id === templateId);

  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  const startedAt = formatISO(subDays(new Date(scheduledDate), 0));
  const completedAt = formatISO(new Date(`${scheduledDate}T19:30:00.000Z`));

  const exercises = template.exercises.map((templateExercise) => {
    const exercise = createSessionExercise(templateExercise, undefined);

    return {
      ...exercise,
      notes: "",
      sets: exercise.sets.map((set) => {
        const metricValue =
          exercise.loadType === "timed"
            ? set.durationSeconds
            : exercise.loadType === "bodyweight"
              ? set.reps
              : set.reps;
        const previousMetric =
          exercise.loadType === "timed"
            ? set.previousDurationSeconds
            : exercise.loadType === "bodyweight"
              ? set.previousReps
              : set.previousReps;

        return {
          ...set,
          completed: true,
          updatedAt: completedAt,
          previousWeight: set.weight,
          previousReps: set.reps,
          previousDurationSeconds: set.durationSeconds,
          previousTrend: compareMetricTrend(metricValue, previousMetric),
        };
      }),
    };
  });

  return buildSessionWithProgress({
    id: sessionId,
    scheduledWorkoutId: `scheduled-${templateId}-${scheduledDate}`,
    templateId: template.id,
    workoutName: template.workoutName,
    workoutLabel: template.workoutLabel,
    status: "completed",
    scheduledDate,
    startedAt,
    completedAt,
    updatedAt: completedAt,
    unitPreference: athlete.unitPreference,
    user: athlete,
    exercises,
    progress: buildProgress(exercises),
  });
}

export interface MockDatabase {
  user: UserProfile;
  scheduledWorkouts: ScheduledWorkoutPreview[];
  sessions: WorkoutSessionDetail[];
}

export function createMockDatabase(): MockDatabase {
  const now = new Date();
  const schedule = [
    {
      id: `scheduled-workout-a-${formatISO(subDays(now, 1), { representation: "date" })}`,
      templateId: "workout-a",
      scheduledDate: formatISO(subDays(now, 1), { representation: "date" }),
    },
    {
      id: `scheduled-workout-b-${formatISO(now, { representation: "date" })}`,
      templateId: "workout-b",
      scheduledDate: formatISO(now, { representation: "date" }),
    },
    {
      id: `scheduled-workout-c-${formatISO(addDays(now, 1), { representation: "date" })}`,
      templateId: "workout-c",
      scheduledDate: formatISO(addDays(now, 1), { representation: "date" }),
    },
  ];

  const historySessions = [
    createCompletedHistorySession(
      "workout-a",
      formatISO(subDays(now, 8), { representation: "date" }),
      "historic-session-a",
    ),
    createCompletedHistorySession(
      "workout-b",
      formatISO(subDays(now, 7), { representation: "date" }),
      "historic-session-b",
    ),
    createCompletedHistorySession(
      "workout-c",
      formatISO(subDays(now, 6), { representation: "date" }),
      "historic-session-c",
    ),
  ];

  const scheduledWorkouts = schedule.map((entry) => {
    const template = templateSeeds.find((templateEntry) => templateEntry.id === entry.templateId);

    if (!template) {
      throw new Error(`Unknown template: ${entry.templateId}`);
    }

    return {
      id: entry.id,
      templateId: template.id,
      scheduledDate: entry.scheduledDate,
      workoutName: template.workoutName,
      workoutLabel: template.workoutLabel,
      status: "scheduled" as const,
      exercises: template.exercises.map((templateExercise) => {
        const definition = getExerciseDefinition(templateExercise.exerciseDefinitionId);

        return {
          id: templateExercise.id,
          exerciseDefinitionId: definition.id,
          name: definition.name,
          subtitle: definition.subtitle,
          loadType: definition.loadType,
          sortOrder: templateExercise.sortOrder,
          blockKey: templateExercise.blockKey ?? null,
          blockRole: templateExercise.blockRole ?? null,
          plannedSets: templateExercise.plannedSets,
          mediaPath: definition.mediaPath,
        };
      }),
      activeSessionId: null,
    };
  });

  return {
    user: athlete,
    scheduledWorkouts,
    sessions: historySessions,
  };
}
