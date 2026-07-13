"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Clock3, Dumbbell, Home, RotateCcw, Sparkles } from "lucide-react";

import { TrainingShell } from "@/components/training-shell";
import { generateWorkoutPlan } from "@/lib/training/engine";
import { MUSCLE_GROUPS, type Equipment, type GeneratedPlan, type MuscleGroup, type TrainingProfile } from "@/lib/training/types";
import { cn } from "@/lib/utils";

const GYM_EQUIPMENT: Equipment[] = ["barbell", "dumbbell", "cable", "machine", "bodyweight", "cardio"];
const HOME_EQUIPMENT: Equipment[] = ["bodyweight", "dumbbell", "band", "kettlebell"];

const DEFAULT_PROFILE: TrainingProfile = {
  goal: "muscle",
  location: "gym",
  experience: "intermediate",
  daysPerWeek: 4,
  minutesPerSession: 60,
  age: 30,
  heightCm: 178,
  weightKg: 78,
  availableEquipment: GYM_EQUIPMENT,
  priorityMuscles: ["shoulders"],
  limitations: [],
};

function SelectField({ label, value, onChange, children }: { label: string; value: string | number; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <span className="relative mt-2 block">
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full appearance-none rounded-[14px] border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

function NumberField({ label, value, suffix, min, max, onChange }: { label: string; value: number; suffix: string; min: number; max: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <span className="relative mt-2 block">
        <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-11 w-full rounded-[14px] border border-slate-200 bg-white px-3 pr-12 text-sm font-medium text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">{suffix}</span>
      </span>
    </label>
  );
}

export function PlanBuilderClient() {
  const [profile, setProfile] = useState<TrainingProfile>(DEFAULT_PROFILE);
  const [plan, setPlan] = useState<GeneratedPlan>(() => generateWorkoutPlan(DEFAULT_PROFILE));
  const [saved, setSaved] = useState(false);
  const [openDay, setOpenDay] = useState("day-1");

  const prioritySummary = useMemo(() => profile.priorityMuscles.map((muscle) => muscle[0].toUpperCase() + muscle.slice(1)).join(" + "), [profile.priorityMuscles]);

  function updateProfile<K extends keyof TrainingProfile>(key: K, value: TrainingProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function togglePriority(muscle: MuscleGroup) {
    const selected = profile.priorityMuscles.includes(muscle);
    const next = selected
      ? profile.priorityMuscles.filter((item) => item !== muscle)
      : [...profile.priorityMuscles, muscle].slice(-2);
    updateProfile("priorityMuscles", next);
  }

  function toggleEquipment(equipment: Equipment) {
    const selected = profile.availableEquipment.includes(equipment);
    const next = selected
      ? profile.availableEquipment.filter((item) => item !== equipment)
      : [...profile.availableEquipment, equipment];
    updateProfile("availableEquipment", next.length ? next : ["bodyweight"]);
  }

  function setLocation(location: "gym" | "home") {
    setProfile((current) => ({
      ...current,
      location,
      availableEquipment: location === "gym" ? GYM_EQUIPMENT : HOME_EQUIPMENT,
    }));
    setSaved(false);
  }

  function buildPlan() {
    const nextPlan = generateWorkoutPlan(profile);
    setPlan(nextPlan);
    window.localStorage.setItem("liftlog-training-profile", JSON.stringify(profile));
    window.localStorage.setItem("liftlog-generated-plan", JSON.stringify(nextPlan));
    setSaved(true);
    setOpenDay("day-1");
  }

  return (
    <TrainingShell
      active="My plan"
      eyebrow="Adaptive program builder"
      title="Build around your actual life."
      description="Tell LiftLog what you can recover from and what you can train with. The plan stays specific without pretending a questionnaire can diagnose pain."
      actions={<button type="button" onClick={() => { setProfile(DEFAULT_PROFILE); setPlan(generateWorkoutPlan(DEFAULT_PROFILE)); setSaved(false); }} className="secondary-button inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-700"><RotateCcw className="size-4" /> Reset</button>}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(19rem,0.72fr)_minmax(0,1.28fr)]">
        <section className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_16px_36px_oklch(0.35_0.04_255/0.07)]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">1</span>
            <h2 className="text-base font-semibold text-slate-950">Your training inputs</h2>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setLocation("gym")} className={cn("flex min-h-14 items-center justify-center gap-2 rounded-[16px] border text-sm font-semibold", profile.location === "gym" ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600")}><Dumbbell className="size-4" /> Gym</button>
            <button type="button" onClick={() => setLocation("home")} className={cn("flex min-h-14 items-center justify-center gap-2 rounded-[16px] border text-sm font-semibold", profile.location === "home" ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600")}><Home className="size-4" /> Home</button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <SelectField label="Primary goal" value={profile.goal} onChange={(value) => updateProfile("goal", value as TrainingProfile["goal"])}>
              <option value="muscle">Build muscle</option><option value="strength">Get stronger</option><option value="general">General fitness</option>
            </SelectField>
            <SelectField label="Experience" value={profile.experience} onChange={(value) => updateProfile("experience", value as TrainingProfile["experience"])}>
              <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
            </SelectField>
            <SelectField label="Days each week" value={profile.daysPerWeek} onChange={(value) => updateProfile("daysPerWeek", Number(value) as TrainingProfile["daysPerWeek"])}>
              {[2, 3, 4, 5, 6].map((days) => <option key={days} value={days}>{days} days</option>)}
            </SelectField>
            <SelectField label="Session length" value={profile.minutesPerSession} onChange={(value) => updateProfile("minutesPerSession", Number(value) as TrainingProfile["minutesPerSession"])}>
              {[30, 45, 60, 75].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
            </SelectField>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <NumberField label="Age" value={profile.age} suffix="yrs" min={16} max={90} onChange={(value) => updateProfile("age", value)} />
            <NumberField label="Height" value={profile.heightCm} suffix="cm" min={120} max={230} onChange={(value) => updateProfile("heightCm", value)} />
            <NumberField label="Weight" value={profile.weightKg} suffix="kg" min={35} max={250} onChange={(value) => updateProfile("weightKg", value)} />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-600">Available equipment</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile.location === "home" ? HOME_EQUIPMENT : GYM_EQUIPMENT).map((equipment) => (
                <button key={equipment} type="button" onClick={() => toggleEquipment(equipment)} className={cn("rounded-full border px-3 py-2 text-xs font-semibold capitalize", profile.availableEquipment.includes(equipment) ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-600")}>{equipment}</button>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-600">Muscle Group Prioritizer</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Pick up to two. LiftLog adds volume before removing balance work.</p>
              </div>
              <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700">{profile.priorityMuscles.length}/2</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((muscle) => (
                <button key={muscle} type="button" onClick={() => togglePriority(muscle)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold capitalize", profile.priorityMuscles.includes(muscle) ? "border-violet-300 bg-violet-50 text-violet-800" : "border-slate-200 bg-white text-slate-600")}>
                  {profile.priorityMuscles.includes(muscle) ? <Check className="size-3" /> : null}{muscle}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={buildPlan} className="action-button interactive-lift mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white"><Sparkles className="size-4" /> Generate my plan</button>
          {saved ? <p className="mt-3 text-center text-xs font-semibold text-emerald-700">Saved. Today now uses this plan.</p> : null}
        </section>

        <section className="min-w-0">
          <div className="rounded-[26px] bg-slate-950 p-5 text-white sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">Your generated program</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{plan.name}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{plan.summary}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200"><Clock3 className="size-3.5" /> {profile.daysPerWeek} × {profile.minutesPerSession} min</div>
            </div>
            <div className="mt-5 rounded-[18px] bg-white/8 px-4 py-3">
              <p className="text-xs font-semibold text-violet-200">PRIORITY LOGIC</p>
              <p className="mt-1 text-sm leading-6 text-slate-300">{plan.priorityNote}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {plan.days.map((day, index) => {
              const open = openDay === day.id;
              return (
                <article key={day.id} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white/85">
                  <button type="button" onClick={() => setOpenDay(open ? "" : day.id)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{index + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-slate-950">{day.name}</span><span className="mt-0.5 block truncate text-xs capitalize text-slate-500">{day.focus} · {day.estimatedMinutes} min</span></span>
                    <ChevronDown className={cn("size-4 text-slate-400 transition-transform", open && "rotate-180")} />
                  </button>
                  {open ? (
                    <div className="border-t border-slate-200 px-4 pb-4">
                      <div className="divide-y divide-slate-100">
                        {day.exercises.map((exercise) => (
                          <div key={exercise.exerciseId} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                            <div><p className="text-sm font-semibold text-slate-900">{exercise.name}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{exercise.rationale}</p></div>
                            <div className="text-xs font-semibold text-slate-700">{exercise.sets} × {exercise.repRange[0]}–{exercise.repRange[1]} · {exercise.restSeconds}s</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-blue-200 bg-blue-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-semibold text-blue-950">{prioritySummary || "Balanced volume"}</p><p className="mt-1 text-xs leading-5 text-blue-800">The generator applies your equipment and time constraints before choosing exercise variations.</p></div>
            <Link href="/today" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-blue-700 px-4 text-xs font-semibold text-white">Use this plan <ArrowRight className="size-3.5" /></Link>
          </div>
        </section>
      </div>
    </TrainingShell>
  );
}
