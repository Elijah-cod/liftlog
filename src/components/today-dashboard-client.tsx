"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ChevronRight, CircleGauge, Clock3, Sparkles, Trophy } from "lucide-react";

import { TrainingShell } from "@/components/training-shell";
import type { GeneratedPlan } from "@/lib/training/types";
import type { TrainingViewer } from "@/lib/training/viewer";

export function TodayDashboardClient({ initialPlan, viewer }: { initialPlan: GeneratedPlan; viewer: TrainingViewer }) {
  const savedPlan = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => viewer.mode === "demo" ? window.localStorage.getItem("liftlog-generated-plan") : null,
    () => null,
  );
  const plan = useMemo(() => {
    if (!savedPlan) return initialPlan;
    try {
      return JSON.parse(savedPlan) as GeneratedPlan;
    } catch {
      return initialPlan;
    }
  }, [initialPlan, savedPlan]);

  const today = plan.days[0];
  const topExercise = today?.exercises[0];

  return (
    <TrainingShell
      viewer={viewer}
      active="Today"
      eyebrow="Monday, July 13"
      title={`Ready when you are, ${viewer.firstName}.`}
      description="Your plan, progression target, and practical workout options are lined up for today."
      actions={
        <Link href="/train" className="action-button interactive-lift inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white">
          Start workout <ArrowRight className="size-4" />
        </Link>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[oklch(0.985_0.01_255)] shadow-[0_16px_40px_oklch(0.35_0.04_255/0.08)]">
          <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <CalendarDays className="size-4" />
                  TODAY&apos;S SESSION
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{today?.name ?? "Your next workout"}</h2>
                <p className="mt-1 text-sm text-slate-600">{today?.focus} · {today?.estimatedMinutes} minutes</p>
              </div>
              <span className="inline-flex self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                Recovery looks good
              </span>
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6">
            <div className="divide-y divide-slate-200/80">
              {today?.exercises.slice(0, 5).map((exercise, index) => (
                <div key={exercise.exerciseId} className="flex items-center gap-3 py-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">{exercise.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{exercise.sets} sets · {exercise.repRange[0]}–{exercise.repRange[1]} reps</p>
                  </div>
                  {exercise.rationale.startsWith("Extra") ? (
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">PRIORITY</span>
                  ) : null}
                  <ChevronRight className="size-4 text-slate-400" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/train" className="action-button interactive-lift flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white">
                Start {today?.name} <ArrowRight className="size-4" />
              </Link>
              <Link href="/plan" className="secondary-button interactive-lift flex min-h-12 items-center justify-center rounded-full px-4 text-sm font-semibold text-blue-700">
                Edit today only
              </Link>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-[24px] bg-slate-950 p-5 text-white shadow-[0_16px_36px_oklch(0.22_0.04_255/0.18)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Sparkles className="size-4" />
              NEXT PROGRESSION
            </div>
            <p className="mt-3 text-lg font-semibold">{topExercise?.name ?? "Main lift"}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">32.5 kg × 8</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">You reached 30 kg × 12 with 2 reps in reserve. Add 2.5 kg and restart at the bottom of the range.</p>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CircleGauge className="size-4" />
              NEED A SHORTER SESSION?
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-950">Keep the stimulus, trim the extras.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["30 min", "45 min", "Full"].map((duration) => (
                <Link key={duration} href={`/train?length=${duration.split(" ")[0]}`} className="rounded-[14px] border border-slate-200 bg-slate-50 px-2 py-2.5 text-center text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50">
                  {duration}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Link href="/progress" className="interactive-lift rounded-[22px] border border-slate-200 bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <Trophy className="size-5 text-amber-600" />
            <ArrowRight className="size-4 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-950">3 personal records this month</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Bench volume, pull-up reps, and squat load are moving.</p>
        </Link>
        <Link href="/plan" className="interactive-lift rounded-[22px] border border-slate-200 bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <Check className="size-5 text-violet-600" />
            <ArrowRight className="size-4 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-950">Shoulders are prioritized</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Your plan adds focused volume without extending every workout.</p>
        </Link>
        <Link href="/exercises" className="interactive-lift rounded-[22px] border border-slate-200 bg-white/80 p-4">
          <div className="flex items-center justify-between">
            <Clock3 className="size-5 text-blue-600" />
            <ArrowRight className="size-4 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-950">{260}+ free form guides</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Find a cue, a tutorial, or an equipment-matched substitute.</p>
        </Link>
      </div>
    </TrainingShell>
  );
}
