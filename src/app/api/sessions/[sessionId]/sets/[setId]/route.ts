import { fail, ok } from "@/lib/api";
import { saveSetSchema } from "@/lib/schemas";
import { requireRouteAuth } from "@/lib/server/auth";
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

  const auth = await requireRouteAuth();

  if (!auth && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return fail("Unauthorized", 401);
  }

  const repository = await getWorkoutRepository(auth);
  const session = await repository.saveSessionSet(sessionId, setId, parsed.data);

  if (!session) {
    return fail("Session or set not found", 404);
  }

  return ok(session);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { sessionId, setId } = await context.params;
  const auth = await requireRouteAuth();

  if (!auth && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return fail("Unauthorized", 401);
  }

  const repository = await getWorkoutRepository(auth);
  const session = await repository.removeExtraSet(sessionId, setId);

  if (!session) {
    return fail("Session or set not found", 404);
  }

  return ok(session);
}
