import Link from "next/link";
import { CalendarDays, ChevronRight, Clock4, Dumbbell, History } from "lucide-react";

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
        <div className="mx-auto max-w-sm px-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <CalendarDays className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-slate-950">
            No workout scheduled
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {auth
              ? "Your live account is authenticated, but there is no scheduled workout for today yet. Use the setup guide to seed a schedule, or add one directly in Supabase."
              : "The MVP is focused on workout execution, so this screen stays intentionally simple until schedule management is added later."}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href={auth ? "/setup" : "/login"}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              {auth ? "Open setup guide" : "Open login"}
            </Link>
            <Link
              href="/history"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              View history
            </Link>
            <Link
              href="/api/health"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
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
        <section className="border-b border-slate-200/70 px-6 pb-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              <Clock4 className="size-4" />
              Daily execution MVP
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-950">
            LiftLog
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Run the session, log every set, recover your draft if the tab closes, and finish with a clean workout record.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Link href="/setup" className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline">
              Open setup and live-mode checklist
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 underline-offset-4 hover:underline"
            >
              <History className="size-4" />
              View workout history
            </Link>
          </div>
        </section>

        <section className="flex-1 px-4 py-5">
          <article className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.18)]">
            <p className="text-sm font-medium text-sky-600">{formatWorkoutDate(workout.scheduledDate)}</p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                  {workout.workoutName}
                </h2>
                <p className="mt-1 text-sm text-slate-600">{workout.workoutLabel}</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                {workout.status}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Dumbbell className="size-3.5" />
                  Exercises
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{workout.totalExercises}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">State</div>
                <p className="mt-3 text-2xl font-semibold capitalize text-slate-950">{workout.status}</p>
              </div>
            </div>

            <Link
              href={
                workout.activeSessionId
                  ? `/sessions/${workout.activeSessionId}`
                  : `/workouts/${workout.scheduledWorkoutId}`
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(14,116,255,0.35)] transition hover:bg-sky-500"
            >
              {workout.activeSessionId ? "Resume Workout" : "Open Workout"}
              <ChevronRight className="size-4" />
            </Link>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
