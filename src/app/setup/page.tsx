import Link from "next/link";
import { CheckCircle2, CircleAlert, Database, KeyRound, Rocket, TestTube2 } from "lucide-react";

import {
  clearLiveDrafts,
  saveScheduleAssignment,
  seedLiveDemoData,
} from "@/app/setup/actions";
import { AppShell } from "@/components/app-shell";
import { AuthChip } from "@/components/auth-chip";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import { getScheduleManagerData } from "@/lib/server/live-schedule";
import { getRuntimeStatus } from "@/lib/server/runtime-status";

function StepCard({
  icon,
  title,
  body,
  code,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  code?: string;
}) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-2xl bg-sky-50 p-3 text-sky-700">{icon}</div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
          {code ? (
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 px-4 py-4 text-sm text-slate-100">
              <code>{code}</code>
            </pre>
          ) : null}
        </div>
      </div>
    </article>
  );
}

interface SetupPageProps {
  searchParams: Promise<{
    seeded?: string;
    scheduleSaved?: string;
    draftsCleared?: string;
    error?: string;
  }>;
}

export default async function SetupPage({ searchParams }: SetupPageProps) {
  const runtime = await getRuntimeStatus();
  const auth = runtime.isAuthenticated ? await getOptionalSupabaseAuth() : null;
  const params = await searchParams;
  const seeded = params.seeded === "1";
  const scheduleSaved = params.scheduleSaved === "1";
  const draftsCleared = params.draftsCleared === "1";
  const error = params.error;
  const scheduleManager =
    auth && runtime.isSupabaseConfigured ? await getScheduleManagerData(auth) : null;

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        <section className="border-b border-slate-200/70 px-6 pb-6 pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              <Rocket className="size-4" />
              Setup guide
            </div>
            <AuthChip
              label={runtime.viewerLabel}
              mode={runtime.isAuthenticated ? "live" : "mock"}
              showSignOut={runtime.isAuthenticated}
            />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-950">
            Get LiftLog running end to end
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            This checklist gets you from cloned repo to a live Supabase-backed workout log flow, with quick ways to confirm whether the app is still in mock mode.
          </p>
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">
            <div
              className={`rounded-[28px] border px-5 py-4 ${
                runtime.isAuthenticated
                  ? "border-emerald-200 bg-emerald-50"
                  : runtime.isSupabaseConfigured
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {runtime.isAuthenticated ? (
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" />
                ) : (
                  <CircleAlert className="mt-0.5 size-5 text-amber-700" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-950">Current runtime status</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {runtime.isAuthenticated
                      ? "Live mode is active. Requests can use Supabase-authenticated data."
                      : runtime.isSupabaseConfigured
                        ? "Supabase is configured, but there is no active session yet. Sign in to switch from configured mode to live mode."
                        : "Mock mode is active. The app is runnable, but it is not connected to your live Supabase project yet."}
                  </p>
                </div>
              </div>
            </div>

            <StepCard
              icon={<KeyRound className="size-5" />}
              title="0. Use the supported Node runtime"
              body="This app uses Next.js 16, so local development, typecheck, and production builds need Node 20.9 or newer. The repo includes an .nvmrc file so the quickest setup path is to switch before installing anything."
              code={`nvm use || nvm install`}
            />

            <StepCard
              icon={<KeyRound className="size-5" />}
              title="1. Configure environment variables"
              body="Copy the example env file, then add your Supabase project URL, publishable key, and the app URL you will use for magic-link callbacks. Add the service role key too if you want one-click live bootstrap from this page."
              code={`cp .env.example .env.local`}
            />

            {runtime.isAuthenticated ? (
              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
                <h2 className="text-lg font-semibold text-slate-950">Bootstrap live athlete data</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This seeds exercise definitions, workout templates, a three-day schedule, and starter history directly into your live account.
                </p>

                {seeded ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Live demo data was seeded successfully. Open today&apos;s page to confirm your schedule.
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {error}
                  </div>
                ) : null}

                {runtime.canBootstrapLiveData ? (
                  <form action={seedLiveDemoData} className="mt-5">
                    <button
                      type="submit"
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Seed demo data into my live account
                    </button>
                  </form>
                ) : (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Add `SUPABASE_SERVICE_ROLE_KEY` to enable one-click live data bootstrap from inside the app.
                  </div>
                )}
              </article>
            ) : null}

            {runtime.isAuthenticated && scheduleManager ? (
              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Manage the next three days</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Assign templates for yesterday, today, and tomorrow without leaving the app.
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Refreshed {scheduleManager.generatedAt}
                  </div>
                </div>

                {scheduleSaved ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Schedule saved successfully.
                  </div>
                ) : null}

                {draftsCleared ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    In-progress sessions were cleared. Completed history was left intact.
                  </div>
                ) : null}

                <div className="mt-5 space-y-4">
                  {scheduleManager.slots.map((slot) => (
                    <form
                      key={slot.date}
                      action={saveScheduleAssignment}
                      className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <input type="hidden" name="date" value={slot.date} />
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {slot.label}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{slot.date}</p>
                          <p className="mt-2 text-base font-semibold text-slate-950">
                            {slot.templateName ?? "No template assigned"}
                          </p>
                          {slot.latestSessionStatus ? (
                            <p className="mt-1 text-sm text-slate-600">
                              Latest session: <span className="font-semibold capitalize">{slot.latestSessionStatus}</span>
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="submit"
                          className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                      <select
                        name="templateSlug"
                        defaultValue={slot.templateSlug ?? scheduleManager.templates[0]?.slug}
                        className="mt-4 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none"
                      >
                        {scheduleManager.templates.map((template) => (
                          <option key={template.slug} value={template.slug}>
                            {template.workoutName} · {template.workoutLabel}
                          </option>
                        ))}
                      </select>
                    </form>
                  ))}
                </div>

                <form action={clearLiveDrafts} className="mt-5">
                  <button
                    type="submit"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Clear in-progress sessions
                  </button>
                </form>
              </article>
            ) : null}

            <StepCard
              icon={<Database className="size-5" />}
              title="2. Apply schema and seed data"
              body="Run the migration SQL in Supabase. If you have a service role key configured and you are signed in, you can also seed the authenticated athlete directly from this page."
              code={`Migration: supabase/migrations/20260401130000_create_workout_logging.sql\nSeed: supabase/seed.sql`}
            />

            <StepCard
              icon={<Rocket className="size-5" />}
              title="3. Install dependencies and sign in"
              body="Install dependencies with the supported runtime, start the dev server, open the login page, and request a magic link. The callback route creates your profile row automatically the first time you return."
              code={`npm install\nnpm run dev`}
            />

            <StepCard
              icon={<TestTube2 className="size-5" />}
              title="4. Verify the runtime mode"
              body="Use the health endpoint to confirm whether the app is in mock mode, configured-without-session mode, or fully live mode with an authenticated user. Then run a short smoke test through today, preview, active logging, reload recovery, and history."
              code={`GET /api/health`}
            />

            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
              <h2 className="text-lg font-semibold text-slate-950">Quick links</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Open login
                </Link>
                <Link
                  href="/today"
                  className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Open today
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
