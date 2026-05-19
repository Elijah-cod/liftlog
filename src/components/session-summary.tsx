import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { ExerciseMediaTile } from "@/components/exercise-media-tile";
import { RepeatWorkoutActions } from "@/components/repeat-workout-actions";
import {
  buildExerciseGroups,
  countExercisesWithNotes,
  formatSessionDateTime,
  formatSessionDuration,
  formatSetSummary,
  formatWorkoutDate,
} from "@/lib/session-utils";
import type { WorkoutSessionDetail } from "@/lib/types";

interface SessionSummaryProps {
  session: WorkoutSessionDetail;
  viewerLabel: string;
  authMode: "mock" | "live";
  actionState?: {
    scheduled?: boolean;
    slot?: string;
    actionError?: string;
  };
}

export function SessionSummary({
  session,
  viewerLabel,
  authMode,
  actionState,
}: SessionSummaryProps) {
  const groups = buildExerciseGroups(session.exercises);
  const isComplete = session.status === "completed";
  const noteCount = countExercisesWithNotes(session.exercises);
  const endedAt = session.completedAt ?? session.updatedAt;

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-white/70 px-6 pb-6 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
              {isComplete ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-4" />}
              {isComplete ? "Workout Complete" : "Partial Save"}
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
          <p className="mt-4 text-sm font-medium text-sky-700">{formatWorkoutDate(session.scheduledDate)}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950 text-balance">
            {session.workoutName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 text-pretty">
            Logged {session.progress.completedSets} of {session.progress.totalSets} sets
          </p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Duration</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatSessionDuration(session.startedAt, endedAt)}
              </p>
            </div>
            <div className="rounded-3xl border border-fuchsia-100 bg-[linear-gradient(135deg,#fdf4ff,#fae8ff)] px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">Notes</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{noteCount}</p>
            </div>
            <div className="rounded-3xl border border-amber-100 bg-[linear-gradient(135deg,#fff7ed,#fde68a33)] px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Started</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {formatSessionDateTime(session.startedAt)}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)] px-4 py-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {isComplete ? "Finished" : "Saved"}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {formatSessionDateTime(endedAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            {actionState?.scheduled ? (
              <div className="feedback-success rounded-3xl px-4 py-3 text-sm">
                {session.workoutName} is back on the calendar for {actionState.slot === "tomorrow" ? "tomorrow" : "today"}.
              </div>
            ) : null}

            {actionState?.actionError ? (
              <div className="feedback-error rounded-3xl px-4 py-3 text-sm">
                {actionState.actionError}
              </div>
            ) : null}

            {groups.map((group) => (
              <article
                key={group.id}
                className="surface-panel rounded-[28px] px-4 py-4"
              >
                {group.exercises.length > 1 ? (
                  <div className="mb-4 inline-flex rounded-full border border-fuchsia-200 bg-[linear-gradient(135deg,#fdf4ff,#fae8ff)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                    Superset
                  </div>
                ) : null}
                <div className="space-y-5">
                  {group.exercises.map((exercise) => (
                    <div key={exercise.id}>
                      <div className="flex gap-4">
                        <ExerciseMediaTile
                          name={exercise.name}
                          mediaPath={exercise.mediaPath}
                          loadType={exercise.loadType}
                          className="h-16 w-16 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                          <h2 className="break-words text-lg font-semibold text-slate-950">{exercise.name}</h2>
                          <p className="text-sm text-slate-600">{exercise.subtitle}</p>
                            </div>
                            {exercise.blockRole ? (
                              <span className="self-start rounded-2xl bg-[linear-gradient(135deg,#eff6ff,#ede9fe)] px-3 py-1 text-sm font-semibold text-violet-700">
                                {exercise.blockRole}
                              </span>
                            ) : null}
                          </div>
                          {exercise.notes ? (
                            <div className="mt-3 rounded-2xl border border-amber-100 bg-[linear-gradient(135deg,#fffdf4,#fff7ed)] px-3 py-2 text-sm text-slate-600">
                              {exercise.notes}
                            </div>
                          ) : null}
                          <div className="mt-4 space-y-2">
                            {exercise.sets.map((set, index) => (
                              <div
                                key={set.id}
                                className="grid grid-cols-1 gap-3 rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#f0fdf4)] px-3 py-3 sm:grid-cols-[auto,minmax(0,1fr),auto] sm:items-center"
                              >
                                <span className="text-sm font-semibold text-slate-700">{set.setLabel}</span>
                                <span className="min-w-0 text-sm text-slate-700">{formatSetSummary(exercise, index)}</span>
                                <span className="inline-flex items-center gap-1 self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 sm:self-center">
                                  <CheckCircle2 className="size-3.5" />
                                  {set.completed ? "Done" : "Skipped"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="border-t border-white/70 bg-white/80 px-4 py-4 backdrop-blur">
          {isComplete || session.status === "partial" ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Schedule this workout again
              </p>
              <RepeatWorkoutActions
                authMode={authMode}
                templateId={session.templateId}
                workoutName={session.workoutName}
                redirectTo={`/sessions/${session.id}/complete`}
              />
            </div>
          ) : null}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href="/today"
              className="secondary-button interactive-lift flex items-center justify-center rounded-full px-5 py-4 text-sm font-semibold text-sky-700 shadow-sm"
            >
              Back to today
            </Link>
            <Link
              href="/history"
              className="action-button interactive-lift flex items-center justify-center rounded-full px-5 py-4 text-sm font-semibold text-white"
            >
              View history
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
