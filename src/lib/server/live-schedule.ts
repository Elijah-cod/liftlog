import { addDays, format, formatISO, subDays } from "date-fns";

import type { AuthenticatedSupabaseContext } from "@/lib/server/auth";

interface TemplateOption {
  id: string;
  slug: string;
  workoutName: string;
  workoutLabel: string;
}

export interface ScheduleSlot {
  label: string;
  date: string;
  scheduledWorkoutId: string | null;
  templateSlug: string | null;
  templateName: string | null;
  latestSessionStatus: "draft" | "active" | "partial" | "completed" | null;
}

function dateSlots(now = new Date()) {
  return [
    { label: "Yesterday", date: formatISO(subDays(now, 1), { representation: "date" }) },
    { label: "Today", date: formatISO(now, { representation: "date" }) },
    { label: "Tomorrow", date: formatISO(addDays(now, 1), { representation: "date" }) },
  ];
}

export async function getScheduleManagerData(auth: AuthenticatedSupabaseContext) {
  const slots = dateSlots();
  const dates = slots.map((slot) => slot.date);

  const { data: templates, error: templatesError } = await auth.client
    .from("workout_templates")
    .select("id, slug, workout_name, workout_label")
    .order("workout_name", { ascending: true })
    .returns<Array<{ id: string; slug: string; workout_name: string; workout_label: string }>>();

  if (templatesError || !templates) {
    throw new Error(`Unable to load templates: ${templatesError?.message ?? "unknown"}`);
  }

  const templateOptions: TemplateOption[] = templates.map((template) => ({
    id: template.id,
    slug: template.slug,
    workoutName: template.workout_name,
    workoutLabel: template.workout_label,
  }));

  const { data: scheduledWorkouts, error: scheduledError } = await auth.client
    .from("scheduled_workouts")
    .select(
      `
      id,
      scheduled_date,
      workout_template_id,
      workout_templates!scheduled_workouts_workout_template_id_fkey (
        slug,
        workout_name
      )
    `,
    )
    .eq("profile_id", auth.user.id)
    .in("scheduled_date", dates)
    .returns<
      Array<{
        id: string;
        scheduled_date: string;
        workout_template_id: string;
        workout_templates: {
          slug: string;
          workout_name: string;
        } | null;
      }>
    >();

  if (scheduledError || !scheduledWorkouts) {
    throw new Error(`Unable to load schedule: ${scheduledError?.message ?? "unknown"}`);
  }

  const scheduledByDate = new Map(scheduledWorkouts.map((row) => [row.scheduled_date, row]));

  const scheduledIds = scheduledWorkouts.map((row) => row.id);
  const latestSessions =
    scheduledIds.length > 0
      ? await auth.client
          .from("workout_sessions")
          .select("scheduled_workout_id, status, updated_at")
          .eq("profile_id", auth.user.id)
          .in("scheduled_workout_id", scheduledIds)
          .order("updated_at", { ascending: false })
          .returns<
            Array<{
              scheduled_workout_id: string;
              status: "draft" | "active" | "partial" | "completed";
              updated_at: string;
            }>
          >()
      : { data: [], error: null };

  if (latestSessions.error) {
    throw new Error(`Unable to load session state: ${latestSessions.error.message}`);
  }

  const latestSessionByScheduledId = new Map<
    string,
    "draft" | "active" | "partial" | "completed"
  >();

  for (const session of latestSessions.data ?? []) {
    if (!latestSessionByScheduledId.has(session.scheduled_workout_id)) {
      latestSessionByScheduledId.set(session.scheduled_workout_id, session.status);
    }
  }

  return {
    templates: templateOptions,
    slots: slots.map((slot) => {
      const scheduled = scheduledByDate.get(slot.date);

      return {
        label: slot.label,
        date: slot.date,
        scheduledWorkoutId: scheduled?.id ?? null,
        templateSlug: scheduled?.workout_templates?.slug ?? null,
        templateName: scheduled?.workout_templates?.workout_name ?? null,
        latestSessionStatus: scheduled
          ? latestSessionByScheduledId.get(scheduled.id) ?? null
          : null,
      } satisfies ScheduleSlot;
    }),
    generatedAt: format(new Date(), "HH:mm:ss"),
  };
}

export async function assignTemplateToDate(
  auth: AuthenticatedSupabaseContext,
  date: string,
  templateSlug: string,
) {
  const { data: template, error: templateError } = await auth.client
    .from("workout_templates")
    .select("id")
    .eq("slug", templateSlug)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (templateError || !template) {
    throw new Error(`Unable to resolve template: ${templateError?.message ?? "unknown"}`);
  }

  return assignTemplateIdToDate(auth, date, template.id);
}

export async function assignTemplateIdToDate(
  auth: AuthenticatedSupabaseContext,
  date: string,
  templateId: string,
) {
  if (!templateId) {
    throw new Error("Template is required");
  }

  const { data: existingSchedule, error: existingError } = await auth.client
    .from("scheduled_workouts")
    .select("id, workout_template_id")
    .eq("profile_id", auth.user.id)
    .eq("scheduled_date", date)
    .maybeSingle<{ id: string; workout_template_id: string }>();

  if (existingError) {
    throw new Error(`Unable to load existing schedule: ${existingError.message}`);
  }

  if (existingSchedule && existingSchedule.workout_template_id !== templateId) {
    const { data: sessions, error: sessionsError } = await auth.client
      .from("workout_sessions")
      .select("id")
      .eq("profile_id", auth.user.id)
      .eq("scheduled_workout_id", existingSchedule.id)
      .limit(1);

    if (sessionsError) {
      throw new Error(`Unable to inspect existing sessions: ${sessionsError.message}`);
    }

    if ((sessions ?? []).length > 0) {
      throw new Error("This scheduled day already has session history. Clear in-progress sessions or choose a fresh day.");
    }
  }

  const { error } = await auth.client.from("scheduled_workouts").upsert(
    {
      profile_id: auth.user.id,
      workout_template_id: templateId,
      scheduled_date: date,
    },
    {
      onConflict: "profile_id,scheduled_date",
    },
  );

  if (error) {
    throw new Error(`Unable to save schedule assignment: ${error.message}`);
  }
}

export async function clearInProgressSessions(auth: AuthenticatedSupabaseContext) {
  const { error } = await auth.client
    .from("workout_sessions")
    .delete()
    .eq("profile_id", auth.user.id)
    .in("status", ["draft", "active", "partial"]);

  if (error) {
    throw new Error(`Unable to clear in-progress sessions: ${error.message}`);
  }
}
