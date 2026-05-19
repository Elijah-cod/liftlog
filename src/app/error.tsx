"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 text-slate-950 sm:px-6">
      <div className="hero-accent vibrant-glow w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/80 p-6 sm:p-8">
        <div className="flex size-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#ffe4e6,#fecdd3_55%,#fde68a)] text-rose-700 shadow-sm">
          <AlertTriangle className="size-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-rose-700">
          Something went wrong
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-slate-950">
          The workout app hit an unexpected error.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
          Your local draft should still be available if you were mid-session. Try the page again, or head back to today and reopen the workout.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs font-medium text-slate-400">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#ef4444,#f97316 55%,#f59e0b)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(239,68,68,0.28)] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <Link
            href="/today"
            className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-[linear-gradient(135deg,#ffffff,#eff6ff)] px-6 py-3 text-sm font-semibold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            Back to today
          </Link>
        </div>
      </div>
    </main>
  );
}
