import { generateWorkoutPlan } from "@/lib/training/engine";
import type { TrainingProfile } from "@/lib/training/types";

export const DEFAULT_TRAINING_PROFILE: TrainingProfile = {
  goal: "muscle",
  location: "gym",
  experience: "intermediate",
  daysPerWeek: 4,
  minutesPerSession: 60,
  age: 30,
  heightCm: 178,
  weightKg: 78,
  availableEquipment: ["barbell", "dumbbell", "cable", "machine", "bodyweight", "cardio"],
  priorityMuscles: ["shoulders"],
  limitations: [],
};

export function getDefaultTrainingPlan() {
  return generateWorkoutPlan(DEFAULT_TRAINING_PROFILE);
}
