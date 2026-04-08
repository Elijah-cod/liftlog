import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eff7ff,transparent_38%),linear-gradient(180deg,#f8fbff_0%,#eef3f8_100%)] px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <div className="flex size-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
            <Compass className="size-7" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Not found</p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
            That page does not exist.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
            The workout may have been cleared, the session link may be outdated, or the URL is incorrect.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/today"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to today
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Open history
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
