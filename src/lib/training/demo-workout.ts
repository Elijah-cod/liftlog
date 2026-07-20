export const DEMO_WORKOUT_STORAGE_KEY = "liftlog-demo-workout-v1";
const LEGACY_DEMO_WORKOUT_STORAGE_KEY = "liftlog-workout-edits";

export const DEMO_SET_TYPES = [
  "warm-up",
  "working",
  "dropset",
  "deload",
  "rehab",
  "cardio",
] as const;

export type DemoSetType = (typeof DEMO_SET_TYPES)[number];

export interface DemoTrackerSet {
  id: string;
  type: DemoSetType;
  weight: number;
  reps: number;
  complete: boolean;
}

export interface DemoTrackerExercise {
  id: string;
  libraryId: string;
  name: string;
  target: string;
  isAccessory: boolean;
  sets: DemoTrackerSet[];
}

export interface DemoWorkoutSnapshot {
  version: 1;
  savedAt: string;
  editScope: "today" | "future";
  shortened: "full" | "45" | "30";
  exercises: DemoTrackerExercise[];
}

interface BrowserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const INITIAL_EXERCISES: DemoTrackerExercise[] = [
  { id: "ex-1", libraryId: "dumbbell-bench-press", name: "Dumbbell Bench Press", target: "8–12 reps", isAccessory: false, sets: [{ id: "1-w", type: "warm-up", weight: 20, reps: 10, complete: false }, { id: "1-a", type: "working", weight: 30, reps: 12, complete: false }, { id: "1-b", type: "working", weight: 30, reps: 10, complete: false }, { id: "1-c", type: "working", weight: 30, reps: 9, complete: false }] },
  { id: "ex-2", libraryId: "chest-supported-row", name: "Chest-Supported Row", target: "8–12 reps", isAccessory: false, sets: [{ id: "2-a", type: "working", weight: 32.5, reps: 10, complete: false }, { id: "2-b", type: "working", weight: 32.5, reps: 10, complete: false }, { id: "2-c", type: "working", weight: 32.5, reps: 9, complete: false }] },
  { id: "ex-3", libraryId: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise", target: "12–20 reps", isAccessory: true, sets: [{ id: "3-a", type: "working", weight: 8, reps: 15, complete: false }, { id: "3-b", type: "working", weight: 8, reps: 14, complete: false }, { id: "3-c", type: "dropset", weight: 6, reps: 12, complete: false }] },
  { id: "ex-4", libraryId: "cable-push-down", name: "Cable Triceps Pressdown", target: "10–15 reps", isAccessory: true, sets: [{ id: "4-a", type: "working", weight: 25, reps: 12, complete: false }, { id: "4-b", type: "working", weight: 25, reps: 11, complete: false }] },
];

function cloneExercises(exercises: DemoTrackerExercise[]) {
  return exercises.map((exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => ({ ...set })),
  }));
}

export function createInitialDemoExercises() {
  return cloneExercises(INITIAL_EXERCISES);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSetType(value: unknown): value is DemoSetType {
  return typeof value === "string" && DEMO_SET_TYPES.includes(value as DemoSetType);
}

function parseExercise(value: unknown): DemoTrackerExercise | null {
  if (!isRecord(value) || !Array.isArray(value.sets)) return null;

  const sets = value.sets.map((set) => {
    if (
      !isRecord(set) ||
      typeof set.id !== "string" ||
      !isSetType(set.type) ||
      typeof set.weight !== "number" ||
      !Number.isFinite(set.weight) ||
      typeof set.reps !== "number" ||
      !Number.isFinite(set.reps) ||
      typeof set.complete !== "boolean"
    ) {
      return null;
    }

    return {
      id: set.id,
      type: set.type,
      weight: set.weight,
      reps: set.reps,
      complete: set.complete,
    };
  });

  if (
    sets.some((set) => set === null) ||
    typeof value.id !== "string" ||
    typeof value.libraryId !== "string" ||
    typeof value.name !== "string" ||
    typeof value.target !== "string" ||
    typeof value.isAccessory !== "boolean"
  ) {
    return null;
  }

  return {
    id: value.id,
    libraryId: value.libraryId,
    name: value.name,
    target: value.target,
    isAccessory: value.isAccessory,
    sets: sets as DemoTrackerSet[],
  };
}

export function parseDemoWorkout(raw: string | null): DemoWorkoutSnapshot | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || !Array.isArray(value.exercises)) return null;

    const exercises = value.exercises.map(parseExercise);
    if (exercises.length === 0 || exercises.some((exercise) => exercise === null)) return null;

    const editScope = value.editScope === "future" ? "future" : "today";
    const shortened = value.shortened === "30" || value.shortened === "45" ? value.shortened : "full";

    return {
      version: 1,
      savedAt: typeof value.savedAt === "string" ? value.savedAt : new Date(0).toISOString(),
      editScope,
      shortened,
      exercises: cloneExercises(exercises as DemoTrackerExercise[]),
    };
  } catch {
    return null;
  }
}

export function loadDemoWorkout(storage: BrowserStorage) {
  const current = parseDemoWorkout(storage.getItem(DEMO_WORKOUT_STORAGE_KEY));
  if (current) return current;

  const legacy = parseDemoWorkout(storage.getItem(LEGACY_DEMO_WORKOUT_STORAGE_KEY));
  if (!legacy) return null;

  saveDemoWorkout(storage, legacy);
  storage.removeItem(LEGACY_DEMO_WORKOUT_STORAGE_KEY);
  return legacy;
}

export function saveDemoWorkout(
  storage: BrowserStorage,
  snapshot: Omit<DemoWorkoutSnapshot, "version" | "savedAt">,
) {
  const next: DemoWorkoutSnapshot = {
    ...snapshot,
    version: 1,
    savedAt: new Date().toISOString(),
    exercises: cloneExercises(snapshot.exercises),
  };
  storage.setItem(DEMO_WORKOUT_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearDemoWorkout(storage: BrowserStorage) {
  storage.removeItem(DEMO_WORKOUT_STORAGE_KEY);
  storage.removeItem(LEGACY_DEMO_WORKOUT_STORAGE_KEY);
}
