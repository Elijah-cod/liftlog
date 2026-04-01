"use server";

import { redirect } from "next/navigation";

import { bootstrapAuthenticatedAthlete, canBootstrapLiveData } from "@/lib/server/live-bootstrap";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import {
  assignTemplateToDate,
  clearInProgressSessions,
} from "@/lib/server/live-schedule";

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

export async function saveScheduleAssignment(formData: FormData) {
  const auth = await getOptionalSupabaseAuth();

  if (!auth) {
    redirect("/login?next=/setup");
  }

  const date = String(formData.get("date") ?? "");
  const templateSlug = String(formData.get("templateSlug") ?? "");

  if (!date || !templateSlug) {
    redirect(`/setup?error=${encodeURIComponent("Schedule date and template are required")}`);
  }

  try {
    await assignTemplateToDate(auth, date, templateSlug);
    redirect("/setup?scheduleSaved=1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save schedule";
    redirect(`/setup?error=${encodeURIComponent(message)}`);
  }
}

export async function clearLiveDrafts() {
  const auth = await getOptionalSupabaseAuth();

  if (!auth) {
    redirect("/login?next=/setup");
  }

  try {
    await clearInProgressSessions(auth);
    redirect("/setup?draftsCleared=1");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to clear in-progress sessions";
    redirect(`/setup?error=${encodeURIComponent(message)}`);
  }
}
