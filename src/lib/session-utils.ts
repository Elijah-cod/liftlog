import { addDays, differenceInSeconds, format, isSameDay, parseISO, subDays } from "date-fns";

import type {
  MetricTrend,
  ScheduledWorkoutPreview,
  SessionExercise,
  SessionProgress,
  TodayWorkoutSummary,
  WorkoutSessionDetail,
} from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export interface ExerciseGroup {
  id: string;
  blockKey: string | null;
  exercises: SessionExercise[];
  sortOrder: number;
}

export function buildProgress(exercises: SessionExercise[]): SessionProgress {
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((exercise) =>
    exercise.sets.length > 0 && exercise.sets.every((set) => set.completed),
  ).length;
  const totalSets = exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  );

  return {
    completedExercises,
    totalExercises,
    completedSets,
    totalSets,
  };
}

export function buildExerciseGroups(exercises: SessionExercise[]): ExerciseGroup[] {
  const groups = new Map<string, ExerciseGroup>();

  for (const exercise of exercises) {
    const groupId = exercise.blockKey ?? exercise.id;
    const current = groups.get(groupId);

    if (!current) {
      groups.set(groupId, {
        id: groupId,
        blockKey: exercise.blockKey,
        exercises: [exercise],
        sortOrder: exercise.sortOrder,
      });
      continue;
    }

    current.exercises.push(exercise);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      exercises: [...group.exercises].sort((left, right) => {
        if (left.blockRole === right.blockRole) {
          return left.sortOrder - right.sortOrder;
        }

        if (left.blockRole === "A") {
          return -1;
        }

        if (right.blockRole === "A") {
          return 1;
        }

        return left.sortOrder - right.sortOrder;
      }),
    }))
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

export function formatPreviousPerformance(exercise: SessionExercise, setIndex: number) {
  const set = exercise.sets[setIndex];

  if (!set) {
    return "-";
  }

  if (exercise.loadType === "timed") {
    return set.previousDurationSeconds ? `${set.previousDurationSeconds}s` : "-";
  }

  if (exercise.loadType === "bodyweight") {
    return set.previousReps ? `${set.previousReps} reps` : "-";
  }

  if (set.previousWeight === null && set.previousReps === null) {
    return "-";
  }

  return `${formatNumber(set.previousWeight)} x ${formatNumber(set.previousReps)}`;
}

export function formatWorkoutDate(date: string, now = new Date()) {
  const parsedDate = parseISO(date);

  if (isSameDay(parsedDate, now)) {
    return "Today's Workout";
  }

  if (isSameDay(parsedDate, subDays(now, 1))) {
    return "Yesterday's Workout";
  }

  if (isSameDay(parsedDate, addDays(now, 1))) {
    return "Tomorrow's Workout";
  }

  return format(parsedDate, "EEEE, MMM d");
}

export function formatSessionDateTime(dateTime: string) {
  return format(parseISO(dateTime), "MMM d, h:mm a");
}

export function formatSessionDuration(startedAt: string, endedAt: string | null) {
  const seconds = Math.max(
    0,
    differenceInSeconds(endedAt ? parseISO(endedAt) : parseISO(startedAt), parseISO(startedAt)),
  );

  if (seconds < 60) {
    return "<1m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function countExercisesWithNotes(exercises: SessionExercise[]) {
  return exercises.filter((exercise) => exercise.notes.trim().length > 0).length;
}

export function formatSetSummary(exercise: SessionExercise, setIndex: number) {
  const set = exercise.sets[setIndex];

  if (!set) {
    return "-";
  }

  if (exercise.loadType === "timed") {
    return `${set.durationSeconds ?? 0}s`;
  }

  if (exercise.loadType === "bodyweight") {
    return `${set.reps ?? 0} reps`;
  }

  return `${formatNumber(set.weight)} x ${formatNumber(set.reps)}`;
}

export function buildSessionWithProgress(session: WorkoutSessionDetail): WorkoutSessionDetail {
  return {
    ...session,
    progress: buildProgress(session.exercises),
  };
}

export function deriveTodayStatus(preview: ScheduledWorkoutPreview): TodayWorkoutSummary {
  return {
    scheduledWorkoutId: preview.id,
    templateId: preview.templateId,
    scheduledDate: preview.scheduledDate,
    workoutName: preview.workoutName,
    workoutLabel: preview.workoutLabel,
    status: preview.status,
    totalExercises: preview.exercises.length,
    activeSessionId: preview.activeSessionId,
    completedAt: null,
  };
}

export function compareMetricTrend(current: number | null, previous: number | null): MetricTrend {
  if (current === null || previous === null) {
    return null;
  }

  if (current === previous) {
    return "flat";
  }

  return current > previous ? "up" : "down";
}
