import "server-only";

import { generateWorkoutPlan } from "@/lib/training/engine";
import { DEFAULT_TRAINING_PROFILE, getDefaultTrainingPlan } from "@/lib/training/defaults";
import { trainingProfileSchema } from "@/lib/schemas";
import type { AuthenticatedSupabaseContext } from "@/lib/server/auth";
import type { GeneratedPlan, TrainingProfile } from "@/lib/training/types";

interface TrainingPlanRow {
  profile: unknown;
  generated_plan: unknown;
}

export interface SavedTrainingPlan {
  profile: TrainingProfile;
  plan: GeneratedPlan;
}

export async function getTrainingPlan(
  auth: AuthenticatedSupabaseContext | null,
): Promise<SavedTrainingPlan> {
  if (!auth) {
    return {
      profile: DEFAULT_TRAINING_PROFILE,
      plan: getDefaultTrainingPlan(),
    };
  }

  const { data, error } = await auth.client
    .from("training_plans")
    .select("profile, generated_plan")
    .eq("user_id", auth.user.id)
    .maybeSingle<TrainingPlanRow>();

  if (error) {
    throw new Error(`Unable to load your training plan: ${error.message}`);
  }

  const profile = trainingProfileSchema.safeParse(data?.profile);
  if (!profile.success) {
    return {
      profile: DEFAULT_TRAINING_PROFILE,
      plan: getDefaultTrainingPlan(),
    };
  }

  // Regenerate from the validated profile so stale or malformed JSON never reaches the client.
  return {
    profile: profile.data,
    plan: generateWorkoutPlan(profile.data),
  };
}

export async function upsertTrainingPlan(
  auth: AuthenticatedSupabaseContext,
  profile: TrainingProfile,
): Promise<SavedTrainingPlan> {
  const validated = trainingProfileSchema.parse(profile);
  const plan = generateWorkoutPlan(validated);
  const { error } = await auth.client.from("training_plans").upsert(
    {
      user_id: auth.user.id,
      profile: validated,
      generated_plan: plan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Unable to save your training plan: ${error.message}`);
  }

  return { profile: validated, plan };
}
