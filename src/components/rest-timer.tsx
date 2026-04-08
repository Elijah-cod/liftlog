"use client";

import { useEffect, useMemo, useState } from "react";
import { Pause, Play, TimerReset } from "lucide-react";

import { secondsToClock } from "@/lib/utils";

interface RestTimerProps {
  seconds: number;
}

export function RestTimer({ seconds }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  const label = useMemo(() => secondsToClock(remaining), [remaining]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Rest</p>
        <p className="mt-1 text-lg font-semibold text-slate-950">{label}</p>
      </div>
      <div className="flex items-center gap-2 self-stretch sm:self-auto">
        <button
          type="button"
          onClick={() => setRunning((current) => !current)}
          className="flex h-10 flex-1 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm sm:size-10 sm:flex-none"
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            setRemaining(seconds);
            setRunning(false);
          }}
          className="flex h-10 flex-1 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm sm:size-10 sm:flex-none"
          aria-label="Reset timer"
        >
          <TimerReset className="size-4" />
        </button>
      </div>
    </div>
  );
}
