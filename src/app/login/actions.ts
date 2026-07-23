"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isEmailCode, sanitizeAuthNext } from "@/lib/auth-code";
import { isSupabaseConfigured } from "@/lib/env";
import { DEMO_COOKIE_NAME, ensureProfile } from "@/lib/server/auth";
import {
  clearPendingEmailAuth,
  getPendingEmailAuth,
  setPendingEmailAuth,
} from "@/lib/server/pending-auth";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email();
const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Za-z]/)
  .regex(/[0-9]/);

function loginError(message: string, next: string, mode: "signin" | "signup" = "signin"): never {
  redirect(
    `/login?mode=${mode}&error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`,
  );
}

async function leaveDemoMode() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);
}

function emailDeliveryError(code: string | undefined, fallback: string) {
  if (code === "email_address_not_authorized") {
    return "Email delivery is not connected for public accounts yet. Use the interactive demo for now.";
  }

  if (code === "over_email_send_rate_limit") {
    return "A code was sent recently. Wait a minute, then try again.";
  }

  if (code === "email_address_invalid") {
    return "Enter a valid email address.";
  }

  return fallback;
}

function verificationError(message: string, intent: "signup" | "signin"): never {
  redirect(`/login/verify?intent=${intent}&error=${encodeURIComponent(message)}`);
}

export async function signInWithPassword(formData: FormData) {
  const next = sanitizeAuthNext(String(formData.get("next") ?? "/today"));
  if (!isSupabaseConfigured) redirect(next);

  const email = emailSchema.safeParse(formData.get("email"));
  const password = z.string().min(1).safeParse(formData.get("password"));
  if (!email.success || !password.success) {
    loginError("Enter a valid email and password.", next);
  }

  const client = await createClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.data,
    password: password.data,
  });

  if (error || !data.user) {
    loginError("That email and password do not match. Try again or create an account.", next);
  }

  await ensureProfile({ client, user: data.user });
  await leaveDemoMode();
  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const next = sanitizeAuthNext(String(formData.get("next") ?? "/plan"), "/plan");
  if (!isSupabaseConfigured) redirect(next);

  const name = z.string().trim().min(2).max(80).safeParse(formData.get("name"));
  const email = emailSchema.safeParse(formData.get("email"));
  const password = passwordSchema.safeParse(formData.get("password"));
  if (!name.success) loginError("Enter the name you want LiftLog to use.", next, "signup");
  if (!email.success) loginError("Enter a valid email address.", next, "signup");
  if (!password.success) {
    loginError("Use at least 8 characters with both a letter and a number.", next, "signup");
  }

  const client = await createClient();
  const { data, error } = await client.auth.signUp({
    email: email.data,
    password: password.data,
    options: {
      data: { full_name: name.data },
    },
  });

  if (error) {
    const message = emailDeliveryError(
      error.code,
      error.message.toLowerCase().includes("already")
        ? "An account already uses that email. Sign in instead."
        : "We could not create your account right now. Please try again.",
    );
    loginError(message, next, "signup");
  }

  if (data.user?.identities?.length === 0) {
    loginError("An account already uses that email. Sign in instead.", next, "signup");
  }

  if (data.user && data.session) {
    await ensureProfile({ client, user: data.user });
    await leaveDemoMode();
    redirect(next);
  }

  await setPendingEmailAuth({
    email: email.data,
    intent: "signup",
    next,
  });
  redirect("/login/verify?intent=signup");
}

export async function sendLoginCode(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/today");
  }

  const email = emailSchema.safeParse(formData.get("email"));
  const next = sanitizeAuthNext(String(formData.get("next") ?? "/today"));

  if (!email.success) {
    redirect(
      `/login?error=${encodeURIComponent("Enter the email you want to use for LiftLog.")}&next=${encodeURIComponent(next)}`,
    );
  }

  const client = await createClient();

  const { error } = await client.auth.signInWithOtp({
    email: email.data,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    const message = emailDeliveryError(
      error.code,
      "We could not send your sign-in code right now. Please try again in a moment.",
    );

    redirect(`/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
  }

  await setPendingEmailAuth({
    email: email.data,
    intent: "signin",
    next,
  });
  redirect("/login/verify?intent=signin");
}

export async function verifyEmailCode(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/today");
  }

  const pending = await getPendingEmailAuth();
  if (!pending) {
    redirect(
      `/login?error=${encodeURIComponent("Start again so we can send a fresh verification code.")}`,
    );
  }

  const token = String(formData.get("code") ?? "").trim();
  if (!isEmailCode(token)) {
    verificationError("Enter the 6-digit code from your email.", pending.intent);
  }

  const client = await createClient();
  const { data, error } = await client.auth.verifyOtp({
    email: pending.email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    console.warn("[auth/verify-code] Unable to verify email code", {
      code: error?.code,
      status: error?.status,
    });
    verificationError(
      "That code is invalid or expired. Check the latest email or request a new code.",
      pending.intent,
    );
  }

  try {
    await ensureProfile({ client, user: data.user });
  } catch (profileError) {
    console.error("[auth/verify-code] Session created but profile setup failed", {
      error: profileError instanceof Error ? profileError.message : String(profileError),
      userId: data.user.id,
    });
    verificationError(
      "Your email was verified, but we could not finish your profile. Please sign in again.",
      pending.intent,
    );
  }

  await clearPendingEmailAuth();
  await leaveDemoMode();
  redirect(pending.next);
}

export async function resendEmailCode() {
  if (!isSupabaseConfigured) {
    redirect("/today");
  }

  const pending = await getPendingEmailAuth();
  if (!pending) {
    redirect(
      `/login?error=${encodeURIComponent("Enter your email again so we can send a fresh code.")}`,
    );
  }

  const client = await createClient();
  const { error } =
    pending.intent === "signup"
      ? await client.auth.resend({
          type: "signup",
          email: pending.email,
        })
      : await client.auth.signInWithOtp({
          email: pending.email,
          options: { shouldCreateUser: false },
        });

  if (error) {
    verificationError(
      emailDeliveryError(
        error.code,
        "We could not send another code right now. Please try again in a moment.",
      ),
      pending.intent,
    );
  }

  redirect(`/login/verify?intent=${pending.intent}&resent=1`);
}
