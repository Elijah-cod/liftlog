import { ok } from "@/lib/api";
import { requireRouteAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";
import { fail } from "@/lib/api";

export async function GET() {
  const auth = await requireRouteAuth();

  if (!auth && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return fail("Unauthorized", 401);
  }

  const repository = await getWorkoutRepository(auth);
  const workout = await repository.getTodayWorkout();

  return ok(workout);
}
