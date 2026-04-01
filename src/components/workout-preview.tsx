import Link from "next/link";
import { ChevronRight, Dumbbell, Play, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { buildExerciseGroups, formatWorkoutDate } from "@/lib/session-utils";
import type { ScheduledWorkoutPreview } from "@/lib/types";

interface WorkoutPreviewProps {
  workout: ScheduledWorkoutPreview;
  viewerLabel: string;
  authMode: "mock" | "live";
}

export function WorkoutPreview({ workout, viewerLabel, authMode }: WorkoutPreviewProps) {
  const groups = buildExerciseGroups(
    workout.exercises.map((exercise) => ({
      ...exercise,
      notes: "",
      noteUpdatedAt: new Date().toISOString(),
      restSeconds: 0,
      perSide: exercise.subtitle.includes("per side"),
      sets: [],
    })),
  );

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-slate-200/70 px-6 pb-6 pt-8">
          <p className="text-sm font-medium text-sky-600">{formatWorkoutDate(workout.scheduledDate)}</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                {workout.workoutName}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{workout.workoutLabel}</p>
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
          <div className="mt-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            {workout.status === "completed"
              ? "Complete"
              : workout.status === "partial"
                ? "Partial"
                : workout.status === "in_progress"
                  ? "In Progress"
                  : "Queued"}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <Dumbbell className="size-3.5" />
                Exercises
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{workout.exercises.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <Sparkles className="size-3.5" />
                Supersets
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {groups.filter((group) => group.exercises.length > 1).length}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Focus</div>
              <p className="mt-3 text-lg font-semibold text-slate-950">{workout.workoutLabel}</p>
            </div>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {groups.map((group) => (
              <article
                key={group.id}
                className="rounded-[28px] border border-slate-200/80 bg-white px-4 py-4 shadow-[0_16px_40px_rgba(148,163,184,0.14)]"
              >
                {group.exercises.length > 1 ? (
                  <div className="mb-3 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                    Superset
                  </div>
                ) : null}
                <div className="space-y-4">
                  {group.exercises.map((exercise) => (
                    <div key={exercise.id} className="flex gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#dbeafe,#eef4ff)] text-xs font-semibold text-sky-700">
                        {exercise.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold leading-6 text-slate-950">{exercise.name}</h2>
                            <p className="mt-1 text-sm text-slate-600">{exercise.subtitle}</p>
                          </div>
                          {exercise.blockRole ? (
                            <span className="rounded-2xl bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                              {exercise.blockRole}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="border-t border-slate-200/70 bg-white/85 px-4 py-4">
          <Link
            href={
              workout.activeSessionId
                ? `/sessions/${workout.activeSessionId}`
                : `/workouts/${workout.id}/start`
            }
            className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(14,116,255,0.35)] transition hover:bg-sky-500"
            prefetch
          >
            <Play className="size-4" />
            {workout.activeSessionId ? "Resume Workout" : "Start Workout"}
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
