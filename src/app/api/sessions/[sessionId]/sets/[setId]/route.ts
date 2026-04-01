import { fail, ok } from "@/lib/api";
import { saveSetSchema } from "@/lib/schemas";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    sessionId: string;
    setId: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId, setId } = await context.params;
  const body = await request.json();
  const parsed = saveSetSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid set payload");
  }

  const session = await getWorkoutRepository().saveSessionSet(sessionId, setId, parsed.data);

  if (!session) {
    return fail("Session or set not found", 404);
  }

  return ok(session);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { sessionId, setId } = await context.params;
  const session = await getWorkoutRepository().removeExtraSet(sessionId, setId);

  if (!session) {
    return fail("Session or set not found", 404);
  }

  return ok(session);
}

