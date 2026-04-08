import type {
  ScheduledWorkoutPreview,
  TodayWorkoutSummary,
  WorkoutHistoryEntry,
  WorkoutSessionDetail,
  WorkoutSet,
} from "@/lib/types";

export interface WorkoutRepository {
  getTodayWorkout: () => Promise<TodayWorkoutSummary | null>;
  listRecentSessions: (filters?: {
    status?: WorkoutHistoryEntry["status"] | "all";
    query?: string;
    limit?: number;
  }) => Promise<WorkoutHistoryEntry[]>;
  getScheduledWorkoutPreview: (id: string) => Promise<ScheduledWorkoutPreview | null>;
  startWorkoutSession: (id: string) => Promise<WorkoutSessionDetail | null>;
  getSessionDetail: (id: string) => Promise<WorkoutSessionDetail | null>;
  saveSessionSet: (
    sessionId: string,
    setId: string,
    patch: Partial<WorkoutSet>,
  ) => Promise<WorkoutSessionDetail | null>;
  saveExerciseNote: (
    sessionId: string,
    sessionExerciseId: string,
    notes: string,
  ) => Promise<WorkoutSessionDetail | null>;
  addExtraSet: (sessionId: string, sessionExerciseId: string) => Promise<WorkoutSessionDetail | null>;
  removeExtraSet: (sessionId: string, setId: string) => Promise<WorkoutSessionDetail | null>;
  finishWorkoutSession: (sessionId: string) => Promise<WorkoutSessionDetail | null>;
}
