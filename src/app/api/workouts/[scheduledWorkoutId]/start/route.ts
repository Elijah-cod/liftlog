import { fail, ok } from "@/lib/api";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    scheduledWorkoutId: string;
  }>;
}

export async function GET(_: Request, context: RouteContext) {
  const { scheduledWorkoutId } = await context.params;
  const repository = await getWorkoutRepository();
  const session = await repository.startWorkoutSession(scheduledWorkoutId);

  if (!session) {
    return fail("Workout not found", 404);
  }

  return ok({
    sessionId: session.id,
  });
}

export async function POST(_: Request, context: RouteContext) {
  const { scheduledWorkoutId } = await context.params;
  const repository = await getWorkoutRepository();
  const session = await repository.startWorkoutSession(scheduledWorkoutId);

  if (!session) {
    return fail("Workout not found", 404);
  }

  return ok(session);
}
