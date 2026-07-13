import { CORE_EXERCISES } from "@/lib/training/exercise-library";
import {
  MUSCLE_GROUPS,
  type Equipment,
  type ExerciseLibraryItem,
  type GeneratedPlan,
  type MuscleGroup,
  type PlannedDay,
  type ProgressionGuidance,
  type ProgressionInput,
  type TrainingProfile,
} from "@/lib/training/types";

const SPLITS: Record<number, { name: string; muscles: MuscleGroup[] }[]> = {
  2: [
    { name: "Full Body A", muscles: ["quads", "chest", "back", "hamstrings", "shoulders", "core"] },
    { name: "Full Body B", muscles: ["glutes", "back", "chest", "quads", "biceps", "triceps"] },
  ],
  3: [
    { name: "Full Body Strength", muscles: ["quads", "chest", "back", "hamstrings", "core"] },
    { name: "Upper Body", muscles: ["chest", "back", "shoulders", "biceps", "triceps"] },
    { name: "Lower Body", muscles: ["glutes", "quads", "hamstrings", "calves", "core"] },
  ],
  4: [
    { name: "Upper A", muscles: ["chest", "back", "shoulders", "triceps"] },
    { name: "Lower A", muscles: ["quads", "hamstrings", "glutes", "calves"] },
    { name: "Upper B", muscles: ["back", "chest", "shoulders", "biceps"] },
    { name: "Lower B", muscles: ["glutes", "quads", "hamstrings", "core"] },
  ],
  5: [
    { name: "Push", muscles: ["chest", "shoulders", "triceps"] },
    { name: "Pull", muscles: ["back", "biceps"] },
    { name: "Legs", muscles: ["quads", "hamstrings", "glutes", "calves"] },
    { name: "Upper Priority", muscles: ["chest", "back", "shoulders", "biceps", "triceps"] },
    { name: "Lower Priority", muscles: ["glutes", "quads", "hamstrings", "core"] },
  ],
  6: [
    { name: "Push A", muscles: ["chest", "shoulders", "triceps"] },
    { name: "Pull A", muscles: ["back", "biceps"] },
    { name: "Legs A", muscles: ["quads", "hamstrings", "calves"] },
    { name: "Push B", muscles: ["shoulders", "chest", "triceps"] },
    { name: "Pull B", muscles: ["back", "biceps"] },
    { name: "Legs B", muscles: ["glutes", "quads", "hamstrings", "core"] },
  ],
};

function equipmentFor(profile: TrainingProfile): Equipment[] {
  if (profile.location === "gym") return profile.availableEquipment;
  const safeHomeEquipment: Equipment[] = ["bodyweight", "band", "dumbbell", "kettlebell"];
  return profile.availableEquipment.filter((item) => safeHomeEquipment.includes(item));
}

function scoreExercise(
  exercise: ExerciseLibraryItem,
  muscle: MuscleGroup,
  profile: TrainingProfile,
  usedIds: Set<string>,
) {
  let score = 0;
  if (exercise.primaryMuscle === muscle) score += 12;
  if (exercise.secondaryMuscles.includes(muscle)) score += 4;
  if (profile.priorityMuscles.includes(muscle)) score += 3;
  if (profile.location === "home" && exercise.homeFriendly) score += 5;
  if (exercise.difficulty === profile.experience) score += 2;
  if (exercise.pattern === "rehab" && profile.limitations.length === 0) score -= 8;
  if (usedIds.has(exercise.id)) score -= 20;
  return score;
}

function chooseExercise(
  muscle: MuscleGroup,
  profile: TrainingProfile,
  usedIds: Set<string>,
  offset: number,
) {
  const available = equipmentFor(profile);
  const candidates = CORE_EXERCISES.filter((exercise) =>
    available.includes(exercise.equipment) &&
    !exercise.isRehab &&
    (exercise.primaryMuscle === muscle || exercise.secondaryMuscles.includes(muscle)),
  ).sort((a, b) => scoreExercise(b, muscle, profile, usedIds) - scoreExercise(a, muscle, profile, usedIds));

  if (candidates.length === 0) {
    return CORE_EXERCISES.find((exercise) => exercise.primaryMuscle === muscle && exercise.equipment === "bodyweight");
  }

  return candidates[offset % Math.min(candidates.length, 3)];
}

function buildDay(
  split: { name: string; muscles: MuscleGroup[] },
  dayIndex: number,
  profile: TrainingProfile,
): PlannedDay {
  const maxExercises = profile.minutesPerSession <= 30 ? 4 : profile.minutesPerSession <= 45 ? 5 : profile.minutesPerSession <= 60 ? 6 : 7;
  const muscles = [...split.muscles];
  const missingPriority = profile.priorityMuscles.find((muscle) => !muscles.includes(muscle));
  if (missingPriority && muscles.length < maxExercises) muscles.push(missingPriority);

  const usedIds = new Set<string>();
  const selected = muscles.slice(0, maxExercises).flatMap((muscle, index) => {
    const exercise = chooseExercise(muscle, profile, usedIds, dayIndex + index);
    if (!exercise) return [];
    usedIds.add(exercise.id);

    const priority = profile.priorityMuscles.includes(muscle);
    const baseSets = profile.experience === "beginner" ? 2 : 3;
    const goalSets = profile.goal === "muscle" ? baseSets + 1 : baseSets;
    const sets = Math.min(priority ? goalSets + 1 : goalSets, 5);
    const repRange: [number, number] =
      profile.goal === "strength" && ["squat", "hinge", "horizontal-push", "vertical-push", "horizontal-pull", "vertical-pull"].includes(exercise.pattern)
        ? [4, 7]
        : exercise.repRange;

    return [{
      exerciseId: exercise.id,
      name: exercise.name,
      muscle,
      equipment: exercise.equipment,
      sets,
      repRange,
      restSeconds: profile.goal === "strength" ? 150 : exercise.pattern === "isolation" ? 60 : 90,
      setType: "working" as const,
      rationale: priority ? `Extra volume for your ${muscle} priority.` : `Balances ${split.name.toLowerCase()} with a ${exercise.pattern.replaceAll("-", " ")} pattern.`,
      tutorialUrl: exercise.tutorialUrl,
    }];
  });

  return {
    id: `day-${dayIndex + 1}`,
    name: split.name,
    focus: selected.map((exercise) => exercise.muscle).filter((muscle, index, list) => list.indexOf(muscle) === index).slice(0, 3).join(" · "),
    estimatedMinutes: Math.min(profile.minutesPerSession, selected.length * 8 + 8),
    exercises: selected,
  };
}

export function generateWorkoutPlan(profile: TrainingProfile): GeneratedPlan {
  const split = SPLITS[profile.daysPerWeek] ?? SPLITS[3];
  const days = split.map((day, index) => buildDay(day, index, profile));
  const weeklySets = Object.fromEntries(MUSCLE_GROUPS.map((muscle) => [muscle, 0])) as Record<MuscleGroup, number>;

  for (const day of days) {
    for (const exercise of day.exercises) weeklySets[exercise.muscle] += exercise.sets;
  }

  const goalLabel = profile.goal === "muscle" ? "muscle-building" : profile.goal;
  const locationLabel = profile.location === "home" ? "home setup" : "gym access";

  return {
    name: `${profile.daysPerWeek}-Day ${profile.goal === "muscle" ? "Build" : profile.goal === "strength" ? "Strength" : "Balanced"} Plan`,
    summary: `${profile.experience} ${goalLabel} training for ${profile.minutesPerSession}-minute sessions with ${locationLabel}.`,
    days,
    weeklySets,
    priorityNote: profile.priorityMuscles.length
      ? `${profile.priorityMuscles.map((muscle) => muscle[0].toUpperCase() + muscle.slice(1)).join(" and ")} receive an extra set when recovery and session time allow.`
      : "Volume is distributed evenly. Choose a muscle priority at any time to bias the next plan revision.",
    generatedAt: new Date().toISOString(),
  };
}

function roundLoad(value: number, unit: "kg" | "lb") {
  const increment = unit === "kg" ? 2.5 : 5;
  return Math.max(0, Math.round(value / increment) * increment);
}

export function getProgressionGuidance(input: ProgressionInput): ProgressionGuidance {
  const [minReps, maxReps] = input.targetRange;
  const completedAllSets = input.completedAllSets ?? true;

  if (input.deload) {
    const nextWeight = roundLoad(input.weight * 0.9, input.unit);
    return {
      action: "deload",
      nextWeight,
      nextRepTarget: minReps,
      headline: `Deload to ${nextWeight} ${input.unit}`,
      detail: "Use roughly 90% of your recent load and stop each set with at least 3 reps in reserve.",
    };
  }

  if (!completedAllSets || input.completedReps < minReps) {
    const nextWeight = roundLoad(input.weight * 0.95, input.unit);
    return {
      action: "reduce",
      nextWeight,
      nextRepTarget: minReps,
      headline: `Reset to ${nextWeight} ${input.unit} × ${minReps}`,
      detail: "The target range was missed. Reduce the load slightly, rebuild clean reps, then progress again.",
    };
  }

  if (input.completedReps >= maxReps && input.repsInReserve >= 1) {
    const increment = input.unit === "kg" ? 2.5 : 5;
    const nextWeight = roundLoad(input.weight + increment, input.unit);
    return {
      action: "add-weight",
      nextWeight,
      nextRepTarget: minReps,
      headline: `Add ${increment} ${input.unit} next session`,
      detail: `You reached the top of ${minReps}-${maxReps} with reps left. Start the new load at ${minReps} reps and build back up.`,
    };
  }

  if (input.repsInReserve === 0) {
    return {
      action: "hold",
      nextWeight: input.weight,
      nextRepTarget: input.completedReps,
      headline: `Repeat ${input.weight} ${input.unit}`,
      detail: "The set reached the target range but had no reps in reserve. Keep the load and make the same reps cleaner before adding more.",
    };
  }

  return {
    action: "add-reps",
    nextWeight: input.weight,
    nextRepTarget: Math.min(maxReps, input.completedReps + 1),
    headline: `Keep ${input.weight} ${input.unit}, aim for ${Math.min(maxReps, input.completedReps + 1)} reps`,
    detail: "Add one rep while technique remains stable. Increase load after every working set reaches the top of the range.",
  };
}
