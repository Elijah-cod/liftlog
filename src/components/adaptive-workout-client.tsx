"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Check, ChevronDown, Clock3, HeartPulse, Plus, RefreshCw, Save, Scissors, Sparkles, Trophy } from "lucide-react";

import { TrainingShell } from "@/components/training-shell";
import { getProgressionGuidance } from "@/lib/training/engine";
import { getExerciseSubstitutions } from "@/lib/training/exercise-library";
import { cn } from "@/lib/utils";

type SetType = "warm-up" | "working" | "dropset" | "deload" | "rehab" | "cardio";
type TrackerSet = { id: string; type: SetType; weight: number; reps: number; complete: boolean };
type TrackerExercise = { id: string; libraryId: string; name: string; target: string; isAccessory: boolean; sets: TrackerSet[] };

const INITIAL_EXERCISES: TrackerExercise[] = [
  { id: "ex-1", libraryId: "dumbbell-bench-press", name: "Dumbbell Bench Press", target: "8–12 reps", isAccessory: false, sets: [{ id: "1-w", type: "warm-up", weight: 20, reps: 10, complete: false }, { id: "1-a", type: "working", weight: 30, reps: 12, complete: false }, { id: "1-b", type: "working", weight: 30, reps: 10, complete: false }, { id: "1-c", type: "working", weight: 30, reps: 9, complete: false }] },
  { id: "ex-2", libraryId: "chest-supported-row", name: "Chest-Supported Row", target: "8–12 reps", isAccessory: false, sets: [{ id: "2-a", type: "working", weight: 32.5, reps: 10, complete: false }, { id: "2-b", type: "working", weight: 32.5, reps: 10, complete: false }, { id: "2-c", type: "working", weight: 32.5, reps: 9, complete: false }] },
  { id: "ex-3", libraryId: "dumbbell-lateral-raise", name: "Dumbbell Lateral Raise", target: "12–20 reps", isAccessory: true, sets: [{ id: "3-a", type: "working", weight: 8, reps: 15, complete: false }, { id: "3-b", type: "working", weight: 8, reps: 14, complete: false }, { id: "3-c", type: "dropset", weight: 6, reps: 12, complete: false }] },
  { id: "ex-4", libraryId: "cable-push-down", name: "Cable Triceps Pressdown", target: "10–15 reps", isAccessory: true, sets: [{ id: "4-a", type: "working", weight: 25, reps: 12, complete: false }, { id: "4-b", type: "working", weight: 25, reps: 11, complete: false }] },
];

const TYPE_STYLES: Record<SetType, string> = { "warm-up": "bg-sky-50 text-sky-700", working: "bg-slate-100 text-slate-700", dropset: "bg-violet-50 text-violet-700", deload: "bg-amber-50 text-amber-700", rehab: "bg-emerald-50 text-emerald-700", cardio: "bg-rose-50 text-rose-700" };

export function AdaptiveWorkoutClient() {
  const [exercises, setExercises] = useState(INITIAL_EXERCISES);
  const [editScope, setEditScope] = useState<"today" | "future">("today");
  const [shortened, setShortened] = useState<"full" | "45" | "30">("full");
  const [substituteFor, setSubstituteFor] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const completed = exercises.flatMap((exercise) => exercise.sets).filter((set) => set.complete).length;
  const total = exercises.flatMap((exercise) => exercise.sets).length;
  const guidance = useMemo(() => getProgressionGuidance({ exerciseName: exercises[0]?.name ?? "Main lift", weight: exercises[0]?.sets[1]?.weight ?? 30, completedReps: exercises[0]?.sets[1]?.reps ?? 12, targetRange: [8, 12], repsInReserve: 2, unit: "kg" }), [exercises]);

  function patchSet(exerciseId: string, setId: string, patch: Partial<TrackerSet>) {
    setExercises((current) => current.map((exercise) => exercise.id === exerciseId ? { ...exercise, sets: exercise.sets.map((set) => set.id === setId ? { ...set, ...patch } : set) } : exercise));
    setSaved(false);
  }

  function addSet(exerciseId: string) {
    setExercises((current) => current.map((exercise) => exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, { id: `${exercise.id}-${Date.now()}`, type: "working", weight: exercise.sets.at(-1)?.weight ?? 0, reps: exercise.sets.at(-1)?.reps ?? 10, complete: false }] } : exercise));
  }

  function applyLength(length: "full" | "45" | "30") {
    setShortened(length);
    if (length === "full") setExercises(INITIAL_EXERCISES);
    if (length === "45") setExercises(INITIAL_EXERCISES.slice(0, 3).map((exercise) => ({ ...exercise, sets: exercise.sets.slice(0, exercise.isAccessory ? 2 : exercise.sets.length) })));
    if (length === "30") setExercises(INITIAL_EXERCISES.slice(0, 2).map((exercise) => ({ ...exercise, sets: exercise.sets.filter((set) => set.type !== "warm-up").slice(0, 3) })));
  }

  function addSpecial(kind: "cardio" | "rehab") {
    const exercise: TrackerExercise = kind === "cardio"
      ? { id: `cardio-${Date.now()}`, libraryId: "incline-treadmill-walk", name: "Incline Treadmill Walk", target: "15 minutes", isAccessory: true, sets: [{ id: `cardio-set-${Date.now()}`, type: "cardio", weight: 0, reps: 15, complete: false }] }
      : { id: `rehab-${Date.now()}`, libraryId: "band-external-rotation", name: "Band External Rotation", target: "15–20 reps", isAccessory: true, sets: [{ id: `rehab-set-${Date.now()}`, type: "rehab", weight: 0, reps: 15, complete: false }, { id: `rehab-set-2-${Date.now()}`, type: "rehab", weight: 0, reps: 15, complete: false }] };
    setExercises((current) => [...current, exercise]);
  }

  function substitute(exerciseId: string, libraryId: string, name: string) {
    setExercises((current) => current.map((exercise) => exercise.id === exerciseId ? { ...exercise, libraryId, name } : exercise));
    setSubstituteFor(null);
  }

  return (
    <TrainingShell
      active="Train"
      eyebrow="Upper A · In progress"
      title="Log the set, keep the context."
      description={`${completed} of ${total} sets complete. Changes can apply to today only or become part of the plan.`}
      actions={<Link href="/today" className="secondary-button inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-700"><ArrowLeft className="size-4" /> Exit</Link>}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Scissors className="size-4" /></span><div><p className="text-sm font-semibold text-slate-950">Workout shortener</p><p className="text-xs text-slate-500">Preserves compounds, then trims accessory volume.</p></div></div>
              <div className="grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1">{(["30", "45", "full"] as const).map((length) => <button key={length} type="button" onClick={() => applyLength(length)} className={cn("rounded-full px-3 py-2 text-xs font-semibold", shortened === length ? "bg-white text-slate-950 shadow-sm" : "text-slate-500")}>{length === "full" ? "Full" : `${length}m`}</button>)}</div>
            </div>
          </section>

          {exercises.map((exercise, exerciseIndex) => {
            const substitutions = getExerciseSubstitutions(exercise.libraryId);
            return (
              <article key={exercise.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white/90">
                <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{exerciseIndex + 1}</span>
                  <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-slate-950">{exercise.name}</h2><p className="mt-1 text-xs text-slate-500">{exercise.sets.length} sets · {exercise.target}</p></div>
                  <button type="button" onClick={() => setSubstituteFor(substituteFor === exercise.id ? null : exercise.id)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-semibold text-violet-700"><RefreshCw className="size-3" /> Swap</button>
                </div>

                {substituteFor === exercise.id ? <div className="border-y border-violet-100 bg-violet-50/70 px-4 py-3"><p className="text-xs font-semibold text-violet-900">Choose a movement with the same job</p><div className="mt-2 flex flex-wrap gap-2">{substitutions.map((item) => <button key={item.id} type="button" onClick={() => substitute(exercise.id, item.id, item.name)} className="rounded-full border border-violet-200 bg-white px-3 py-2 text-xs font-semibold text-violet-800">{item.name}</button>)}</div></div> : null}

                <div className="border-t border-slate-200 px-3 py-3 sm:px-5">
                  <div className="hidden grid-cols-[6.5rem_1fr_1fr_3rem] gap-2 px-2 pb-2 text-[10px] font-semibold text-slate-400 sm:grid"><span>SET TYPE</span><span>WEIGHT (KG)</span><span>REPS / MIN</span><span>DONE</span></div>
                  <div className="space-y-2">
                    {exercise.sets.map((set) => <div key={set.id} className={cn("grid grid-cols-[1fr_1fr_2.75rem] gap-2 rounded-[16px] border p-2 sm:grid-cols-[6.5rem_1fr_1fr_3rem]", set.complete ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50/70")}>
                      <label className="relative col-span-3 sm:col-span-1"><span className="sr-only">Set type</span><select value={set.type} onChange={(event) => patchSet(exercise.id, set.id, { type: event.target.value as SetType })} className={cn("h-10 w-full appearance-none rounded-[11px] border-0 px-2 pr-7 text-xs font-semibold outline-none", TYPE_STYLES[set.type])}>{(["warm-up", "working", "dropset", "deload", "rehab", "cardio"] as SetType[]).map((type) => <option key={type} value={type}>{type}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-current" /></label>
                      <input aria-label={`${exercise.name} weight`} type="number" value={set.weight} onChange={(event) => patchSet(exercise.id, set.id, { weight: Number(event.target.value) })} className="h-10 min-w-0 rounded-[11px] border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none focus:border-blue-400" />
                      <input aria-label={`${exercise.name} repetitions`} type="number" value={set.reps} onChange={(event) => patchSet(exercise.id, set.id, { reps: Number(event.target.value) })} className="h-10 min-w-0 rounded-[11px] border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-900 outline-none focus:border-blue-400" />
                      <button type="button" onClick={() => patchSet(exercise.id, set.id, { complete: !set.complete })} className={cn("flex size-10 items-center justify-center rounded-[11px] border", set.complete ? "border-emerald-300 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-400")} aria-label={set.complete ? "Mark set incomplete" : "Mark set complete"}><Check className="size-4" /></button>
                    </div>)}
                  </div>
                  <button type="button" onClick={() => addSet(exercise.id)} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-700"><Plus className="size-3.5" /> Add set</button>
                </div>
              </article>
            );
          })}

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => addSpecial("cardio")} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 text-sm font-semibold text-rose-700"><Activity className="size-4" /> Add cardio</button>
            <button type="button" onClick={() => addSpecial("rehab")} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700"><HeartPulse className="size-4" /> Add rehab / prep</button>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[24px] bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300"><Sparkles className="size-4" /> NEXT TARGET</div><p className="mt-3 text-lg font-semibold">{guidance.headline}</p><p className="mt-2 text-xs leading-5 text-slate-300">{guidance.detail}</p>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-4"><p className="text-xs font-semibold text-slate-500">EDIT SCOPE</p><div className="mt-3 space-y-2">{(["today", "future"] as const).map((scope) => <button key={scope} type="button" onClick={() => setEditScope(scope)} className={cn("flex w-full items-center gap-3 rounded-[15px] border p-3 text-left", editScope === scope ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white")}><span className={cn("flex size-5 items-center justify-center rounded-full border", editScope === scope ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300")}>{editScope === scope ? <Check className="size-3" /> : null}</span><span><span className="block text-xs font-semibold text-slate-900">{scope === "today" ? "This workout only" : "All future workouts"}</span><span className="mt-0.5 block text-[11px] text-slate-500">{scope === "today" ? "Keep the plan unchanged" : "Update the base template"}</span></span></button>)}</div></section>
          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-4"><div className="flex items-center gap-2"><Clock3 className="size-4 text-amber-600" /><p className="text-xs font-semibold text-slate-700">Rest timer</p></div><p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">01:30</p><button type="button" className="mt-3 w-full rounded-full border border-slate-200 py-2 text-xs font-semibold text-slate-700">Start timer</button></section>
          <button type="button" onClick={() => { window.localStorage.setItem("liftlog-workout-edits", JSON.stringify({ editScope, exercises })); setSaved(true); }} className="action-button flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white"><Save className="size-4" /> {saved ? "Saved" : "Save workout"}</button>
          <Link href="/progress" className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 text-xs font-semibold text-blue-700"><Trophy className="size-3.5" /> View records</Link>
        </aside>
      </div>
    </TrainingShell>
  );
}
