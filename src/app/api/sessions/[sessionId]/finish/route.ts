import { fail, ok } from "@/lib/api";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function POST(_: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const repository = await getWorkoutRepository();
  const session = await repository.finishWorkoutSession(sessionId);

  if (!session) {
    return fail("Session not found", 404);
  }

  return ok(session);
}
