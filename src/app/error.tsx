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
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#eff7ff,transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] px-4 py-6 text-slate-950 sm:px-6">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
        <div className="flex size-14 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <AlertTriangle className="size-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
          Something went wrong
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
          The workout app hit an unexpected error.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Your local draft should still be available if you were mid-session. Try the page again, or head back to today and reopen the workout.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs font-medium text-slate-400">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <Link
            href="/today"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to today
          </Link>
        </div>
      </div>
    </main>
  );
}
