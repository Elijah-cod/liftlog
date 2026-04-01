import { ok } from "@/lib/api";
import { getWorkoutRepository } from "@/lib/server/workouts";

export async function GET() {
  const workout = await getWorkoutRepository().getTodayWorkout();

  return ok(workout);
}

