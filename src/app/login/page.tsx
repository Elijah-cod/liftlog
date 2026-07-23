import Link from "next/link";
import { CheckCircle2, Dumbbell, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import {
  sendLoginCode,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/login/actions";
import { AppShell } from "@/components/app-shell";
import { isSupabaseConfigured } from "@/lib/env";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
    mode?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/today";
  const mode = params.mode === "signup" ? "signup" : "signin";

  if (isSupabaseConfigured && (await getOptionalSupabaseAuth())) {
    redirect(next);
  }

  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="grid overflow-hidden rounded-[32px] border border-white/80 bg-white/70 shadow-[0_24px_70px_rgba(15,23,42,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-slate-950 px-6 py-7 text-white sm:px-8 sm:py-9">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[14px] bg-blue-600 text-white">
                <Dumbbell className="size-5" />
              </span>
              <span>
                <span className="block text-lg font-semibold">LiftLog</span>
                <span className="block text-xs text-slate-400">Your private training journal</span>
              </span>
            </Link>

            <h1 className="mt-9 max-w-sm text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              A plan shaped around your life, kept private to your account.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Set your goals, schedule, equipment, and muscle priorities. LiftLog saves the routine and training record only to your signed-in profile.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Your routine and workout history are isolated with database-level access rules.",
                "Change gym access, session length, or priorities whenever your schedule shifts.",
                "Try the full experience first with browser-local demo data.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-400" />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <form action="/auth/demo" method="post" className="mt-8">
              <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/30">
                <Sparkles className="size-4 text-sky-300" />
                Open interactive demo
              </button>
              <p className="mt-2 text-center text-xs leading-5 text-slate-400">
                Demo changes stay in this browser and never touch member records.
              </p>
            </form>
          </section>

          <section className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="size-3.5" />
              Private by default
            </div>

            {isSupabaseConfigured ? (
              <>
                <div className="mt-5 grid grid-cols-2 gap-1 rounded-full bg-slate-100 p-1" aria-label="Account access mode">
                  <Link href={`/login?mode=signin&next=${encodeURIComponent(next)}`} aria-current={mode === "signin" ? "page" : undefined} className={`rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors ${mode === "signin" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    Sign in
                  </Link>
                  <Link href={`/login?mode=signup&next=${encodeURIComponent(next)}`} aria-current={mode === "signup" ? "page" : undefined} className={`rounded-full px-4 py-2.5 text-center text-sm font-semibold transition-colors ${mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                    Create account
                  </Link>
                </div>

                <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">
                  {mode === "signup" ? "Create your training space" : "Welcome back"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {mode === "signup"
                    ? "Start with a private profile, then build your first routine."
                    : "Sign in to continue with your saved plan and workout history."}
                </p>

                {params.error ? (
                  <div className="feedback-error mt-5 rounded-2xl px-4 py-3 text-sm leading-6">
                    {params.error}
                  </div>
                ) : null}

                <form action={mode === "signup" ? signUpWithPassword : signInWithPassword} className="mt-6 space-y-4">
                  <input type="hidden" name="next" value={mode === "signup" && next === "/today" ? "/plan" : next} />
                  {mode === "signup" ? (
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-slate-600">Name</span>
                      <span className="soft-field flex items-center gap-3 rounded-2xl px-4">
                        <UserRound className="size-4 text-slate-400" />
                        <input type="text" name="name" required autoComplete="name" placeholder="How should we address you?" className="h-13 flex-1 bg-transparent text-sm text-slate-950 outline-none" />
                      </span>
                    </label>
                  ) : null}
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-slate-600">Email</span>
                    <span className="soft-field flex items-center gap-3 rounded-2xl px-4">
                      <Mail className="size-4 text-slate-400" />
                      <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className="h-13 flex-1 bg-transparent text-sm text-slate-950 outline-none" />
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-slate-600">Password</span>
                    <span className="soft-field flex items-center gap-3 rounded-2xl px-4">
                      <LockKeyhole className="size-4 text-slate-400" />
                      <input type="password" name="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? "8+ characters, with a letter and number" : "Your password"} className="h-13 flex-1 bg-transparent text-sm text-slate-950 outline-none" />
                    </span>
                  </label>
                  <button type="submit" className="action-button interactive-lift flex min-h-13 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white">
                    {mode === "signup" ? "Create private account" : "Sign in"}
                  </button>
                </form>

                {mode === "signin" ? (
                  <div className="mt-5 space-y-3">
                    <details className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700">Email me a sign-in code instead</summary>
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        No link to open. Enter the 6-digit code on the next screen.
                      </p>
                      <form action={sendLoginCode} className="mt-3 flex gap-2">
                        <input type="hidden" name="next" value={next} />
                        <input type="email" name="email" required autoComplete="email" placeholder="you@example.com" className="h-11 min-w-0 flex-1 rounded-[14px] border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400" />
                        <button type="submit" className="rounded-full bg-slate-950 px-4 text-xs font-semibold text-white">Send code</button>
                      </form>
                    </details>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                <h2 className="text-lg font-semibold text-amber-950">Account service is not connected</h2>
                <p className="mt-2 text-sm leading-6 text-amber-900">
                  Connect Supabase from the setup checklist to enable private accounts. The interactive demo is ready now.
                </p>
                <Link href="/setup" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-amber-900 shadow-sm">
                  Open setup checklist
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
