import { EXERCISE_LIBRARY, getExerciseSubstitutions } from "@/lib/training/exercise-library";
import { generateWorkoutPlan, getProgressionGuidance } from "@/lib/training/engine";
import type { TrainingProfile } from "@/lib/training/types";

const profile: TrainingProfile = {
  goal: "muscle",
  location: "home",
  experience: "intermediate",
  daysPerWeek: 4,
  minutesPerSession: 45,
  age: 32,
  heightCm: 178,
  weightKg: 78,
  availableEquipment: ["bodyweight", "dumbbell", "band"],
  priorityMuscles: ["shoulders", "glutes"],
  limitations: [],
};

describe("training engine", () => {
  it("ships more than 250 tutorial-backed exercise entries", () => {
    expect(EXERCISE_LIBRARY.length).toBeGreaterThanOrEqual(250);
    expect(EXERCISE_LIBRARY.every((exercise) => exercise.tutorialUrl.startsWith("https://"))).toBe(true);
  });

  it("builds a schedule-specific home plan with available equipment", () => {
    const plan = generateWorkoutPlan(profile);
    expect(plan.days).toHaveLength(4);
    expect(plan.days.every((day) => day.estimatedMinutes <= 45)).toBe(true);
    expect(plan.days.flatMap((day) => day.exercises).every((exercise) => profile.availableEquipment.includes(exercise.equipment))).toBe(true);
    expect(plan.weeklySets.shoulders).toBeGreaterThan(0);
  });

  it("adds load after the top of a rep range is achieved with reserve", () => {
    const guidance = getProgressionGuidance({
      exerciseName: "Dumbbell Bench Press",
      weight: 30,
      completedReps: 12,
      targetRange: [8, 12],
      repsInReserve: 2,
      unit: "kg",
    });
    expect(guidance.action).toBe("add-weight");
    expect(guidance.nextWeight).toBe(32.5);
    expect(guidance.nextRepTarget).toBe(8);
  });

  it("offers same-pattern substitutions", () => {
    const substitutions = getExerciseSubstitutions("barbell-bench-press", ["dumbbell", "bodyweight"]);
    expect(substitutions.length).toBeGreaterThan(0);
    expect(substitutions.every((exercise) => ["dumbbell", "bodyweight"].includes(exercise.equipment))).toBe(true);
  });
});
