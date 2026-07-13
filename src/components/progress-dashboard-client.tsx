"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, History, Sparkles, Trophy } from "lucide-react";

import { TrainingShell } from "@/components/training-shell";
import { getProgressionGuidance } from "@/lib/training/engine";

const HISTORY = [
  { date: "Jul 11", workout: "Lower A", duration: "52 min", sets: 18, status: "Completed" },
  { date: "Jul 9", workout: "Upper A", duration: "58 min", sets: 20, status: "Completed" },
  { date: "Jul 7", workout: "Lower B", duration: "34 min", sets: 13, status: "Shortened" },
  { date: "Jul 5", workout: "Upper B", duration: "61 min", sets: 21, status: "Completed" },
];

const VOLUME = [58, 62, 60, 68, 71, 69, 78, 82];

export function ProgressDashboardClient() {
  const [weight, setWeight] = useState(30);
  const [reps, setReps] = useState(12);
  const [rir, setRir] = useState<0 | 1 | 2 | 3 | 4>(2);
  const [allSets, setAllSets] = useState(true);
  const [deload, setDeload] = useState(false);

  const guidance = useMemo(() => getProgressionGuidance({ exerciseName: "Dumbbell Bench Press", weight, completedReps: reps, targetRange: [8, 12], repsInReserve: rir, unit: "kg", completedAllSets: allSets, deload }), [allSets, deload, reps, rir, weight]);

  return (
    <TrainingShell active="Progress" eyebrow="Training record" title="Progress you can act on." description="Review the work, spot personal records, and get a clear next-session target from the same log.">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
        <section className="rounded-[26px] border border-slate-200 bg-white/85 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold text-slate-500">8-WEEK TRAINING VOLUME</p><h2 className="mt-2 text-lg font-semibold text-slate-950">A steady upward trend</h2></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">+41%</span>
          </div>
          <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label="Training volume increased from 58 to 82 relative units over eight weeks">
            {VOLUME.map((value, index) => <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2"><div className="w-full rounded-t-[8px] bg-[oklch(0.68_0.15_250)]" style={{ height: `${value}%`, opacity: 0.45 + index * 0.07 }} /><span className="text-[10px] font-medium text-slate-400">W{index + 1}</span></div>)}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">CONSISTENCY</p><p className="mt-1 text-sm font-semibold text-slate-950">15 of 16 sessions</p></div>
            <div className="rounded-[18px] bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">WORK SETS</p><p className="mt-1 text-sm font-semibold text-slate-950">284 completed</p></div>
            <div className="rounded-[18px] bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">AVG. SESSION</p><p className="mt-1 text-sm font-semibold text-slate-950">51 minutes</p></div>
          </div>
        </section>

        <section className="rounded-[26px] bg-slate-950 p-5 text-white sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300"><Sparkles className="size-4" /> PROGRESSION LAB</div>
          <h2 className="mt-3 text-lg font-semibold">Dumbbell Bench Press</h2>
          <p className="mt-1 text-xs text-slate-400">Target: 3 sets of 8–12 reps</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <label><span className="text-[10px] font-semibold text-slate-400">WEIGHT</span><input type="number" value={weight} onChange={(event) => setWeight(Number(event.target.value))} className="mt-1 h-11 w-full rounded-[12px] border border-white/15 bg-white/10 px-2 text-center text-sm font-semibold text-white outline-none focus:border-sky-400" /></label>
            <label><span className="text-[10px] font-semibold text-slate-400">REPS</span><input type="number" value={reps} onChange={(event) => setReps(Number(event.target.value))} className="mt-1 h-11 w-full rounded-[12px] border border-white/15 bg-white/10 px-2 text-center text-sm font-semibold text-white outline-none focus:border-sky-400" /></label>
            <label><span className="text-[10px] font-semibold text-slate-400">RIR</span><span className="relative mt-1 block"><select value={rir} onChange={(event) => setRir(Number(event.target.value) as typeof rir)} className="h-11 w-full appearance-none rounded-[12px] border border-white/15 bg-slate-800 px-2 text-center text-sm font-semibold text-white outline-none focus:border-sky-400">{[0, 1, 2, 3, 4].map((value) => <option key={value} value={value}>{value}</option>)}</select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" /></span></label>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setAllSets((value) => !value)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${allSets ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" : "border-white/15 text-slate-400"}`}>All sets completed</button>
            <button type="button" onClick={() => setDeload((value) => !value)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${deload ? "border-amber-400/40 bg-amber-400/10 text-amber-300" : "border-white/15 text-slate-400"}`}>Deload week</button>
          </div>
          <div className="mt-5 rounded-[18px] bg-white/10 p-4"><p className="text-xs font-semibold text-sky-300">NEXT SESSION</p><p className="mt-2 text-lg font-semibold">{guidance.headline}</p><p className="mt-2 text-xs leading-5 text-slate-300">{guidance.detail}</p></div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white/85">
          <div className="flex items-center justify-between px-5 py-4"><div className="flex items-center gap-2"><History className="size-4 text-blue-600" /><h2 className="text-sm font-semibold text-slate-950">Exercise and workout history</h2></div><Link href="/history" className="text-xs font-semibold text-blue-700">Full archive</Link></div>
          <div className="divide-y divide-slate-200/80 border-t border-slate-200">
            {HISTORY.map((item) => <div key={`${item.date}-${item.workout}`} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5"><span className="text-xs font-medium text-slate-500">{item.date}</span><div><p className="text-sm font-semibold text-slate-900">{item.workout}</p><p className="mt-0.5 text-xs text-slate-500">{item.sets} sets · {item.duration}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.status === "Shortened" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.status}</span></div>)}
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-200 bg-white/85 p-5">
          <div className="flex items-center gap-2"><Trophy className="size-4 text-amber-600" /><h2 className="text-sm font-semibold text-slate-950">Recent personal records</h2></div>
          <div className="mt-4 space-y-3">
            {[{ name: "Back Squat", result: "110 kg × 5", note: "+5 kg" }, { name: "Pull-Up", result: "12 reps", note: "+2 reps" }, { name: "Bench Press", result: "3,240 kg volume", note: "+6%" }].map((record) => <div key={record.name} className="flex items-center gap-3 rounded-[16px] bg-slate-50 p-3"><span className="flex size-8 items-center justify-center rounded-full bg-amber-50 text-amber-700"><Trophy className="size-3.5" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-900">{record.name}</p><p className="text-[11px] text-slate-500">{record.result}</p></div><span className="text-xs font-semibold text-emerald-700">{record.note}</span></div>)}
          </div>
          <Link href="/train" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 text-xs font-semibold text-blue-700">Log another workout <ArrowRight className="size-3.5" /></Link>
        </section>
      </div>
    </TrainingShell>
  );
}
