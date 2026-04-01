import { fail, ok } from "@/lib/api";
import { requireRouteAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { scheduledWorkoutId } = await context.params;
  const auth = await requireRouteAuth();

  if (!auth && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return fail("Unauthorized", 401);
  }

  const repository = await getWorkoutRepository(auth);
  const preview = await repository.getScheduledWorkoutPreview(scheduledWorkoutId);

  if (!preview) {
    return fail("Workout not found", 404);
  }

  return ok(preview);
}
