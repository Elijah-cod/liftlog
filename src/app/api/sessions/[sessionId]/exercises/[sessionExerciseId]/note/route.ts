import { fail, ok } from "@/lib/api";
import { saveNoteSchema } from "@/lib/schemas";
import { requireRouteAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";

interface RouteContext {
  params: Promise<{
    sessionId: string;
    sessionExerciseId: string;
  }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { sessionId, sessionExerciseId } = await context.params;
  const body = await request.json();
  const parsed = saveNoteSchema.safeParse(body);

  if (!parsed.success) {
    return fail("Invalid note payload");
  }

  const auth = await requireRouteAuth();

  if (!auth && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return fail("Unauthorized", 401);
  }

  const repository = await getWorkoutRepository(auth);
  const session = await repository.saveExerciseNote(
    sessionId,
    sessionExerciseId,
    parsed.data.notes,
  );

  if (!session) {
    return fail("Session or exercise not found", 404);
  }

  return ok(session);
}
