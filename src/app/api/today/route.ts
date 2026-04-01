import { ok } from "@/lib/api";
import { getWorkoutRepository } from "@/lib/server/workouts";

export async function GET() {
  const repository = await getWorkoutRepository();
  const workout = await repository.getTodayWorkout();

  return ok(workout);
}
