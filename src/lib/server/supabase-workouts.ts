import { formatISO } from "date-fns";
import type { SupabaseClient, User } from "@supabase/supabase-js";

import { buildSessionWithProgress, compareMetricTrend, deriveTodayStatus } from "@/lib/session-utils";
import type { WorkoutRepository } from "@/lib/server/workout-repository";
import type {
  BlockRole,
  LoadType,
  ScheduledWorkoutPreview,
  SessionExercise,
  WorkoutSessionDetail,
  WorkoutSet,
} from "@/lib/types";

type DbClient = SupabaseClient;

interface SessionRow {
  id: string;
  profile_id: string;
  scheduled_workout_id: string;
  workout_template_id: string;
  workout_name: string;
  workout_label: string;
  status: WorkoutSessionDetail["status"];
  started_at: string;
  completed_at: string | null;
  updated_at: string;
  scheduled_workouts?: {
    scheduled_date: string;
  } | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    unit_preference: WorkoutSessionDetail["unitPreference"];
  } | null;
}

interface TemplateExerciseRow {
  id: string;
  sort_order: number;
  planned_sets: number;
  rest_seconds: number;
  block_key: string | null;
  block_role: BlockRole;
  exercise_definitions: {
    id: string;
    name: string;
    subtitle: string;
    load_type: LoadType;
    media_path: string;
    per_side: boolean;
  } | null;
}

interface SessionExerciseRow {
  id: string;
  exercise_definition_id: string;
  sort_order: number;
  block_key: string | null;
  block_role: BlockRole;
  name: string;
  subtitle: string;
  load_type: LoadType;
  per_side: boolean;
  planned_sets: number;
  rest_seconds: number;
  media_path: string;
  note: string;
  note_updated_at: string;
}

interface SessionSetRow {
  id: string;
  session_exercise_id: string;
  set_order: number;
  set_label: string;
  planned: boolean;
  is_extra_set: boolean;
  weight: number | null;
  reps: number | null;
  duration_seconds: number | null;
  completed: boolean;
  previous_weight: number | null;
  previous_reps: number | null;
  previous_duration_seconds: number | null;
  previous_trend: WorkoutSet["previousTrend"];
  updated_at: string;
}

function requireData<T>(data: T | null, error: { message?: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message ?? "Unknown Supabase error"}`);
  }

  return data;
}

function mapPreviewExercise(row: TemplateExerciseRow) {
  if (!row.exercise_definitions) {
    throw new Error(`Missing exercise definition for template exercise ${row.id}`);
  }

  return {
    id: row.id,
    exerciseDefinitionId: row.exercise_definitions.id,
    name: row.exercise_definitions.name,
    subtitle: row.exercise_definitions.subtitle,
    loadType: row.exercise_definitions.load_type,
    sortOrder: row.sort_order,
    blockKey: row.block_key,
    blockRole: row.block_role,
    plannedSets: row.planned_sets,
    mediaPath: row.exercise_definitions.media_path,
  };
}

function mapSessionSet(row: SessionSetRow): WorkoutSet {
  return {
    id: row.id,
    setOrder: row.set_order,
    setLabel: row.set_label,
    blockRole: row.set_label.endsWith("A")
      ? "A"
      : row.set_label.endsWith("B")
        ? "B"
        : null,
    loadType: "weighted",
    planned: row.planned,
    isExtraSet: row.is_extra_set,
    weight: row.weight,
    reps: row.reps,
    durationSeconds: row.duration_seconds,
    completed: row.completed,
    updatedAt: row.updated_at,
    previousWeight: row.previous_weight,
    previousReps: row.previous_reps,
    previousDurationSeconds: row.previous_duration_seconds,
    previousTrend: row.previous_trend,
  };
}

function mapSessionExercise(row: SessionExerciseRow, sets: SessionSetRow[]): SessionExercise {
  return {
    id: row.id,
    exerciseDefinitionId: row.exercise_definition_id,
    name: row.name,
    subtitle: row.subtitle,
    loadType: row.load_type,
    perSide: row.per_side,
    notes: row.note,
    noteUpdatedAt: row.note_updated_at,
    restSeconds: row.rest_seconds,
    sortOrder: row.sort_order,
    blockKey: row.block_key,
    blockRole: row.block_role,
    plannedSets: row.planned_sets,
    mediaPath: row.media_path,
    sets: sets
      .sort((left, right) => left.set_order - right.set_order)
      .map((set) => ({
        ...mapSessionSet(set),
        loadType: row.load_type,
        blockRole: row.block_role,
      })),
  };
}

async function getSessionRecord(client: DbClient, userId: string, sessionId: string) {
  const { data, error } = await client
    .from("workout_sessions")
    .select(
      `
      id,
      profile_id,
      scheduled_workout_id,
      workout_template_id,
      workout_name,
      workout_label,
      status,
      started_at,
      completed_at,
      updated_at,
      scheduled_workouts!workout_sessions_scheduled_workout_id_fkey (
        scheduled_date
      ),
      profiles!workout_sessions_profile_id_fkey (
        full_name,
        avatar_url,
        unit_preference
      )
    `,
    )
    .eq("id", sessionId)
    .eq("profile_id", userId)
    .maybeSingle<SessionRow>();

  return requireData(data, error, "Unable to load session");
}

async function getSessionExercises(client: DbClient, sessionId: string) {
  const { data, error } = await client
    .from("session_exercises")
    .select(
      `
      id,
      exercise_definition_id,
      sort_order,
      block_key,
      block_role,
      name,
      subtitle,
      load_type,
      per_side,
      planned_sets,
      rest_seconds,
      media_path,
      note,
      note_updated_at
    `,
    )
    .eq("workout_session_id", sessionId)
    .order("sort_order", { ascending: true })
    .returns<SessionExerciseRow[]>();

  return requireData(data, error, "Unable to load session exercises") ?? [];
}

async function getSessionSets(client: DbClient, sessionExerciseIds: string[]) {
  if (sessionExerciseIds.length === 0) {
    return [] as SessionSetRow[];
  }

  const { data, error } = await client
    .from("session_sets")
    .select(
      `
      id,
      session_exercise_id,
      set_order,
      set_label,
      planned,
      is_extra_set,
      weight,
      reps,
      duration_seconds,
      completed,
      previous_weight,
      previous_reps,
      previous_duration_seconds,
      previous_trend,
      updated_at
    `,
    )
    .in("session_exercise_id", sessionExerciseIds)
    .order("set_order", { ascending: true })
    .returns<SessionSetRow[]>();

  return requireData(data, error, "Unable to load session sets") ?? [];
}

async function buildSessionDetail(client: DbClient, userId: string, sessionId: string) {
  const sessionRow = await getSessionRecord(client, userId, sessionId);

  if (!sessionRow) {
    return null;
  }

  const exerciseRows = await getSessionExercises(client, sessionId);
  const setRows = await getSessionSets(
    client,
    exerciseRows.map((exercise) => exercise.id),
  );

  const exercises = exerciseRows.map((exerciseRow) =>
    mapSessionExercise(
      exerciseRow,
      setRows.filter((set) => set.session_exercise_id === exerciseRow.id),
    ),
  );

  return buildSessionWithProgress({
    id: sessionRow.id,
    scheduledWorkoutId: sessionRow.scheduled_workout_id,
    templateId: sessionRow.workout_template_id,
    workoutName: sessionRow.workout_name,
    workoutLabel: sessionRow.workout_label,
    status: sessionRow.status,
    scheduledDate: sessionRow.scheduled_workouts?.scheduled_date ?? formatISO(new Date(), { representation: "date" }),
    startedAt: sessionRow.started_at,
    completedAt: sessionRow.completed_at,
    updatedAt: sessionRow.updated_at,
    unitPreference: sessionRow.profiles?.unit_preference ?? "kg",
    user: {
      id: userId,
      fullName: sessionRow.profiles?.full_name ?? "Athlete",
      avatarUrl: sessionRow.profiles?.avatar_url ?? null,
      unitPreference: sessionRow.profiles?.unit_preference ?? "kg",
    },
    exercises,
    progress: {
      completedExercises: 0,
      totalExercises: exercises.length,
      completedSets: 0,
      totalSets: exercises.reduce((total, exercise) => total + exercise.sets.length, 0),
    },
  });
}

async function getTemplateExercises(client: DbClient, templateId: string) {
  const { data, error } = await client
    .from("workout_template_exercises")
    .select(
      `
      id,
      sort_order,
      planned_sets,
      rest_seconds,
      block_key,
      block_role,
      exercise_definitions!workout_template_exercises_exercise_definition_id_fkey (
        id,
        name,
        subtitle,
        load_type,
        media_path,
        per_side
      )
    `,
    )
    .eq("workout_template_id", templateId)
    .order("sort_order", { ascending: true })
    .returns<TemplateExerciseRow[]>();

  return requireData(data, error, "Unable to load template exercises") ?? [];
}

async function getLatestSessionForScheduledWorkout(
  client: DbClient,
  userId: string,
  scheduledWorkoutId: string,
) {
  const { data, error } = await client
    .from("workout_sessions")
    .select("id, status, completed_at, updated_at")
    .eq("profile_id", userId)
    .eq("scheduled_workout_id", scheduledWorkoutId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .returns<
      Array<{
        id: string;
        status: WorkoutSessionDetail["status"];
        completed_at: string | null;
        updated_at: string;
      }>
    >();

  return requireData(data, error, "Unable to load scheduled workout session state")?.[0] ?? null;
}

async function getScheduledWorkoutPreviewByFilter(
  client: DbClient,
  userId: string,
  filter: { id?: string; scheduledDate?: string },
) {
  let query = client
    .from("scheduled_workouts")
    .select(
      `
      id,
      scheduled_date,
      workout_template_id,
      workout_templates!scheduled_workouts_workout_template_id_fkey (
        id,
        workout_name,
        workout_label
      )
    `,
    )
    .eq("profile_id", userId);

  if (filter.id) {
    query = query.eq("id", filter.id);
  }

  if (filter.scheduledDate) {
    query = query.eq("scheduled_date", filter.scheduledDate);
  }

  const { data, error } = await query.maybeSingle<{
    id: string;
    scheduled_date: string;
    workout_template_id: string;
    workout_templates: {
      id: string;
      workout_name: string;
      workout_label: string;
    } | null;
  }>();

  const scheduledWorkout = requireData(data, error, "Unable to load scheduled workout");

  if (!scheduledWorkout?.workout_templates) {
    return null;
  }

  const templateExercises = await getTemplateExercises(client, scheduledWorkout.workout_template_id);
  const latestSession = await getLatestSessionForScheduledWorkout(client, userId, scheduledWorkout.id);

  const status =
    latestSession?.status === "completed"
      ? "completed"
      : latestSession?.status === "partial"
        ? "partial"
        : latestSession?.status
          ? "in_progress"
          : "scheduled";

  return {
    id: scheduledWorkout.id,
    templateId: scheduledWorkout.workout_templates.id,
    scheduledDate: scheduledWorkout.scheduled_date,
    workoutName: scheduledWorkout.workout_templates.workout_name,
    workoutLabel: scheduledWorkout.workout_templates.workout_label,
    status,
    exercises: templateExercises.map(mapPreviewExercise),
    activeSessionId: latestSession?.id ?? null,
  } satisfies ScheduledWorkoutPreview;
}

async function getLatestCompletedSetsForExercise(
  client: DbClient,
  userId: string,
  exerciseDefinitionId: string,
) {
  const { data: latestExerciseRows, error: latestExerciseError } = await client
    .from("session_exercises")
    .select(
      `
      id,
      workout_sessions!inner (
        profile_id,
        status,
        completed_at
      )
    `,
    )
    .eq("exercise_definition_id", exerciseDefinitionId)
    .eq("workout_sessions.profile_id", userId)
    .eq("workout_sessions.status", "completed")
    .order("completed_at", {
      ascending: false,
      referencedTable: "workout_sessions",
    })
    .limit(1)
    .returns<
      Array<{
        id: string;
      }>
    >();

  const latestExercise = requireData(
    latestExerciseRows,
    latestExerciseError,
    "Unable to load previous exercise history",
  )?.[0];

  if (!latestExercise) {
    return [] as SessionSetRow[];
  }

  const { data, error } = await client
    .from("session_sets")
    .select(
      `
      id,
      session_exercise_id,
      set_order,
      set_label,
      planned,
      is_extra_set,
      weight,
      reps,
      duration_seconds,
      completed,
      previous_weight,
      previous_reps,
      previous_duration_seconds,
      previous_trend,
      updated_at
    `,
    )
    .eq("session_exercise_id", latestExercise.id)
    .order("set_order", { ascending: true })
    .returns<SessionSetRow[]>();

  return requireData(data, error, "Unable to load previous set history") ?? [];
}

async function createSessionSnapshot(
  client: DbClient,
  user: User,
  preview: ScheduledWorkoutPreview,
) {
  const startedAt = new Date().toISOString();
  const { data: insertedSession, error: sessionError } = await client
    .from("workout_sessions")
    .insert({
      profile_id: user.id,
      scheduled_workout_id: preview.id,
      workout_template_id: preview.templateId,
      workout_name: preview.workoutName,
      workout_label: preview.workoutLabel,
      status: "active",
      started_at: startedAt,
      updated_at: startedAt,
    })
    .select("id")
    .single<{ id: string }>();

  const session = requireData(insertedSession, sessionError, "Unable to create workout session");

  if (!session) {
    throw new Error("Unable to create workout session");
  }

  const templateExercises = await getTemplateExercises(client, preview.templateId);

  const sessionExerciseInserts = templateExercises.map((exercise) => {
    if (!exercise.exercise_definitions) {
      throw new Error(`Missing exercise definition for template exercise ${exercise.id}`);
    }

    return {
      workout_session_id: session.id,
      exercise_definition_id: exercise.exercise_definitions.id,
      sort_order: exercise.sort_order,
      block_key: exercise.block_key,
      block_role: exercise.block_role,
      name: exercise.exercise_definitions.name,
      subtitle: exercise.exercise_definitions.subtitle,
      load_type: exercise.exercise_definitions.load_type,
      per_side: exercise.exercise_definitions.per_side,
      planned_sets: exercise.planned_sets,
      rest_seconds: exercise.rest_seconds,
      media_path: exercise.exercise_definitions.media_path,
      note: "",
      note_updated_at: startedAt,
    };
  });

  const { data: insertedExercises, error: exerciseError } = await client
    .from("session_exercises")
    .insert(sessionExerciseInserts)
    .select(
      `
      id,
      exercise_definition_id,
      sort_order,
      block_key,
      block_role,
      name,
      subtitle,
      load_type,
      per_side,
      planned_sets,
      rest_seconds,
      media_path,
      note,
      note_updated_at
    `,
    )
    .returns<SessionExerciseRow[]>();

  const sessionExercises = requireData(
    insertedExercises,
    exerciseError,
    "Unable to create session exercises",
  ) ?? [];

  for (const sessionExercise of sessionExercises) {
    const previousSets = await getLatestCompletedSetsForExercise(
      client,
      user.id,
      sessionExercise.exercise_definition_id,
    );

    const setInserts = Array.from({ length: sessionExercise.planned_sets }, (_, index) => {
      const previousSet = previousSets[index];
      const nextWeight =
        sessionExercise.load_type === "weighted" ? previousSet?.weight ?? null : null;
      const nextReps =
        sessionExercise.load_type === "timed"
          ? null
          : previousSet?.reps ?? null;
      const nextDuration =
        sessionExercise.load_type === "timed"
          ? previousSet?.duration_seconds ?? null
          : null;

      const currentMetric = sessionExercise.load_type === "timed" ? nextDuration : nextReps;
      const previousMetric =
        sessionExercise.load_type === "timed"
          ? previousSet?.duration_seconds ?? null
          : previousSet?.reps ?? null;

      return {
        session_exercise_id: sessionExercise.id,
        set_order: index + 1,
        set_label: `${index + 1}${sessionExercise.block_role ?? ""}`,
        planned: true,
        is_extra_set: false,
        weight: nextWeight,
        reps: nextReps,
        duration_seconds: nextDuration,
        completed: false,
        previous_weight: previousSet?.weight ?? nextWeight,
        previous_reps: previousSet?.reps ?? nextReps,
        previous_duration_seconds: previousSet?.duration_seconds ?? nextDuration,
        previous_trend: compareMetricTrend(currentMetric, previousMetric),
        updated_at: startedAt,
      };
    });

    const { error } = await client.from("session_sets").insert(setInserts);

    if (error) {
      throw new Error(`Unable to create session sets: ${error.message}`);
    }
  }

  return session.id;
}

async function updateSessionTimestamp(client: DbClient, sessionId: string) {
  const { error } = await client
    .from("workout_sessions")
    .update({
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    throw new Error(`Unable to update session timestamp: ${error.message}`);
  }
}

export function createSupabaseWorkoutRepository(
  client: DbClient,
  user: User,
): WorkoutRepository {
  return {
    async getTodayWorkout() {
      const today = formatISO(new Date(), { representation: "date" });
      const preview = await getScheduledWorkoutPreviewByFilter(client, user.id, {
        scheduledDate: today,
      });

      return preview ? deriveTodayStatus(preview) : null;
    },

    async listRecentSessions(filters) {
      const trimmedQuery = filters?.query?.trim();
      let query = client
        .from("workout_sessions")
        .select("id")
        .eq("profile_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(filters?.limit ?? 20);

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (trimmedQuery) {
        query = query.or(
          `workout_name.ilike.%${trimmedQuery}%,workout_label.ilike.%${trimmedQuery}%`,
        );
      }

      const { data, error } = await query.returns<Array<{ id: string }>>();
      const sessionIds = requireData(data, error, "Unable to load recent sessions") ?? [];

      const details = await Promise.all(
        sessionIds.map(async (entry) => buildSessionDetail(client, user.id, entry.id)),
      );

      return details
        .filter((session): session is WorkoutSessionDetail => Boolean(session))
        .map((session) => ({
          id: session.id,
          templateId: session.templateId,
          scheduledDate: session.scheduledDate,
          workoutName: session.workoutName,
          workoutLabel: session.workoutLabel,
          status: session.status,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          updatedAt: session.updatedAt,
          completedExercises: session.progress.completedExercises,
          totalExercises: session.progress.totalExercises,
          completedSets: session.progress.completedSets,
          totalSets: session.progress.totalSets,
        }))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    },

    async getScheduledWorkoutPreview(id: string) {
      return getScheduledWorkoutPreviewByFilter(client, user.id, { id });
    },

    async startWorkoutSession(id: string) {
      const preview = await getScheduledWorkoutPreviewByFilter(client, user.id, { id });

      if (!preview) {
        return null;
      }

      if (preview.activeSessionId) {
        return buildSessionDetail(client, user.id, preview.activeSessionId);
      }

      const sessionId = await createSessionSnapshot(client, user, preview);

      return buildSessionDetail(client, user.id, sessionId);
    },

    async getSessionDetail(id: string) {
      return buildSessionDetail(client, user.id, id);
    },

    async saveSessionSet(sessionId, setId, patch) {
      const payload = {
        ...(patch.weight !== undefined ? { weight: patch.weight } : {}),
        ...(patch.reps !== undefined ? { reps: patch.reps } : {}),
        ...(patch.durationSeconds !== undefined
          ? { duration_seconds: patch.durationSeconds }
          : {}),
        ...(patch.completed !== undefined ? { completed: patch.completed } : {}),
        updated_at: new Date().toISOString(),
      };

      const { error } = await client.from("session_sets").update(payload).eq("id", setId);

      if (error) {
        throw new Error(`Unable to save session set: ${error.message}`);
      }

      await updateSessionTimestamp(client, sessionId);
      return buildSessionDetail(client, user.id, sessionId);
    },

    async saveExerciseNote(sessionId, sessionExerciseId, notes) {
      const { error } = await client
        .from("session_exercises")
        .update({
          note: notes,
          note_updated_at: new Date().toISOString(),
        })
        .eq("id", sessionExerciseId);

      if (error) {
        throw new Error(`Unable to save exercise note: ${error.message}`);
      }

      await updateSessionTimestamp(client, sessionId);
      return buildSessionDetail(client, user.id, sessionId);
    },

    async addExtraSet(sessionId, sessionExerciseId) {
      const { data: existingSets, error: existingSetsError } = await client
        .from("session_sets")
        .select(
          `
          id,
          session_exercise_id,
          set_order,
          set_label,
          planned,
          is_extra_set,
          weight,
          reps,
          duration_seconds,
          completed,
          previous_weight,
          previous_reps,
          previous_duration_seconds,
          previous_trend,
          updated_at
        `,
        )
        .eq("session_exercise_id", sessionExerciseId)
        .order("set_order", { ascending: false })
        .limit(1)
        .returns<SessionSetRow[]>();

      const latestSet = requireData(
        existingSets,
        existingSetsError,
        "Unable to load last set before cloning",
      )?.[0];

      const { data: exerciseRows, error: exerciseError } = await client
        .from("session_exercises")
        .select("block_role, load_type")
        .eq("id", sessionExerciseId)
        .limit(1)
        .returns<Array<{ block_role: BlockRole; load_type: LoadType }>>();

      const exercise = requireData(exerciseRows, exerciseError, "Unable to load session exercise")?.[0];

      if (!exercise) {
        return null;
      }

      const nextOrder = (latestSet?.set_order ?? 0) + 1;
      const { error } = await client.from("session_sets").insert({
        session_exercise_id: sessionExerciseId,
        set_order: nextOrder,
        set_label: `${nextOrder}${exercise.block_role ?? ""}`,
        planned: false,
        is_extra_set: true,
        weight: latestSet?.weight ?? null,
        reps: latestSet?.reps ?? null,
        duration_seconds: latestSet?.duration_seconds ?? null,
        completed: false,
        previous_weight: latestSet?.previous_weight ?? null,
        previous_reps: latestSet?.previous_reps ?? null,
        previous_duration_seconds: latestSet?.previous_duration_seconds ?? null,
        previous_trend: latestSet?.previous_trend ?? null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Unable to add extra set: ${error.message}`);
      }

      await updateSessionTimestamp(client, sessionId);
      return buildSessionDetail(client, user.id, sessionId);
    },

    async removeExtraSet(sessionId, setId) {
      const { data, error } = await client
        .from("session_sets")
        .delete()
        .eq("id", setId)
        .eq("is_extra_set", true)
        .select("id")
        .returns<Array<{ id: string }>>();

      requireData(data, error, "Unable to remove extra set");
      await updateSessionTimestamp(client, sessionId);
      return buildSessionDetail(client, user.id, sessionId);
    },

    async finishWorkoutSession(sessionId) {
      const currentSession = await buildSessionDetail(client, user.id, sessionId);

      if (!currentSession) {
        return null;
      }

      const status =
        currentSession.progress.completedExercises === currentSession.progress.totalExercises
          ? "completed"
          : "partial";

      const completedAt = new Date().toISOString();
      const { error } = await client
        .from("workout_sessions")
        .update({
          status,
          completed_at: completedAt,
          updated_at: completedAt,
        })
        .eq("id", sessionId);

      if (error) {
        throw new Error(`Unable to finish workout session: ${error.message}`);
      }

      return buildSessionDetail(client, user.id, sessionId);
    },
  };
}
