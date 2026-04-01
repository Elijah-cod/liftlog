"use server";

import { redirect } from "next/navigation";

import { bootstrapAuthenticatedAthlete, canBootstrapLiveData } from "@/lib/server/live-bootstrap";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";

export async function seedLiveDemoData() {
  const auth = await getOptionalSupabaseAuth();

  if (!auth) {
    redirect("/login?next=/setup");
  }

  if (!canBootstrapLiveData()) {
    redirect(`/setup?error=${encodeURIComponent("Live bootstrap requires Supabase plus a service role key")}`);
  }

  try {
    await bootstrapAuthenticatedAthlete(auth);
    redirect("/setup?seeded=1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to bootstrap live data";
    redirect(`/setup?error=${encodeURIComponent(message)}`);
  }
}

