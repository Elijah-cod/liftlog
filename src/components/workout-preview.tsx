import Link from "next/link";
import {
  ChevronRight,
  Clock3,
  Dumbbell,
  NotebookPen,
  Play,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { ExerciseMediaTile } from "@/components/exercise-media-tile";
import {
  buildExerciseGroups,
  formatSessionDateTime,
  formatSessionDuration,
  formatWorkoutDate,
} from "@/lib/session-utils";
import type { ScheduledWorkoutPreview, SessionStatus } from "@/lib/types";

function getRecentStatusLabel(status: SessionStatus) {
  switch (status) {
    case "completed":
      return "Finished";
    case "partial":
      return "Partial";
    case "active":
      return "In progress";
    case "draft":
      return "Draft";
    default:
      return "Recent";
  }
}

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
  const supersetCount = groups.filter((group) => group.exercises.length > 1).length;

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-white/70 px-6 pb-6 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-700">{formatWorkoutDate(workout.scheduledDate)}</p>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950 text-balance sm:text-[2.4rem]">
                Review the structure before you move.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 text-pretty">
                Preview the split, look for the points where pace matters, and step into the session with a clear sense of what comes first, what can flex, and what needs to be logged cleanly.
              </p>
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
            <div className="space-y-4">
              <article className="surface-panel rounded-[32px] px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="status-chip border-sky-200 bg-[linear-gradient(135deg,#f0f9ff,#dbeafe)] text-sky-700">
                      <Sparkles className="size-3.5" />
                      {workout.status === "completed"
                        ? "Finished"
                        : workout.status === "partial"
                          ? "Partial"
                          : workout.status === "in_progress"
                            ? "Live"
                            : "Ready"}
                    </div>
                    <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 text-balance">
                      {workout.workoutName}
                    </h2>
                    <p className="mt-2 text-base font-medium text-slate-700">{workout.workoutLabel}</p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      This preview should answer three questions quickly: what the session is asking for, how dense it is, and where you have room to adapt if a station is busy.
                    </p>
                  </div>
                  <div className="surface-panel-muted rounded-[24px] px-4 py-4 lg:w-[15rem]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Start posture
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      Open the session with the sequence already mapped in your head.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="metric-panel rounded-[24px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                      <Dumbbell className="size-3.5" />
                      Exercises
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{workout.exercises.length}</p>
                  </div>
                  <div className="metric-panel rounded-[24px] border border-fuchsia-100 bg-[linear-gradient(135deg,#fdf4ff,#fae8ff)] p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                      <Sparkles className="size-3.5" />
                      Supersets
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{supersetCount}</p>
                  </div>
                  <div className="metric-panel rounded-[24px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Focus</div>
                    <p className="mt-3 text-lg font-semibold text-slate-950">{workout.workoutLabel}</p>
                  </div>
                </div>

                {workout.recentSession ? (
                  <div className="surface-panel-muted mt-5 rounded-[28px] px-4 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Last performed
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {formatWorkoutDate(workout.recentSession.scheduledDate)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {formatSessionDateTime(
                            workout.recentSession.completedAt ?? workout.recentSession.updatedAt,
                          )}
                        </p>
                      </div>
                      <span className="status-chip border-violet-200 bg-[linear-gradient(135deg,#eef2ff,#ede9fe)] text-violet-700">
                        {getRecentStatusLabel(workout.recentSession.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="metric-panel rounded-[20px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                          Duration
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">
                          {formatSessionDuration(
                            workout.recentSession.startedAt,
                            workout.recentSession.completedAt ?? workout.recentSession.updatedAt,
                          )}
                        </p>
                      </div>
                      <div className="metric-panel rounded-[20px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          Exercises
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">
                          {workout.recentSession.completedExercises}/{workout.recentSession.totalExercises}
                        </p>
                      </div>
                      <div className="metric-panel rounded-[20px] border border-fuchsia-100 bg-[linear-gradient(135deg,#fdf4ff,#ffffff)] px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                          Sets
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">
                          {workout.recentSession.completedSets}/{workout.recentSession.totalSets}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/sessions/${workout.recentSession.sessionId}/complete`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
                    >
                      <Clock3 className="size-4" />
                      Review last summary
                    </Link>
                  </div>
                ) : (
                  <div className="surface-panel-muted mt-5 rounded-[28px] border-dashed px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                      Last performed
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      No finished history yet for this training block. Your first completed session will show up here.
                    </p>
                  </div>
                )}
              </article>

              <div className="space-y-3">
                {groups.map((group) => (
                  <article key={group.id} className="surface-panel rounded-[28px] px-4 py-4">
                    {group.exercises.length > 1 ? (
                      <div className="mb-3 inline-flex items-center rounded-full border border-fuchsia-200 bg-[linear-gradient(135deg,#fdf4ff,#fae8ff)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                        Superset
                      </div>
                    ) : null}
                    <div className="space-y-4">
                      {group.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex gap-4">
                          <ExerciseMediaTile
                            name={exercise.name}
                            mediaPath={exercise.mediaPath}
                            loadType={exercise.loadType}
                            className="h-16 w-16 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <h2 className="break-words text-lg font-semibold leading-6 text-slate-950">
                                  {exercise.name}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">{exercise.subtitle}</p>
                              </div>
                              {exercise.blockRole ? (
                                <span className="self-start rounded-2xl bg-[linear-gradient(135deg,#eff6ff,#ede9fe)] px-3 py-1 text-sm font-semibold text-violet-700">
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
            </div>

            <div className="space-y-4">
              <article className="surface-panel rounded-[28px] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Adapt without losing the log
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  If an accessory station is taken, keep the session moving and capture the swap clearly.
                </p>
                <div className="mt-4 flex items-start gap-3 rounded-[24px] border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,#eef2ff)] px-4 py-4">
                  <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-white text-violet-700 shadow-sm">
                    <NotebookPen className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Swap cue</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Start the workout, then note the substitute on the exercise you changed. The record stays readable, and you do not lose the flow trying to re-plan the whole split.
                    </p>
                  </div>
                </div>
              </article>

              <article className="surface-panel-muted rounded-[28px] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  What this screen should settle
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>1. How dense is today's session?</li>
                  <li>2. Where are the supersets and pace changes?</li>
                  <li>3. What can flex if equipment is unavailable?</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <div className="sticky bottom-0 border-t border-white/70 bg-white/82 px-4 py-4 backdrop-blur">
          <Link
            href={
              workout.activeSessionId
                ? `/sessions/${workout.activeSessionId}`
                : `/workouts/${workout.id}/start`
            }
            className="action-button interactive-lift flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-white"
            prefetch
          >
            <Play className="size-4" />
            {workout.activeSessionId ? "Resume Session" : "Start Workout"}
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
