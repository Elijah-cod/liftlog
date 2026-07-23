import { BadgeCheck, Dumbbell, KeyRound, MailCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  resendEmailCode,
  verifyEmailCode,
} from "@/app/login/actions";
import { AppShell } from "@/components/app-shell";
import { maskEmail } from "@/lib/auth-code";
import { getPendingEmailAuth } from "@/lib/server/pending-auth";

interface VerifyEmailPageProps {
  searchParams: Promise<{
    error?: string;
    resent?: string;
  }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const [params, pending] = await Promise.all([
    searchParams,
    getPendingEmailAuth(),
  ]);

  if (!pending) {
    redirect(
      `/login?error=${encodeURIComponent("Start again so we can send a fresh verification code.")}`,
    );
  }

  const isSignup = pending.intent === "signup";

  return (
    <AppShell contentClassName="flex items-center justify-center">
      <div className="w-full max-w-xl px-5 py-8 sm:px-6 sm:py-12">
        <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <div className="bg-slate-950 px-6 py-6 text-white sm:px-8">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[14px] bg-blue-600">
                <Dumbbell className="size-5" />
              </span>
              <span>
                <span className="block text-lg font-semibold">LiftLog</span>
                <span className="block text-xs text-slate-400">Secure account access</span>
              </span>
            </Link>
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-9">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <MailCheck className="size-3.5" />
              Email verification
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
              {isSignup ? "Confirm your account" : "Enter your sign-in code"}
            </h1>
            <p id="code-help" className="mt-2 max-w-md text-sm leading-6 text-slate-600">
              We sent a 6-digit code to <strong className="font-semibold text-slate-800">{maskEmail(pending.email)}</strong>.
              Enter the newest code below. It expires shortly.
            </p>

            {params.resent ? (
              <div className="feedback-success mt-5 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-6">
                <BadgeCheck className="mt-1 size-4 shrink-0" />
                A fresh code is on the way. Older codes may no longer work.
              </div>
            ) : null}
            {params.error ? (
              <div className="feedback-error mt-5 rounded-2xl px-4 py-3 text-sm leading-6" role="alert">
                {params.error}
              </div>
            ) : null}

            <form action={verifyEmailCode} className="mt-6">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-600">Verification code</span>
                <span className="soft-field flex items-center gap-3 rounded-2xl px-4">
                  <KeyRound className="size-4 text-slate-400" />
                  <input
                    type="text"
                    name="code"
                    required
                    autoComplete="one-time-code"
                    autoFocus
                    enterKeyHint="done"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    aria-describedby="code-help"
                    className="h-14 min-w-0 flex-1 bg-transparent text-center text-2xl font-semibold tracking-[0.32em] text-slate-950 outline-none"
                  />
                </span>
              </label>
              <button type="submit" className="action-button interactive-lift mt-4 flex min-h-13 w-full items-center justify-center rounded-full px-5 text-sm font-semibold text-white">
                {isSignup ? "Confirm and continue" : "Verify and sign in"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
              <form action={resendEmailCode}>
                <button type="submit" className="text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/30">
                  Send a new code
                </button>
              </form>
              <Link href={`/login?mode=${isSignup ? "signup" : "signin"}`} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
                Use a different email
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
