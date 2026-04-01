import { isSupabaseConfigured } from "@/lib/env";
import { mockWorkoutRepository } from "@/lib/mock/repository";
import type { AuthenticatedSupabaseContext } from "@/lib/server/auth";
import type { WorkoutRepository } from "@/lib/server/workout-repository";
import { createSupabaseWorkoutRepository } from "@/lib/server/supabase-workouts";

export async function getWorkoutRepository(
  authContext?: AuthenticatedSupabaseContext | null,
): Promise<WorkoutRepository> {
  if (!isSupabaseConfigured || !authContext) {
    return mockWorkoutRepository;
  }

  return createSupabaseWorkoutRepository(authContext.client, authContext.user);
}
