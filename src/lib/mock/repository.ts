import { formatISO } from "date-fns";

import { createMockDatabase, type MockDatabase } from "@/lib/mock/data";
import type {
  ScheduledWorkoutPreview,
  SessionExercise,
  TodayWorkoutSummary,
  WorkoutHistoryEntry,
  WorkoutSessionDetail,
  WorkoutSet,
} from "@/lib/types";
import {
  buildSessionWithProgress,
  compareMetricTrend,
  deriveTodayStatus,
} from "@/lib/session-utils";

declare global {
  var __liftlogMockDb: MockDatabase | undefined;
}

function getDb() {
  if (!globalThis.__liftlogMockDb) {
    globalThis.__liftlogMockDb = createMockDatabase();
  }

  return globalThis.__liftlogMockDb;
}

function getLatestCompletedExercise(exerciseDefinitionId: string) {
  const db = getDb();
  const sessions = [...db.sessions]
    .filter((session) => session.status === "completed")
    .sort((left, right) => right.completedAt!.localeCompare(left.completedAt!));

  for (const session of sessions) {
    const exercise = session.exercises.find(
      (entry) => entry.exerciseDefinitionId === exerciseDefinitionId,
    );

    if (exercise) {
      return exercise;
    }
  }

  return undefined;
}

function touchSession(session: WorkoutSessionDetail) {
  const updatedAt = new Date().toISOString();

  session.updatedAt = updatedAt;
  session.progress = buildSessionWithProgress(session).progress;
}

function createActiveSession(preview: ScheduledWorkoutPreview) {
  const db = getDb();
  const timestamp = new Date().toISOString();
  const sessionId = `session-${preview.id}`;

  const exercises = preview.exercises.map((templateExercise) => {
    const previousExercise = getLatestCompletedExercise(templateExercise.exerciseDefinitionId);

    const sets: WorkoutSet[] = Array.from({ length: templateExercise.plannedSets }, (_, index) => {
      const previousSet = previousExercise?.sets[index];
      const loadType = templateExercise.loadType;
      const weight = loadType === "weighted" ? previousSet?.weight ?? 10 + index * 2.5 : null;
      const reps =
        loadType === "timed" ? null : previousSet?.reps ?? (loadType === "bodyweight" ? 12 - index : 10);
      const durationSeconds =
        loadType === "timed" ? previousSet?.durationSeconds ?? 40 - index * 5 : null;

      const currentMetric = loadType === "timed" ? durationSeconds : reps;
      const previousMetric =
        loadType === "timed" ? previousSet?.durationSeconds ?? null : previousSet?.reps ?? null;

      return {
        id: `${sessionId}-${templateExercise.id}-set-${index + 1}`,
        setOrder: index + 1,
        setLabel: `${index + 1}${templateExercise.blockRole ?? ""}`,
        blockRole: templateExercise.blockRole,
        loadType,
        planned: true,
        isExtraSet: false,
        weight,
        reps,
        durationSeconds,
        completed: false,
        updatedAt: timestamp,
        previousWeight: previousSet?.weight ?? weight,
        previousReps: previousSet?.reps ?? reps,
        previousDurationSeconds: previousSet?.durationSeconds ?? durationSeconds,
        previousTrend: compareMetricTrend(currentMetric, previousMetric),
      };
    });

    return {
      id: `${sessionId}-${templateExercise.id}`,
      exerciseDefinitionId: templateExercise.exerciseDefinitionId,
      name: templateExercise.name,
      subtitle: templateExercise.subtitle,
      loadType: templateExercise.loadType,
      perSide: templateExercise.subtitle.includes("per side"),
      notes: "",
      noteUpdatedAt: timestamp,
      restSeconds: templateExercise.blockKey ? 90 : 120,
      sortOrder: templateExercise.sortOrder,
      blockKey: templateExercise.blockKey,
      blockRole: templateExercise.blockRole,
      plannedSets: templateExercise.plannedSets,
      mediaPath: templateExercise.mediaPath,
      sets,
    } satisfies SessionExercise;
  });

  const session: WorkoutSessionDetail = buildSessionWithProgress({
    id: sessionId,
    scheduledWorkoutId: preview.id,
    templateId: preview.templateId,
    workoutName: preview.workoutName,
    workoutLabel: preview.workoutLabel,
    status: "active",
    scheduledDate: preview.scheduledDate,
    startedAt: timestamp,
    completedAt: null,
    updatedAt: timestamp,
    unitPreference: db.user.unitPreference,
    user: db.user,
    exercises,
    progress: {
      completedExercises: 0,
      totalExercises: exercises.length,
      completedSets: 0,
      totalSets: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
    },
  });

  db.sessions.push(session);
  preview.status = "in_progress";
  preview.activeSessionId = session.id;

  return session;
}

export const mockWorkoutRepository = {
  async getTodayWorkout(): Promise<TodayWorkoutSummary | null> {
    const today = formatISO(new Date(), { representation: "date" });
    const preview = getDb().scheduledWorkouts.find((entry) => entry.scheduledDate === today);

    return preview ? deriveTodayStatus(preview) : null;
  },

  async listRecentSessions(filters?: {
    status?: WorkoutHistoryEntry["status"] | "all";
    query?: string;
    limit?: number;
  }) {
    const query = filters?.query?.trim().toLowerCase() ?? "";
    const status = filters?.status ?? "all";
    const limit = filters?.limit ?? 20;

    return [...getDb().sessions]
      .filter((session) => (status === "all" ? true : session.status === status))
      .filter((session) =>
        query.length === 0
          ? true
          : `${session.workoutName} ${session.workoutLabel}`.toLowerCase().includes(query),
      )
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .slice(0, limit)
      .map((session) => ({
        id: session.id,
        scheduledDate: session.scheduledDate,
        workoutName: session.workoutName,
        workoutLabel: session.workoutLabel,
        status: session.status,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        updatedAt: session.updatedAt,
        completedExercises: session.progress.completedExercises,
        totalExercises: session.progress.totalExercises,
        completedSets: session.progress.completedSets,
        totalSets: session.progress.totalSets,
      }));
  },

  async getScheduledWorkoutPreview(id: string) {
    return getDb().scheduledWorkouts.find((entry) => entry.id === id) ?? null;
  },

  async startWorkoutSession(id: string) {
    const preview = getDb().scheduledWorkouts.find((entry) => entry.id === id);

    if (!preview) {
      return null;
    }

    const existing = getDb().sessions.find(
      (session) =>
        session.scheduledWorkoutId === id &&
        (session.status === "draft" || session.status === "active" || session.status === "partial"),
    );

    if (existing) {
      preview.activeSessionId = existing.id;
      preview.status = existing.status === "partial" ? "partial" : "in_progress";
      return existing;
    }

    const completed = getDb().sessions.find(
      (session) => session.scheduledWorkoutId === id && session.status === "completed",
    );

    if (completed) {
      preview.activeSessionId = completed.id;
      preview.status = "completed";
      return completed;
    }

    return createActiveSession(preview);
  },

  async getSessionDetail(id: string) {
    return getDb().sessions.find((entry) => entry.id === id) ?? null;
  },

  async saveSessionSet(sessionId: string, setId: string, patch: Partial<WorkoutSet>) {
    const session = getDb().sessions.find((entry) => entry.id === sessionId);

    if (!session) {
      return null;
    }

    for (const exercise of session.exercises) {
      const set = exercise.sets.find((entry) => entry.id === setId);

      if (!set) {
        continue;
      }

      Object.assign(set, patch, {
        updatedAt: new Date().toISOString(),
      });

      touchSession(session);
      return session;
    }

    return null;
  },

  async saveExerciseNote(sessionId: string, sessionExerciseId: string, notes: string) {
    const session = getDb().sessions.find((entry) => entry.id === sessionId);

    if (!session) {
      return null;
    }

    const exercise = session.exercises.find((entry) => entry.id === sessionExerciseId);

    if (!exercise) {
      return null;
    }

    exercise.notes = notes;
    exercise.noteUpdatedAt = new Date().toISOString();
    touchSession(session);

    return session;
  },

  async addExtraSet(sessionId: string, sessionExerciseId: string) {
    const session = getDb().sessions.find((entry) => entry.id === sessionId);

    if (!session) {
      return null;
    }

    const exercise = session.exercises.find((entry) => entry.id === sessionExerciseId);

    if (!exercise) {
      return null;
    }

    const latestSet = exercise.sets[exercise.sets.length - 1];
    const nextOrder = latestSet ? latestSet.setOrder + 1 : 1;
    const timestamp = new Date().toISOString();

    exercise.sets.push({
      id: `${sessionExerciseId}-extra-${nextOrder}`,
      setOrder: nextOrder,
      setLabel: `${nextOrder}${exercise.blockRole ?? ""}`,
      blockRole: exercise.blockRole,
      loadType: exercise.loadType,
      planned: false,
      isExtraSet: true,
      weight: latestSet?.weight ?? null,
      reps: latestSet?.reps ?? null,
      durationSeconds: latestSet?.durationSeconds ?? null,
      completed: false,
      updatedAt: timestamp,
      previousWeight: latestSet?.previousWeight ?? null,
      previousReps: latestSet?.previousReps ?? null,
      previousDurationSeconds: latestSet?.previousDurationSeconds ?? null,
      previousTrend: latestSet?.previousTrend ?? null,
    });

    touchSession(session);
    return session;
  },

  async removeExtraSet(sessionId: string, setId: string) {
    const session = getDb().sessions.find((entry) => entry.id === sessionId);

    if (!session) {
      return null;
    }

    for (const exercise of session.exercises) {
      const setIndex = exercise.sets.findIndex((entry) => entry.id === setId);

      if (setIndex === -1) {
        continue;
      }

      if (!exercise.sets[setIndex]?.isExtraSet) {
        return session;
      }

      exercise.sets.splice(setIndex, 1);
      touchSession(session);
      return session;
    }

    return null;
  },

  async finishWorkoutSession(sessionId: string) {
    const session = getDb().sessions.find((entry) => entry.id === sessionId);

    if (!session) {
      return null;
    }

    const progress = buildSessionWithProgress(session).progress;
    const status =
      progress.completedExercises === progress.totalExercises ? "completed" : "partial";

    session.status = status;
    session.completedAt = new Date().toISOString();
    touchSession(session);

    const preview = getDb().scheduledWorkouts.find((entry) => entry.id === session.scheduledWorkoutId);

    if (preview) {
      preview.status = status;
      preview.activeSessionId = session.id;
    }

    return session;
  },
};
