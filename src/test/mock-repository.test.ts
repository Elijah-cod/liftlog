import { mockWorkoutRepository } from "@/lib/mock/repository";

describe("mock workout repository", () => {
  it("creates a session only once for a scheduled workout", async () => {
    const today = await mockWorkoutRepository.getTodayWorkout();

    expect(today).not.toBeNull();

    const first = await mockWorkoutRepository.startWorkoutSession(today!.scheduledWorkoutId);
    const second = await mockWorkoutRepository.startWorkoutSession(today!.scheduledWorkoutId);

    expect(first?.id).toBe(second?.id);
  });

  it("adds and removes extra sets on a session exercise", async () => {
    const today = await mockWorkoutRepository.getTodayWorkout();
    const session = await mockWorkoutRepository.startWorkoutSession(today!.scheduledWorkoutId);
    const exercise = session!.exercises[0];

    const afterAdd = await mockWorkoutRepository.addExtraSet(session!.id, exercise.id);
    expect(afterAdd?.exercises[0]?.sets.some((set) => set.isExtraSet)).toBe(true);

    const extraSet = afterAdd!.exercises[0]!.sets.find((set) => set.isExtraSet);
    const afterRemove = await mockWorkoutRepository.removeExtraSet(session!.id, extraSet!.id);

    expect(afterRemove?.exercises[0]?.sets.some((set) => set.id === extraSet!.id)).toBe(false);
  });

  it("marks incomplete workouts as partial on finish", async () => {
    const today = await mockWorkoutRepository.getTodayWorkout();
    const session = await mockWorkoutRepository.startWorkoutSession(today!.scheduledWorkoutId);
    const finished = await mockWorkoutRepository.finishWorkoutSession(session!.id);

    expect(finished?.status).toBe("partial");
  });
});

