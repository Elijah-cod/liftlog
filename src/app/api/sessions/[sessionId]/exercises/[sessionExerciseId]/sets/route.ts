import { fail, ok } from "@/lib/api";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    sessionId: string;
    sessionExerciseId: string;
  }>;
}

export async function POST(_: Request, context: RouteContext) {
  const { sessionId, sessionExerciseId } = await context.params;
  const repository = await getWorkoutRepository();
  const session = await repository.addExtraSet(sessionId, sessionExerciseId);

  if (!session) {
    return fail("Session or exercise not found", 404);
  }

  return ok(session);
}
