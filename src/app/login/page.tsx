import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, ShieldCheck, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { isSupabaseConfigured } from "@/lib/env";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import { sendMagicLink } from "@/app/login/actions";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    sent?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next && params.next.startsWith("/") ? params.next : "/today";

  if (isSupabaseConfigured) {
    const auth = await getOptionalSupabaseAuth();

    if (auth) {
      redirect(next);
    }
  }

  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="w-full max-w-5xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-sky-200/70 bg-[linear-gradient(160deg,rgba(239,246,255,0.96),rgba(255,255,255,0.98)_48%,rgba(238,242,255,0.92))] p-6 shadow-[0_24px_60px_rgba(56,189,248,0.15)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-sm font-semibold text-sky-700">
              <ShieldCheck className="size-4" />
              Athlete sign in
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Pick up today&apos;s training from any screen.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600 sm:text-base">
              Sign in with a magic link to open your workout space, recover saved progress, and keep every session synced.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Start today’s workout with your latest performance context.",
                "Recover unfinished sessions and keep notes across reloads.",
                "Review completed sessions, repeats, and schedule changes in one place.",
                "Switch between demo mode and your live athlete account when you need to.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-white/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700 shadow-[0_12px_30px_rgba(148,163,184,0.12)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-sky-100 p-1.5 text-sky-700">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <p>{item}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/setup"
                className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
              >
                Open setup checklist
                <ArrowRight className="size-4" />
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm font-semibold text-fuchsia-700">
                <Sparkles className="size-4" />
                Magic link sign-in only
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(148,163,184,0.18)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
              <ShieldCheck className="size-4" />
              Access your workspace
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-slate-950">
              {isSupabaseConfigured ? "Send a sign-in link" : "Use demo mode for now"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {isSupabaseConfigured
                ? "Enter your email and we’ll send a one-tap link to open your training account."
                : "Live sign-in is not connected yet, so the app is currently running with the built-in demo athlete."}
            </p>

            {!isSupabaseConfigured ? (
              <div className="mt-6 rounded-3xl border border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.98))] px-4 py-4 text-sm leading-6 text-amber-900">
                <p className="font-semibold text-amber-950">You&apos;re still in demo mode.</p>
                <p className="mt-2">
                  Add your Supabase keys in `.env.local`, then come back here to unlock sign-in and your live workout history.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/setup"
                    className="inline-flex rounded-full border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-900"
                  >
                    Finish setup
                  </Link>
                  <Link
                    href="/today"
                    className="inline-flex rounded-full bg-[linear-gradient(135deg,oklch(0.57_0.21_257),oklch(0.62_0.22_302))] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)]"
                  >
                    Explore demo workout
                  </Link>
                </div>
              </div>
            ) : (
              <form action={sendMagicLink} className="mt-6 space-y-4">
                <input type="hidden" name="next" value={next} />
                <label className="block">
                  <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Email
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4">
                    <Mail className="size-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="h-14 flex-1 bg-transparent text-base text-slate-950 outline-none"
                    />
                  </div>
                </label>

                {params.sent ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">
                    Your sign-in link is on the way. Open it on this device to jump straight back into LiftLog.
                  </div>
                ) : null}

                {params.error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
                    {params.error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,oklch(0.57_0.21_257),oklch(0.62_0.22_302))] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] transition hover:scale-[1.01]"
                >
                  Send magic link
                </button>
              </form>
            )}

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                What happens next
              </p>
              <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <li>1. We email you a secure sign-in link.</li>
                <li>2. You tap the link and return to your workout space.</li>
                <li>3. LiftLog restores your athlete profile and today&apos;s schedule.</li>
              </ol>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
