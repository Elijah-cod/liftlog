"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpenText, CheckCircle2, ChevronDown, Dumbbell, Filter, PlayCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";

import { TrainingShell } from "@/components/training-shell";
import { EXERCISE_LIBRARY, getExerciseSubstitutions } from "@/lib/training/exercise-library";
import { MUSCLE_GROUPS, type Equipment, type MuscleGroup } from "@/lib/training/types";
import { cn } from "@/lib/utils";

const EQUIPMENT: (Equipment | "all")[] = ["all", "bodyweight", "dumbbell", "barbell", "cable", "machine", "band", "kettlebell", "cardio"];

export function ExerciseLibraryClient() {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "all">("all");
  const [equipment, setEquipment] = useState<Equipment | "all">("all");
  const [homeOnly, setHomeOnly] = useState(false);
  const [rehabOnly, setRehabOnly] = useState(false);
  const [visible, setVisible] = useState(18);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return EXERCISE_LIBRARY.filter((exercise) => {
      if (normalizedQuery && !`${exercise.name} ${exercise.primaryMuscle} ${exercise.equipment}`.toLowerCase().includes(normalizedQuery)) return false;
      if (muscle !== "all" && exercise.primaryMuscle !== muscle && !exercise.secondaryMuscles.includes(muscle)) return false;
      if (equipment !== "all" && exercise.equipment !== equipment) return false;
      if (homeOnly && !exercise.homeFriendly) return false;
      if (rehabOnly && !exercise.isRehab) return false;
      return true;
    });
  }, [equipment, homeOnly, muscle, query, rehabOnly]);

  const selected = selectedId ? EXERCISE_LIBRARY.find((exercise) => exercise.id === selectedId) : null;
  const substitutions = selected ? getExerciseSubstitutions(selected.id, homeOnly ? ["bodyweight", "dumbbell", "band", "kettlebell"] : undefined) : [];

  return (
    <TrainingShell
      active="Exercises"
      eyebrow="Free exercise education"
      title={`${EXERCISE_LIBRARY.length} form guides, without a paywall.`}
      description="Search by muscle or equipment, open a free tutorial, and swap movements without changing the purpose of your workout."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0">
          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-4">
            <div className="flex min-h-12 items-center gap-3 rounded-[16px] border border-slate-200 bg-slate-50 px-4">
              <Search className="size-4 text-slate-400" />
              <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(18); }} placeholder="Search bench press, glutes, band..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">{filtered.length}</span>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="relative">
                <span className="sr-only">Muscle group</span>
                <select value={muscle} onChange={(event) => { setMuscle(event.target.value as MuscleGroup | "all"); setVisible(18); }} className="h-11 w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-medium capitalize text-slate-700 outline-none focus:border-blue-400">
                  <option value="all">All muscle groups</option>{MUSCLE_GROUPS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </label>
              <label className="relative">
                <span className="sr-only">Equipment</span>
                <select value={equipment} onChange={(event) => { setEquipment(event.target.value as Equipment | "all"); setVisible(18); }} className="h-11 w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-3 text-sm font-medium capitalize text-slate-700 outline-none focus:border-blue-400">
                  {EQUIPMENT.map((item) => <option key={item} value={item}>{item === "all" ? "All equipment" : item}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Filter className="size-3.5" /> Quick filters</span>
              <button type="button" onClick={() => setHomeOnly((value) => !value)} className={cn("rounded-full border px-3 py-2 text-xs font-semibold", homeOnly ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600")}>Home friendly</button>
              <button type="button" onClick={() => setRehabOnly((value) => !value)} className={cn("rounded-full border px-3 py-2 text-xs font-semibold", rehabOnly ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600")}>Rehab / prep</button>
              {(query || muscle !== "all" || equipment !== "all" || homeOnly || rehabOnly) ? <button type="button" onClick={() => { setQuery(""); setMuscle("all"); setEquipment("all"); setHomeOnly(false); setRehabOnly(false); }} className="rounded-full px-3 py-2 text-xs font-semibold text-blue-700">Clear all</button> : null}
            </div>
          </section>

          <div className="mt-4 overflow-hidden rounded-[24px] border border-slate-200 bg-white/85">
            {filtered.length ? (
              <div className="divide-y divide-slate-200/80">
                {filtered.slice(0, visible).map((exercise) => (
                  <article key={exercise.id} className={cn("px-4 py-4 transition-colors sm:px-5", selectedId === exercise.id && "bg-blue-50/60")}>
                    <div className="flex gap-3 sm:items-start">
                      <button type="button" onClick={() => setSelectedId(selectedId === exercise.id ? null : exercise.id)} className="flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-slate-100 text-slate-600" aria-label={`Show substitutions for ${exercise.name}`}>
                        {exercise.pattern === "cardio" ? <RefreshCw className="size-4" /> : <Dumbbell className="size-4" />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h2 className="text-sm font-semibold text-slate-950">{exercise.name}</h2>
                            <p className="mt-1 text-xs capitalize text-slate-500">{exercise.primaryMuscle} · {exercise.equipment} · {exercise.pattern.replaceAll("-", " ")}</p>
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            {exercise.isRehab ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">REHAB / PREP</span> : null}
                            <a href={exercise.tutorialUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Watch free guide <ArrowUpRight className="size-3" /></a>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                          {exercise.formCues.slice(0, 2).map((cue) => <span key={cue} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3 text-emerald-600" />{cue}</span>)}
                        </div>
                        <button type="button" onClick={() => setSelectedId(selectedId === exercise.id ? null : exercise.id)} className="mt-3 text-xs font-semibold text-violet-700">{selectedId === exercise.id ? "Hide substitutions" : "Find a substitute"}</button>
                      </div>
                    </div>

                    {selectedId === exercise.id ? (
                      <div className="mt-4 rounded-[18px] border border-violet-200 bg-violet-50/70 p-3">
                        <p className="text-xs font-semibold text-violet-900">Same muscle, similar movement</p>
                        {substitutions.length ? <div className="mt-2 grid gap-2 sm:grid-cols-2">{substitutions.map((item) => <div key={item.id} className="rounded-[14px] bg-white px-3 py-2"><p className="text-xs font-semibold text-slate-900">{item.name}</p><p className="mt-0.5 text-[11px] capitalize text-slate-500">{item.equipment} · {item.repRange[0]}–{item.repRange[1]} reps</p></div>)}</div> : <p className="mt-2 text-xs text-violet-800">No close match under the current equipment filter. Clear “Home friendly” to see gym options.</p>}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-14 text-center"><Search className="mx-auto size-6 text-slate-400" /><p className="mt-3 text-sm font-semibold text-slate-900">No exact match</p><p className="mt-1 text-xs text-slate-500">Try a muscle group or clear one of the equipment filters.</p></div>
            )}
          </div>

          {visible < filtered.length ? <button type="button" onClick={() => setVisible((count) => count + 18)} className="secondary-button interactive-lift mt-4 flex min-h-11 w-full items-center justify-center rounded-full text-sm font-semibold text-blue-700">Show 18 more</button> : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-[24px] bg-slate-950 p-5 text-white">
            <PlayCircle className="size-5 text-sky-300" />
            <h2 className="mt-4 text-base font-semibold">Free on the open web</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Primary guides open on MuscleWiki. Technique variants open a focused YouTube search so you can choose a trusted educator and language.</p>
            <a href="https://musclewiki.com" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-sky-300">Visit MuscleWiki <ArrowUpRight className="size-3.5" /></a>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
            <ShieldCheck className="size-5 text-emerald-600" />
            <h2 className="mt-4 text-sm font-semibold text-slate-950">How guidance is written</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Cues focus on stable setup, controlled range, consistent execution, and progressive exposure. They are education, not injury diagnosis.</p>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white/85 p-5">
            <BookOpenText className="size-5 text-violet-600" />
            <h2 className="mt-4 text-sm font-semibold text-slate-950">Pain or rehab?</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Use rehab entries only inside guidance from a qualified clinician. Stop if symptoms worsen or feel unfamiliar.</p>
          </section>
        </aside>
      </div>
    </TrainingShell>
  );
}
