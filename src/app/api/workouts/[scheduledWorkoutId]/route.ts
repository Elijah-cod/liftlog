import { fail, ok } from "@/lib/api";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { scheduledWorkoutId } = await context.params;
  const preview = await getWorkoutRepository().getScheduledWorkoutPreview(scheduledWorkoutId);

  if (!preview) {
    return fail("Workout not found", 404);
  }

  return ok(preview);
}

