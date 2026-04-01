"use client";

import { create } from "zustand";

import { buildSessionWithProgress } from "@/lib/session-utils";
import type { SessionExercise, WorkoutSessionDetail, WorkoutSet } from "@/lib/types";

interface WorkoutSessionState {
  session: WorkoutSessionDetail | null;
  hydrated: boolean;
  setSession: (session: WorkoutSessionDetail) => void;
  hydrateDraft: (sessionId: string) => void;
  mergeServerSession: (session: WorkoutSessionDetail) => void;
  updateSet: (sessionExerciseId: string, setId: string, patch: Partial<WorkoutSet>) => void;
  updateNote: (sessionExerciseId: string, notes: string) => void;
  addOptimisticSet: (sessionExerciseId: string) => void;
  removeOptimisticSet: (setId: string) => void;
  persistDraft: () => void;
  clearDraft: () => void;
}

function draftKey(sessionId: string) {
  return `liftlog-session-${sessionId}`;
}

function mergeExercises(localExercises: SessionExercise[], serverExercises: SessionExercise[]) {
  return serverExercises.map((serverExercise) => {
    const localExercise = localExercises.find((entry) => entry.id === serverExercise.id);

    if (!localExercise) {
      return serverExercise;
    }

    const mergedSets = serverExercise.sets.map((serverSet) => {
      const localSet = localExercise.sets.find((entry) => entry.id === serverSet.id);

      if (!localSet) {
        return serverSet;
      }

      return new Date(localSet.updatedAt) > new Date(serverSet.updatedAt) ? localSet : serverSet;
    });

    return {
      ...serverExercise,
      notes:
        new Date(localExercise.noteUpdatedAt) > new Date(serverExercise.noteUpdatedAt)
          ? localExercise.notes
          : serverExercise.notes,
      noteUpdatedAt:
        new Date(localExercise.noteUpdatedAt) > new Date(serverExercise.noteUpdatedAt)
          ? localExercise.noteUpdatedAt
          : serverExercise.noteUpdatedAt,
      sets: mergedSets,
    };
  });
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  session: null,
  hydrated: false,
  setSession(session) {
    set({
      session: buildSessionWithProgress(session),
      hydrated: true,
    });
  },
  hydrateDraft(sessionId) {
    const raw = window.localStorage.getItem(draftKey(sessionId));

    if (!raw) {
      set({ hydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as WorkoutSessionDetail;
      set({
        session: buildSessionWithProgress(parsed),
        hydrated: true,
      });
    } catch {
      window.localStorage.removeItem(draftKey(sessionId));
      set({ hydrated: true });
    }
  },
  mergeServerSession(serverSession) {
    const local = get().session;

    if (!local || local.id !== serverSession.id) {
      set({
        session: buildSessionWithProgress(serverSession),
      });
      return;
    }

    set({
      session: buildSessionWithProgress({
        ...serverSession,
        exercises: mergeExercises(local.exercises, serverSession.exercises),
      }),
    });
  },
  updateSet(sessionExerciseId, setId, patch) {
    const current = get().session;

    if (!current) {
      return;
    }

    set({
      session: buildSessionWithProgress({
        ...current,
        updatedAt: new Date().toISOString(),
        exercises: current.exercises.map((exercise) => {
          if (exercise.id !== sessionExerciseId) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((entry) =>
              entry.id === setId
                ? { ...entry, ...patch, updatedAt: new Date().toISOString() }
                : entry,
            ),
          };
        }),
      }),
    });
  },
  updateNote(sessionExerciseId, notes) {
    const current = get().session;

    if (!current) {
      return;
    }

    set({
      session: buildSessionWithProgress({
        ...current,
        updatedAt: new Date().toISOString(),
        exercises: current.exercises.map((exercise) =>
          exercise.id === sessionExerciseId
            ? {
                ...exercise,
                notes,
                noteUpdatedAt: new Date().toISOString(),
              }
            : exercise,
        ),
      }),
    });
  },
  addOptimisticSet(sessionExerciseId) {
    const current = get().session;

    if (!current) {
      return;
    }

    set({
      session: buildSessionWithProgress({
        ...current,
        updatedAt: new Date().toISOString(),
        exercises: current.exercises.map((exercise) => {
          if (exercise.id !== sessionExerciseId) {
            return exercise;
          }

          const lastSet = exercise.sets[exercise.sets.length - 1];
          const nextOrder = lastSet ? lastSet.setOrder + 1 : 1;

          return {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: `${sessionExerciseId}-temp-${nextOrder}-${Date.now()}`,
                setOrder: nextOrder,
                setLabel: `${nextOrder}${exercise.blockRole ?? ""}`,
                blockRole: exercise.blockRole,
                loadType: exercise.loadType,
                planned: false,
                isExtraSet: true,
                weight: lastSet?.weight ?? null,
                reps: lastSet?.reps ?? null,
                durationSeconds: lastSet?.durationSeconds ?? null,
                completed: false,
                updatedAt: new Date().toISOString(),
                previousWeight: lastSet?.previousWeight ?? null,
                previousReps: lastSet?.previousReps ?? null,
                previousDurationSeconds: lastSet?.previousDurationSeconds ?? null,
                previousTrend: lastSet?.previousTrend ?? null,
              },
            ],
          };
        }),
      }),
    });
  },
  removeOptimisticSet(setId) {
    const current = get().session;

    if (!current) {
      return;
    }

    set({
      session: buildSessionWithProgress({
        ...current,
        updatedAt: new Date().toISOString(),
        exercises: current.exercises.map((exercise) => ({
          ...exercise,
          sets: exercise.sets.filter((entry) => entry.id !== setId),
        })),
      }),
    });
  },
  persistDraft() {
    const session = get().session;

    if (!session) {
      return;
    }

    window.localStorage.setItem(draftKey(session.id), JSON.stringify(session));
  },
  clearDraft() {
    const session = get().session;

    if (!session) {
      return;
    }

    window.localStorage.removeItem(draftKey(session.id));
  },
}));

