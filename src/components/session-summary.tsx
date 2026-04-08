import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
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
}

export function SessionSummary({ session, viewerLabel, authMode }: SessionSummaryProps) {
  const groups = buildExerciseGroups(session.exercises);
  const isComplete = session.status === "completed";
  const noteCount = countExercisesWithNotes(session.exercises);
  const endedAt = session.completedAt ?? session.updatedAt;

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-slate-200/70 px-6 pb-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {isComplete ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-4" />}
              {isComplete ? "Completed Workout" : "Partial Workout"}
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
          <p className="mt-4 text-sm font-medium text-sky-600">{formatWorkoutDate(session.scheduledDate)}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-950">
            {session.workoutName}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Logged {session.progress.completedSets} of {session.progress.totalSets} sets
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Duration</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {formatSessionDuration(session.startedAt, endedAt)}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Notes</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{noteCount}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Started</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">
                {formatSessionDateTime(session.startedAt)}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-4">
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
            {groups.map((group) => (
              <article
                key={group.id}
                className="rounded-[28px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_16px_40px_rgba(148,163,184,0.14)]"
              >
                {group.exercises.length > 1 ? (
                  <div className="mb-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Superset
                  </div>
                ) : null}
                <div className="space-y-5">
                  {group.exercises.map((exercise) => (
                    <div key={exercise.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-950">{exercise.name}</h2>
                          <p className="text-sm text-slate-600">{exercise.subtitle}</p>
                        </div>
                        {exercise.blockRole ? (
                          <span className="rounded-2xl bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                            {exercise.blockRole}
                          </span>
                        ) : null}
                      </div>
                      {exercise.notes ? (
                        <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                          {exercise.notes}
                        </div>
                      ) : null}
                      <div className="mt-4 space-y-2">
                        {exercise.sets.map((set, index) => (
                          <div
                            key={set.id}
                            className="grid grid-cols-[auto,1fr,auto] items-center gap-3 rounded-2xl bg-emerald-50/70 px-3 py-3"
                          >
                            <span className="text-sm font-semibold text-slate-700">{set.setLabel}</span>
                            <span className="text-sm text-slate-700">{formatSetSummary(exercise, index)}</span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 className="size-3.5" />
                              {set.completed ? "Done" : "Skipped"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="border-t border-slate-200/70 bg-white/85 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/today"
              className="flex items-center justify-center rounded-full border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700"
            >
              Back to today
            </Link>
            <Link
              href="/history"
              className="flex items-center justify-center rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white"
            >
              View history
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
