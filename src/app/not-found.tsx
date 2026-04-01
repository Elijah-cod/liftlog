import Link from "next/link";

import { AppShell } from "@/components/app-shell";

export default function NotFound() {
  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="mx-auto max-w-sm px-6 text-center">
        <p className="text-sm font-medium text-sky-600">Workout not found</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
          This session is not here anymore
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The link may be stale, or the seeded data may have been reset while the dev server restarted.
        </p>
        <Link
          href="/today"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          Back to today
        </Link>
      </div>
    </AppShell>
  );
}

