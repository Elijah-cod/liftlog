import Link from "next/link";
import {
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  Database,
  KeyRound,
  Rocket,
  Sparkles,
  TestTube2,
  TimerReset,
} from "lucide-react";

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
  tone = "sky",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  code?: string;
  tone?: "sky" | "violet" | "emerald" | "amber";
}) {
  const toneStyles = {
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
  }[tone];

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-2xl border p-3 ${toneStyles}`}>{icon}</div>
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

function SetupBanner({
  variant,
  children,
}: {
  variant: "success" | "warning" | "error";
  children: React.ReactNode;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-800",
  }[variant];

  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${styles}`}>{children}</div>;
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
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              <Rocket className="size-4" />
              Guided setup
            </div>
            <AuthChip
              label={runtime.viewerLabel}
              mode={runtime.isAuthenticated ? "live" : "mock"}
              showSignOut={runtime.isAuthenticated}
            />
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-slate-950">
            Launch your training space with confidence.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            This page takes you from first run to a fully working workout flow, with clear status checks, starter data, and a quick athlete smoke test.
          </p>
        </section>

        <section className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">
            <div
              className={`rounded-[28px] border px-5 py-5 ${
                runtime.isAuthenticated
                  ? "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))]"
                  : runtime.isSupabaseConfigured
                    ? "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.98))]"
                    : "border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.98))]"
              }`}
            >
              <div className="flex items-start gap-3">
                {runtime.isAuthenticated ? (
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-700" />
                ) : (
                  <CircleAlert className="mt-0.5 size-5 text-amber-700" />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-950">Current app status</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {runtime.isAuthenticated
                      ? "You are signed in and connected to your live Supabase-backed training account."
                      : runtime.isSupabaseConfigured
                        ? "Your Supabase connection is ready. Sign in once to switch from setup mode into your live athlete space."
                        : "LiftLog is running with the built-in demo athlete right now. Connect Supabase when you are ready for live data."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href={runtime.isAuthenticated ? "/today" : "/login?next=/today"}
                      className="action-button interactive-lift rounded-full px-4 py-3 text-sm font-semibold text-white"
                    >
                      {runtime.isAuthenticated ? "Open today’s workout" : "Sign in to continue"}
                    </Link>
                    {!runtime.isAuthenticated ? (
                      <Link
                        href="/today"
                        className="secondary-button interactive-lift rounded-full px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        Stay in demo mode
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <StepCard
              icon={<KeyRound className="size-5" />}
              title="0. Start with the right runtime"
              body="LiftLog runs on Next.js 16, so local development, typecheck, and production builds need Node 20.9 or newer. The repo includes an .nvmrc file, which makes switching fast before you install anything."
              code={`nvm use || nvm install`}
              tone="violet"
            />

            <StepCard
              icon={<KeyRound className="size-5" />}
              title="1. Configure environment variables"
              body="Copy the example env file, then add your Supabase project URL, publishable key, and the app URL you want to use for magic-link sign-in. Add the service role key too if you want one-click starter data from this page."
              code={`cp .env.example .env.local`}
              tone="sky"
            />

            {runtime.isAuthenticated ? (
              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Load starter training data</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Bring in exercise definitions, workout templates, a three-day schedule, and a little recent history so the live app feels ready immediately.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                    <Sparkles className="size-3.5" />
                    Live account
                  </div>
                </div>

                {seeded ? (
                  <div className="mt-4">
                    <SetupBanner variant="success">
                      Your starter athlete data is ready. Open today&apos;s page to confirm the workout lineup.
                    </SetupBanner>
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-4">
                    <SetupBanner variant="error">{error}</SetupBanner>
                  </div>
                ) : null}

                {runtime.canBootstrapLiveData ? (
                  <form action={seedLiveDemoData} className="mt-5">
                    <button
                      type="submit"
                      className="action-button interactive-lift rounded-full px-5 py-3 text-sm font-semibold text-white"
                    >
                      Load starter data into my live account
                    </button>
                  </form>
                ) : (
                  <div className="mt-4">
                    <SetupBanner variant="warning">
                      Add `SUPABASE_SERVICE_ROLE_KEY` if you want one-click starter data from inside the app.
                    </SetupBanner>
                  </div>
                )}
              </article>
            ) : null}

            {runtime.isAuthenticated && scheduleManager ? (
              <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">Plan the next three training days</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Choose the workout for yesterday, today, and tomorrow without leaving LiftLog.
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                    Updated {scheduleManager.generatedAt}
                  </div>
                </div>

                {scheduleSaved ? (
                  <div className="mt-4">
                    <SetupBanner variant="success">Your schedule change is saved.</SetupBanner>
                  </div>
                ) : null}

                {draftsCleared ? (
                  <div className="mt-4">
                    <SetupBanner variant="success">
                      Unfinished workout sessions were cleared. Your completed history stayed exactly as it was.
                    </SetupBanner>
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-4">
                    <SetupBanner variant="error">{error}</SetupBanner>
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
                          className="rounded-full bg-[linear-gradient(135deg,oklch(0.57_0.21_257),oklch(0.62_0.22_302))] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.18)]"
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    <TimerReset className="size-4" />
                    Reset unfinished workout sessions
                  </button>
                </form>
              </article>
            ) : null}

            <StepCard
              icon={<Database className="size-5" />}
              title="2. Apply schema and seed data"
              body="Run the migration SQL in Supabase. If you are signed in and have the service role key configured, you can also load starter data for your athlete directly from this page."
              code={`Migration: supabase/migrations/20260401130000_create_workout_logging.sql\nSeed: supabase/seed.sql`}
              tone="emerald"
            />

            <StepCard
              icon={<Rocket className="size-5" />}
              title="3. Install dependencies and sign in"
              body="Install dependencies with the supported runtime, start the dev server, open the sign-in page, and request a magic link. Your athlete profile is created automatically the first time you return."
              code={`npm install\nnpm run dev`}
              tone="violet"
            />

            <StepCard
              icon={<TestTube2 className="size-5" />}
              title="4. Confirm what you are testing"
              body="Use the health endpoint to confirm whether you are exploring the built-in demo athlete, a ready-to-sign-in setup, or your fully live account. Then run a quick workout smoke test through today, preview, active logging, reload recovery, and history."
              code={`GET /api/health`}
              tone="amber"
            />

            <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(148,163,184,0.12)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">5. Run the athlete smoke test</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Walk the same route a real athlete would use. If anything feels confusing or unreliable here, that is the next fix worth making.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  <CalendarRange className="size-3.5" />
                  Daily flow
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 1</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Check your current app status first so you know whether you are testing demo data or your live Supabase account.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href="/api/health"
                      className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      Open health check
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 2</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Open today&apos;s page, move into the workout preview, and confirm the recent-session context looks right before you start.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href="/today"
                      className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      Open today
                    </Link>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 3</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Start a workout, log a few sets, add a note, reload once, and make sure autosave plus restored-draft messaging behave the way you expect.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Step 4</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Finish the workout, confirm the summary details, then open history and make sure the session appears with the right status and repeat-scheduling actions.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link
                      href="/history"
                      className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      Open history
                    </Link>
                    <Link
                      href="/login?next=/setup"
                      className="rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Open login
                    </Link>
                  </div>
                </div>

                {!runtime.isAuthenticated ? (
                  <SetupBanner variant="warning">
                    Live-account testing needs a sign-in first. Once you are in, come back here and run the same checklist against your Supabase-backed data.
                  </SetupBanner>
                ) : null}
              </div>
            </article>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
