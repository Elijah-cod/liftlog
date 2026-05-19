import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock4,
  Dumbbell,
  History,
  NotebookPen,
  Sparkles,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { formatWorkoutDate } from "@/lib/session-utils";
import { requirePageAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";

export default async function TodayPage() {
  const auth = await requirePageAuth("/today");
  const repository = await getWorkoutRepository(auth);
  const workout = await repository.getTodayWorkout();
  const authMode = auth ? "live" : "mock";
  const viewerLabel = auth?.user.email ?? "Mock athlete";

  if (!workout) {
    return (
      <AppShell contentClassName="flex items-center justify-center">
        <div className="mx-auto max-w-lg px-6 py-10 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-sm">
            <CalendarDays className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-slate-950 text-balance">
            No workout scheduled
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 text-pretty">
            {auth
              ? "Your live account is authenticated, but there is no scheduled workout for today yet. Use the setup guide to seed a schedule, or add one directly in Supabase."
              : "You can explore the full logging flow in mock mode right away, then connect Supabase when you are ready for live data."}
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={auth ? "/setup" : "/login"}
              className="action-button interactive-lift rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
            >
              {auth ? "Open setup guide" : "Open login"}
            </Link>
            <Link
              href="/history"
              className="secondary-button interactive-lift rounded-full px-5 py-3 text-center text-sm font-semibold text-slate-700"
            >
              View history
            </Link>
            <Link
              href="/api/health"
              className="secondary-button interactive-lift rounded-full px-5 py-3 text-center text-sm font-semibold text-slate-700"
            >
              Check health
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-white/70 px-6 pb-6 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="eyebrow-chip">
              <Clock4 className="size-4" />
              Today's control hub
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.9fr)]">
            <div>
              <p className="text-sm font-medium text-sky-700">{formatWorkoutDate(workout.scheduledDate)}</p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-slate-950 text-balance sm:text-[2.85rem]">
                Keep the next decision obvious.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 text-pretty sm:text-[0.95rem]">
                LiftLog opens straight into the plan, the current workout state, and the fastest path back into logging, so you can keep training without losing the thread.
              </p>
            </div>
            <div className="surface-panel rounded-[28px] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Today's posture
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {workout.status === "scheduled"
                  ? "Fresh and ready to start"
                  : workout.status === "in_progress"
                    ? "Already in motion"
                    : workout.status === "completed"
                      ? "Logged and ready to review"
                      : "Saved partway through"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                One-handed, mid-workout, and still in control of the split even if the plan needs a practical adjustment.
              </p>
            </div>
          </div>
        </section>

        <section className="flex-1 px-4 py-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.85fr)]">
            <article className="surface-panel overflow-hidden rounded-[32px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="status-chip border-fuchsia-200 bg-[linear-gradient(135deg,#fdf2f8,#fae8ff)] text-fuchsia-700">
                    <Sparkles className="size-3.5" />
                    {workout.status === "scheduled"
                      ? "Ready"
                      : workout.status === "in_progress"
                        ? "Live"
                        : workout.status === "completed"
                          ? "Done"
                          : "Partial"}
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-slate-950 text-balance sm:text-[2.5rem]">
                    {workout.workoutName}
                  </h2>
                  <p className="mt-2 text-base font-medium text-slate-700">{workout.workoutLabel}</p>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 text-pretty">
                    Open the session, keep each set close at hand, and finish with a record that still makes sense when training conditions change.
                  </p>
                </div>
                <div className="surface-panel-muted rounded-[24px] px-4 py-4 lg:w-[15rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Main action
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {workout.activeSessionId ? "Jump back into the current session." : "Preview the structure, then start clean."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="metric-panel rounded-[24px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] px-4 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Dumbbell className="size-3.5" />
                    Exercises
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{workout.totalExercises}</p>
                </div>
                <div className="metric-panel rounded-[24px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#dcfce7)] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Workout state</div>
                  <p className="mt-3 text-lg font-semibold capitalize text-slate-950">{workout.status}</p>
                </div>
                <div className="metric-panel rounded-[24px] border border-violet-100 bg-[linear-gradient(135deg,#f5f3ff,#eef2ff)] px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Flow cue</div>
                  <p className="mt-3 text-lg font-semibold text-slate-950">
                    {workout.activeSessionId ? "Resume the next set" : "Review before you move"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Link
                  href={
                    workout.activeSessionId
                      ? `/sessions/${workout.activeSessionId}`
                      : `/workouts/${workout.scheduledWorkoutId}`
                  }
                  className="action-button interactive-lift flex min-h-14 items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-white"
                >
                  {workout.activeSessionId ? "Resume Session" : "Open Workout"}
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/history"
                  className="secondary-button interactive-lift flex min-h-14 items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-semibold text-slate-700"
                >
                  <History className="size-4" />
                  View history
                </Link>
              </div>
            </article>

            <div className="space-y-4">
              <article className="surface-panel rounded-[28px] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Training continuity
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {workout.activeSessionId
                    ? "Your last in-progress session is still intact."
                    : "Start from a clean snapshot of today's split."}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Draft recovery and session history are built to keep the log dependable even if you reload or switch context mid-workout.
                </p>
              </article>

              <article className="surface-panel-muted rounded-[28px] px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#eff6ff,#ede9fe)] text-violet-700 shadow-sm">
                    <NotebookPen className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">If equipment changes</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Preview the structure first, then use session notes to capture any accessory substitution so the workout record still reads clearly later.
                    </p>
                  </div>
                </div>
              </article>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Link href="/setup" className="surface-panel interactive-lift rounded-[24px] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Operability
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-950">Open setup checklist</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Move between demo, live auth, and schedule tools without leaving the main product rhythm.
                  </p>
                </Link>
                <Link href="/history" className="surface-panel interactive-lift rounded-[24px] px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Journal trail
                  </p>
                  <p className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-slate-950">
                    Review recent sessions
                    <ArrowUpRight className="size-4 text-slate-400" />
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Check what was finished, what was partial, and what is still resumable.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
