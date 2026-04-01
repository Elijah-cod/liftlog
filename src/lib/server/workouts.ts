import { isSupabaseConfigured } from "@/lib/env";
import { mockWorkoutRepository } from "@/lib/mock/repository";
import type { WorkoutRepository } from "@/lib/server/workout-repository";
import { createSupabaseWorkoutRepository } from "@/lib/server/supabase-workouts";
import { createClient } from "@/lib/supabase/server";

export async function getWorkoutRepository(): Promise<WorkoutRepository> {
  if (!isSupabaseConfigured) {
    return mockWorkoutRepository;
  }

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return mockWorkoutRepository;
  }

  return createSupabaseWorkoutRepository(client, user);
}
