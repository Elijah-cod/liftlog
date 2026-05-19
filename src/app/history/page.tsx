import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowUpRight, History, Search } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { RepeatWorkoutActions } from "@/components/repeat-workout-actions";
import {
  formatSessionDateTime,
  formatSessionDuration,
  formatWorkoutDate,
} from "@/lib/session-utils";
import { requirePageAuth } from "@/lib/server/auth";
import { getWorkoutRepository } from "@/lib/server/workouts";
import type { SessionStatus, WorkoutHistoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "partial", label: "Partial" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Drafts" },
] as const;

function getStatusLabel(status: SessionStatus) {
  switch (status) {
    case "completed":
      return "Completed";
    case "partial":
      return "Partial";
    case "active":
      return "In Progress";
    case "draft":
      return "Draft";
  }
}

function getStatusClasses(status: SessionStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "partial":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "active":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "draft":
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function getSessionHref(entry: WorkoutHistoryEntry) {
  return entry.status === "active" || entry.status === "draft"
    ? `/sessions/${entry.id}`
    : `/sessions/${entry.id}/complete`;
}

function buildFilterHref(status: (typeof STATUS_OPTIONS)[number]["value"], query: string) {
  const params = new URLSearchParams();

  if (status !== "all") {
    params.set("status", status);
  }

  if (query.trim()) {
    params.set("q", query.trim());
  }

  const search = params.toString();
  return search.length > 0 ? `/history?${search}` : "/history";
}

interface HistoryPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    scheduled?: string;
    slot?: string;
    workout?: string;
    actionError?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const auth = await requirePageAuth("/history");
  const repository = await getWorkoutRepository(auth);
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const status = STATUS_OPTIONS.some((option) => option.value === params.status)
    ? (params.status as (typeof STATUS_OPTIONS)[number]["value"])
    : "all";
  const scheduled = params.scheduled === "1";
  const scheduledSlot = params.slot === "tomorrow" ? "tomorrow" : "today";
  const scheduledWorkoutName = typeof params.workout === "string" ? params.workout : "Workout";
  const actionError = typeof params.actionError === "string" ? params.actionError : "";
  const sessions = await repository.listRecentSessions({
    status,
    query,
  });
  const authMode = auth ? "live" : "mock";
  const viewerLabel = auth?.user.email ?? "Mock athlete";
  const completedCount = sessions.filter((session) => session.status === "completed").length;
  const resumableCount = sessions.filter(
    (session) => session.status === "active" || session.status === "draft",
  ).length;
  const partialCount = sessions.filter((session) => session.status === "partial").length;
  const loggedSetCount = sessions.reduce((total, session) => total + session.completedSets, 0);

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-white/70 px-6 pb-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-[linear-gradient(135deg,#f0f9ff,#dbeafe)] px-3 py-1 text-sm font-semibold text-sky-700 shadow-sm">
              <History className="size-4" />
              Recent sessions
            </div>
            <AuthChip label={viewerLabel} mode={authMode} showSignOut={authMode === "live"} />
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
                Workout history
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                Review completed and partial sessions, or jump back into anything still in progress.
              </p>
            </div>
            <Link
              href="/today"
              className="rounded-full border border-sky-200 bg-[linear-gradient(135deg,#ffffff,#eff6ff)] px-4 py-3 text-sm font-semibold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              Back to today
            </Link>
          </div>
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">
            {scheduled ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {scheduledWorkoutName} was scheduled for {scheduledSlot}.
              </div>
            ) : null}

            {actionError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {actionError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[28px] border border-sky-100 bg-[linear-gradient(135deg,#eff6ff,#dbeafe)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                  Sessions shown
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{sessions.length}</p>
              </div>
              <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Completed
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{completedCount}</p>
              </div>
              <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(135deg,#fff7ed,#fde68a33)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Need review
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{partialCount}</p>
              </div>
              <div className="rounded-[28px] border border-fuchsia-100 bg-[linear-gradient(135deg,#fdf4ff,#fae8ff)] px-4 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                  Sets logged
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{loggedSetCount}</p>
              </div>
            </div>

            {resumableCount > 0 ? (
              <div className="rounded-3xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                {resumableCount} session{resumableCount === 1 ? "" : "s"} can still be resumed from this list.
              </div>
            ) : null}

            <form
              action="/history"
              className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(148,163,184,0.12)]"
            >
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search className="size-4 text-slate-500" />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search workout name or label"
                  className="w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
                />
                {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => {
                const active = status === option.value;

                return (
                  <Link
                    key={option.value}
                    href={buildFilterHref(option.value, query)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950",
                    )}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Showing {sessions.length} recent session{sessions.length === 1 ? "" : "s"}
              {query.trim() ? ` for "${query.trim()}"` : ""}.
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-sky-600">
                          {formatWorkoutDate(session.scheduledDate)}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                          {session.workoutName}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">{session.workoutLabel}</p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                          getStatusClasses(session.status),
                        )}
                      >
                        {getStatusLabel(session.status)}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Exercises
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {session.completedExercises}/{session.totalExercises}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Sets
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {session.completedSets}/{session.totalSets}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Duration
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-950">
                          {formatSessionDuration(
                            session.startedAt,
                            session.completedAt ?? session.updatedAt,
                          )}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {session.completedAt ? "Finished" : "Last active"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">
                          {formatSessionDateTime(session.completedAt ?? session.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-[24rem] text-sm leading-6 text-slate-500">
                        Updated {formatDistanceToNow(parseISO(session.updatedAt), { addSuffix: true })}
                      </p>
                      <Link
                        href={getSessionHref(session)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white sm:w-auto"
                      >
                        {session.status === "active" || session.status === "draft"
                          ? "Resume session"
                          : "Open summary"}
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>

                    {session.status === "completed" || session.status === "partial" ? (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Repeat this workout
                        </p>
                        <div className="mt-3">
                          <RepeatWorkoutActions
                            authMode={authMode}
                            templateId={session.templateId}
                            workoutName={session.workoutName}
                            redirectTo={buildFilterHref(status, query)}
                            compact
                          />
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <History className="size-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950">No matching sessions yet</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Start and finish a workout to build your session history, or clear the search and status filters.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <Link
                    href="/today"
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Go to today
                  </Link>
                  <Link
                    href="/history"
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Reset filters
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
