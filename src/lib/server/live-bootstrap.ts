import { addDays, formatISO, subDays } from "date-fns";
import { createHash } from "node:crypto";

import { isSupabaseConfigured, getRequiredEnv } from "@/lib/env";
import type { AuthenticatedSupabaseContext } from "@/lib/server/auth";
import { exerciseSeeds, templateSeeds } from "@/lib/seeds/workout-seed-data";
import { createAdminClient } from "@/lib/supabase/admin";

function stableUuid(input: string) {
  const hex = createHash("sha256").update(input).digest("hex").slice(0, 32);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function buildMetricValue(loadType: "weighted" | "bodyweight" | "timed", setIndex: number) {
  if (loadType === "timed") {
    return {
      weight: null,
      reps: null,
      durationSeconds: setIndex === 0 ? 40 : 35,
    };
  }

  if (loadType === "bodyweight") {
    return {
      weight: null,
      reps: 12 - setIndex,
      durationSeconds: null,
    };
  }

  return {
    weight: 10 + setIndex * 2.5,
    reps: 10 - setIndex,
    durationSeconds: null,
  };
}

export function canBootstrapLiveData() {
  return Boolean(
    isSupabaseConfigured && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_APP_URL,
  );
}

export async function bootstrapAuthenticatedAthlete(auth: AuthenticatedSupabaseContext) {
  if (!canBootstrapLiveData()) {
    throw new Error("Missing live bootstrap configuration");
  }

  getRequiredEnv("supabaseServiceRoleKey");
  const admin = createAdminClient();
  const now = new Date();

  await admin.from("profiles").upsert(
    {
      id: auth.user.id,
      full_name:
        auth.user.user_metadata?.full_name ??
        auth.user.user_metadata?.name ??
        auth.user.email?.split("@")[0] ??
        "Athlete",
      avatar_url: auth.user.user_metadata?.avatar_url ?? null,
      unit_preference: "kg",
    },
    {
      onConflict: "id",
    },
  );

  const { error: exerciseError } = await admin.from("exercise_definitions").upsert(
    exerciseSeeds.map((exercise) => ({
      slug: exercise.id,
      name: exercise.name,
      subtitle: exercise.subtitle,
      media_path: exercise.mediaPath,
      load_type: exercise.loadType,
      per_side: exercise.perSide ?? false,
    })),
    {
      onConflict: "slug",
    },
  );

  if (exerciseError) {
    throw new Error(`Unable to seed exercise definitions: ${exerciseError.message}`);
  }

  const { data: exerciseRows, error: exerciseMapError } = await admin
    .from("exercise_definitions")
    .select("id, slug")
    .in(
      "slug",
      exerciseSeeds.map((exercise) => exercise.id),
    )
    .returns<Array<{ id: string; slug: string }>>();

  if (exerciseMapError || !exerciseRows) {
    throw new Error(`Unable to load seeded exercise definitions: ${exerciseMapError?.message ?? "unknown"}`);
  }

  const exerciseIdBySlug = new Map(exerciseRows.map((row) => [row.slug, row.id]));

  const { error: templateError } = await admin.from("workout_templates").upsert(
    templateSeeds.map((template) => ({
      slug: template.id,
      workout_name: template.workoutName,
      workout_label: template.workoutLabel,
    })),
    {
      onConflict: "slug",
    },
  );

  if (templateError) {
    throw new Error(`Unable to seed workout templates: ${templateError.message}`);
  }

  const { data: templateRows, error: templateMapError } = await admin
    .from("workout_templates")
    .select("id, slug, workout_name, workout_label")
    .in(
      "slug",
      templateSeeds.map((template) => template.id),
    )
    .returns<Array<{ id: string; slug: string; workout_name: string; workout_label: string }>>();

  if (templateMapError || !templateRows) {
    throw new Error(`Unable to load seeded workout templates: ${templateMapError?.message ?? "unknown"}`);
  }

  const templateBySlug = new Map(templateRows.map((row) => [row.slug, row]));

  const templateExerciseRows = templateSeeds.flatMap((template) =>
    template.exercises.map((exercise) => {
      const templateRow = templateBySlug.get(template.id);
      const exerciseId = exerciseIdBySlug.get(exercise.exerciseDefinitionId);

      if (!templateRow || !exerciseId) {
        throw new Error("Missing template or exercise mapping during bootstrap");
      }

      return {
        workout_template_id: templateRow.id,
        exercise_definition_id: exerciseId,
        sort_order: exercise.sortOrder,
        planned_sets: exercise.plannedSets,
        rest_seconds: exercise.restSeconds,
        block_key: exercise.blockKey ?? null,
        block_role: exercise.blockRole ?? null,
      };
    }),
  );

  const { error: templateExerciseError } = await admin
    .from("workout_template_exercises")
    .upsert(templateExerciseRows, {
      onConflict: "workout_template_id,sort_order",
    });

  if (templateExerciseError) {
    throw new Error(`Unable to seed template exercises: ${templateExerciseError.message}`);
  }

  const scheduleRows = [
    { templateSlug: "workout-a", scheduledDate: formatISO(subDays(now, 1), { representation: "date" }) },
    { templateSlug: "workout-b", scheduledDate: formatISO(now, { representation: "date" }) },
    { templateSlug: "workout-c", scheduledDate: formatISO(addDays(now, 1), { representation: "date" }) },
  ].map((schedule) => {
    const templateRow = templateBySlug.get(schedule.templateSlug);

    if (!templateRow) {
      throw new Error("Missing seeded template while creating schedule");
    }

    return {
      profile_id: auth.user.id,
      workout_template_id: templateRow.id,
      scheduled_date: schedule.scheduledDate,
    };
  });

  const { error: scheduleError } = await admin.from("scheduled_workouts").upsert(scheduleRows, {
    onConflict: "profile_id,scheduled_date",
  });

  if (scheduleError) {
    throw new Error(`Unable to seed scheduled workouts: ${scheduleError.message}`);
  }

  const { data: scheduledRows, error: scheduledRowsError } = await admin
    .from("scheduled_workouts")
    .select("id, scheduled_date, workout_template_id")
    .eq("profile_id", auth.user.id)
    .in(
      "scheduled_date",
      scheduleRows.map((row) => row.scheduled_date),
    )
    .returns<Array<{ id: string; scheduled_date: string; workout_template_id: string }>>();

  if (scheduledRowsError || !scheduledRows) {
    throw new Error(`Unable to load scheduled workouts: ${scheduledRowsError?.message ?? "unknown"}`);
  }

  const scheduledByTemplateId = new Map(scheduledRows.map((row) => [row.workout_template_id, row]));

  const historyTemplates = [
    { templateSlug: "workout-a", completedDate: formatISO(subDays(now, 8), { representation: "date" }) },
    { templateSlug: "workout-b", completedDate: formatISO(subDays(now, 7), { representation: "date" }) },
    { templateSlug: "workout-c", completedDate: formatISO(subDays(now, 6), { representation: "date" }) },
  ];

  for (const historyTemplate of historyTemplates) {
    const templateRow = templateBySlug.get(historyTemplate.templateSlug);

    if (!templateRow) {
      continue;
    }

    const scheduled =
      scheduledByTemplateId.get(templateRow.id) ??
      scheduledRows.find((row) => row.workout_template_id === templateRow.id);

    if (!scheduled) {
      continue;
    }

    const sessionId = stableUuid(`${auth.user.id}:${historyTemplate.templateSlug}:history-session`);
    const startedAt = new Date(`${historyTemplate.completedDate}T17:45:00.000Z`).toISOString();
    const completedAt = new Date(`${historyTemplate.completedDate}T18:30:00.000Z`).toISOString();

    const { error: historySessionError } = await admin.from("workout_sessions").upsert(
      {
        id: sessionId,
        profile_id: auth.user.id,
        scheduled_workout_id: scheduled.id,
        workout_template_id: templateRow.id,
        workout_name: templateRow.workout_name,
        workout_label: templateRow.workout_label,
        status: "completed",
        started_at: startedAt,
        completed_at: completedAt,
        updated_at: completedAt,
      },
      {
        onConflict: "id",
      },
    );

    if (historySessionError) {
      throw new Error(`Unable to seed workout history session: ${historySessionError.message}`);
    }

    for (const templateExercise of templateSeeds.find((entry) => entry.id === historyTemplate.templateSlug)?.exercises ?? []) {
      const definition = exerciseSeeds.find(
        (entry) => entry.id === templateExercise.exerciseDefinitionId,
      );
      const exerciseId = exerciseIdBySlug.get(templateExercise.exerciseDefinitionId);

      if (!definition || !exerciseId) {
        continue;
      }

      const sessionExerciseId = stableUuid(`${sessionId}:${templateExercise.id}`);

      const { error: sessionExerciseError } = await admin.from("session_exercises").upsert(
        {
          id: sessionExerciseId,
          workout_session_id: sessionId,
          exercise_definition_id: exerciseId,
          sort_order: templateExercise.sortOrder,
          block_key: templateExercise.blockKey ?? null,
          block_role: templateExercise.blockRole ?? null,
          name: definition.name,
          subtitle: definition.subtitle,
          load_type: definition.loadType,
          per_side: definition.perSide ?? false,
          planned_sets: templateExercise.plannedSets,
          rest_seconds: templateExercise.restSeconds,
          media_path: definition.mediaPath,
          note: "",
          note_updated_at: completedAt,
        },
        {
          onConflict: "id",
        },
      );

      if (sessionExerciseError) {
        throw new Error(`Unable to seed session exercise history: ${sessionExerciseError.message}`);
      }

      for (let setIndex = 0; setIndex < templateExercise.plannedSets; setIndex += 1) {
        const values = buildMetricValue(definition.loadType, setIndex);
        const previousValues = buildMetricValue(definition.loadType, Math.min(setIndex + 1, 2));
        const setId = stableUuid(`${sessionExerciseId}:set:${setIndex + 1}`);

        const { error: sessionSetError } = await admin.from("session_sets").upsert(
          {
            id: setId,
            session_exercise_id: sessionExerciseId,
            set_order: setIndex + 1,
            set_label: `${setIndex + 1}${templateExercise.blockRole ?? ""}`,
            planned: true,
            is_extra_set: false,
            weight: values.weight,
            reps: values.reps,
            duration_seconds: values.durationSeconds,
            completed: true,
            previous_weight: previousValues.weight,
            previous_reps: previousValues.reps,
            previous_duration_seconds: previousValues.durationSeconds,
            previous_trend: "up",
            updated_at: completedAt,
          },
          {
            onConflict: "id",
          },
        );

        if (sessionSetError) {
          throw new Error(`Unable to seed session set history: ${sessionSetError.message}`);
        }
      }
    }
  }
}

