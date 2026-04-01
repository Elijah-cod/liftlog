"use client";

import Link from "next/link";
import { useEffect } from "react";

import { AppShell } from "@/components/app-shell";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="mx-auto max-w-sm px-6 text-center">
        <p className="text-sm font-medium text-rose-600">Something went wrong</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
          The workout could not load cleanly
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Reset the view to retry, or return to today and reopen the workout.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Retry
          </button>
          <Link
            href="/today"
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Today
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

