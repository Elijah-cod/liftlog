"use server";

import { addDays, formatISO } from "date-fns";
import { redirect } from "next/navigation";

import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import { assignTemplateIdToDate } from "@/lib/server/live-schedule";

function buildRedirectUrl(target: string, params: Record<string, string>) {
  const search = new URLSearchParams(params).toString();
  return search.length > 0 ? `${target}?${search}` : target;
}

export async function scheduleWorkoutAgain(formData: FormData) {
  const auth = await getOptionalSupabaseAuth();
  const redirectTo = String(formData.get("redirectTo") ?? "/history");

  if (!auth) {
    redirect(`/login?next=${encodeURIComponent(redirectTo)}`);
  }

  const templateId = String(formData.get("templateId") ?? "");
  const slot = String(formData.get("slot") ?? "");
  const workoutName = String(formData.get("workoutName") ?? "Workout");
  const now = new Date();
  const date =
    slot === "tomorrow"
      ? formatISO(addDays(now, 1), { representation: "date" })
      : slot === "today"
        ? formatISO(now, { representation: "date" })
        : "";

  if (!templateId || !date) {
    redirect(
      buildRedirectUrl(redirectTo, {
        actionError: "Workout template and schedule slot are required",
      }),
    );
  }

  try {
    await assignTemplateIdToDate(auth, date, templateId);
    redirect(
      buildRedirectUrl(redirectTo, {
        scheduled: "1",
        slot,
        workout: workoutName,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to schedule workout";

    redirect(
      buildRedirectUrl(redirectTo, {
        actionError: message,
      }),
    );
  }
}
