import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";

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
      <div className="w-full px-6 py-10">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(148,163,184,0.18)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
            <ShieldCheck className="size-4" />
            Sign in to LiftLog
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-slate-950">
            Daily workout logging on the web
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use a magic link to open your athlete workspace, run today&apos;s session, and sync your logs to Supabase.
          </p>
          <div className="mt-4">
            <Link href="/setup" className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline">
              View full setup checklist
            </Link>
          </div>

          {!isSupabaseConfigured ? (
            <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
              Supabase is not configured yet, so auth is currently disabled and the app runs in mock mode.
              <div className="mt-4">
                <Link
                  href="/today"
                  className="inline-flex rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Continue in mock mode
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
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Check your email for the magic link.
                </div>
              ) : null}

              {params.error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {params.error}
                </div>
              ) : null}

              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-full bg-sky-600 px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(14,116,255,0.35)] transition hover:bg-sky-500"
              >
                Send magic link
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
