import {
  createInitialDemoExercises,
  DEMO_WORKOUT_STORAGE_KEY,
  loadDemoWorkout,
  parseDemoWorkout,
  saveDemoWorkout,
} from "@/lib/training/demo-workout";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("demo workout storage", () => {
  it("round-trips a browser-local workout", () => {
    const storage = createStorage();
    const exercises = createInitialDemoExercises();
    exercises[0].sets[0].complete = true;

    saveDemoWorkout(storage, {
      editScope: "future",
      shortened: "45",
      exercises,
    });

    const restored = loadDemoWorkout(storage);
    expect(restored?.editScope).toBe("future");
    expect(restored?.shortened).toBe("45");
    expect(restored?.exercises[0].sets[0].complete).toBe(true);
    expect(storage.getItem(DEMO_WORKOUT_STORAGE_KEY)).not.toBeNull();
  });

  it("ignores malformed or incomplete browser data", () => {
    expect(parseDemoWorkout("not-json")).toBeNull();
    expect(parseDemoWorkout(JSON.stringify({ exercises: [{ id: "broken" }] }))).toBeNull();
  });

  it("returns fresh initial exercise objects", () => {
    const first = createInitialDemoExercises();
    first[0].sets[0].complete = true;

    expect(createInitialDemoExercises()[0].sets[0].complete).toBe(false);
  });
});
