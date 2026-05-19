"use server";

import { redirect } from "next/navigation";

import { bootstrapAuthenticatedAthlete, canBootstrapLiveData } from "@/lib/server/live-bootstrap";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import {
  assignTemplateToDate,
  clearInProgressSessions,
} from "@/lib/server/live-schedule";

function toFriendlySetupError(
  fallback: string,
  error: unknown,
) {
  const raw = error instanceof Error ? error.message : fallback;

  if (raw.includes("service role key")) {
    return "Add your Supabase service role key to enable one-click starter data from inside the app.";
  }

  if (raw.includes("session history")) {
    return "That day already has workout history attached. Pick a fresh day or clear unfinished sessions first.";
  }

  if (raw.includes("Unable to resolve template")) {
    return "We could not match that workout plan. Refresh the page and try again.";
  }

  if (raw.includes("Unable to save schedule")) {
    return "We could not save that schedule change just yet. Please try again in a moment.";
  }

  if (raw.includes("Unable to clear in-progress sessions")) {
    return "We could not clear unfinished workouts right now. Please try again in a moment.";
  }

  if (raw.includes("Unable to bootstrap live data")) {
    return "We could not load your starter training data yet. Please try again in a moment.";
  }

  return raw || fallback;
}

export async function seedLiveDemoData() {
  const auth = await getOptionalSupabaseAuth();

  if (!auth) {
    redirect("/login?next=/setup");
  }

  if (!canBootstrapLiveData()) {
    redirect(
      `/setup?error=${encodeURIComponent(
        "Add your Supabase service role key to enable one-click starter data from inside the app.",
      )}`,
    );
  }

  try {
    await bootstrapAuthenticatedAthlete(auth);
    redirect("/setup?seeded=1");
  } catch (error) {
    const message = toFriendlySetupError("We could not load your starter training data yet.", error);
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
    redirect(
      `/setup?error=${encodeURIComponent(
        "Choose a training day and workout plan before saving.",
      )}`,
    );
  }

  try {
    await assignTemplateToDate(auth, date, templateSlug);
    redirect("/setup?scheduleSaved=1");
  } catch (error) {
    const message = toFriendlySetupError("We could not save that schedule change just yet.", error);
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
    const message = toFriendlySetupError(
      "We could not clear unfinished workouts right now.",
      error,
    );
    redirect(`/setup?error=${encodeURIComponent(message)}`);
  }
}
