export type UnitPreference = "kg" | "lb";
export type LoadType = "weighted" | "bodyweight" | "timed";
export type SessionStatus = "draft" | "active" | "completed" | "partial";
export type BlockRole = "A" | "B" | null;
export type MetricTrend = "up" | "down" | "flat" | null;

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  unitPreference: UnitPreference;
}

export interface WorkoutSet {
  id: string;
  setOrder: number;
  setLabel: string;
  blockRole: BlockRole;
  loadType: LoadType;
  planned: boolean;
  isExtraSet: boolean;
  weight: number | null;
  reps: number | null;
  durationSeconds: number | null;
  completed: boolean;
  updatedAt: string;
  previousWeight: number | null;
  previousReps: number | null;
  previousDurationSeconds: number | null;
  previousTrend: MetricTrend;
}

export interface SessionExercise {
  id: string;
  exerciseDefinitionId: string;
  name: string;
  subtitle: string;
  loadType: LoadType;
  perSide: boolean;
  notes: string;
  noteUpdatedAt: string;
  restSeconds: number;
  sortOrder: number;
  blockKey: string | null;
  blockRole: BlockRole;
  plannedSets: number;
  mediaPath: string;
  sets: WorkoutSet[];
}

export interface SessionProgress {
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
}

export interface WorkoutSessionDetail {
  id: string;
  scheduledWorkoutId: string;
  templateId: string;
  workoutName: string;
  workoutLabel: string;
  status: SessionStatus;
  scheduledDate: string;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
  unitPreference: UnitPreference;
  user: UserProfile;
  exercises: SessionExercise[];
  progress: SessionProgress;
}

export interface WorkoutPreviewExercise {
  id: string;
  exerciseDefinitionId: string;
  name: string;
  subtitle: string;
  loadType: LoadType;
  sortOrder: number;
  blockKey: string | null;
  blockRole: BlockRole;
  plannedSets: number;
  mediaPath: string;
}

export interface ScheduledWorkoutPreview {
  id: string;
  templateId: string;
  scheduledDate: string;
  workoutName: string;
  workoutLabel: string;
  status: "scheduled" | "in_progress" | "completed" | "partial";
  exercises: WorkoutPreviewExercise[];
  activeSessionId: string | null;
}

export interface TodayWorkoutSummary {
  scheduledWorkoutId: string;
  templateId: string;
  scheduledDate: string;
  workoutName: string;
  workoutLabel: string;
  status: "scheduled" | "in_progress" | "completed" | "partial";
  totalExercises: number;
  activeSessionId: string | null;
  completedAt: string | null;
}

export interface WorkoutHistoryEntry {
  id: string;
  templateId: string;
  scheduledDate: string;
  workoutName: string;
  workoutLabel: string;
  status: SessionStatus;
  startedAt: string;
  completedAt: string | null;
  updatedAt: string;
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
}

export interface ApiResult<T> {
  data: T;
  error: null;
}

export interface ApiErrorResult {
  data: null;
  error: string;
}

export type ApiResponse<T> = ApiResult<T> | ApiErrorResult;
