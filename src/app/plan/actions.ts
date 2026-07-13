"use server";

import { revalidatePath } from "next/cache";

import { trainingProfileSchema } from "@/lib/schemas";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import { upsertTrainingPlan } from "@/lib/server/training-plans";
import type { GeneratedPlan, TrainingProfile } from "@/lib/training/types";

export type SavePlanResult =
  | { ok: true; plan: GeneratedPlan }
  | { ok: false; error: string };

export async function saveTrainingPlan(profile: TrainingProfile): Promise<SavePlanResult> {
  const auth = await getOptionalSupabaseAuth();
  if (!auth) {
    return { ok: false, error: "Sign in to save this routine to a private account." };
  }

  const validated = trainingProfileSchema.safeParse(profile);
  if (!validated.success) {
    return { ok: false, error: "Review your training inputs and try again." };
  }

  try {
    const saved = await upsertTrainingPlan(auth, validated.data);
    revalidatePath("/plan");
    revalidatePath("/today");
    return { ok: true, plan: saved.plan };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to save your routine right now.",
    };
  }
}
