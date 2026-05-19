import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-950 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <div className="hero-accent vibrant-glow w-full overflow-hidden rounded-[36px] border border-white/80 p-6 sm:p-8">
          <div className="flex size-16 items-center justify-center rounded-[24px] bg-[linear-gradient(135deg,#dbeafe,#e0f2fe_55%,#f5d0fe)] text-sky-700 shadow-sm">
            <Compass className="size-7" />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Not found</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight text-slate-950">
            That page does not exist.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            The workout may have been cleared, the session link may be outdated, or the URL is incorrect.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/today"
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#2563eb,#0ea5e9 55%,#8b5cf6)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(59,130,246,0.35)] transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Go to today
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-[linear-gradient(135deg,#ffffff,#eff6ff)] px-6 py-3 text-sm font-semibold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              Open history
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
