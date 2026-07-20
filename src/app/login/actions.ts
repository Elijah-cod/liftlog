"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/env";
import { DEMO_COOKIE_NAME, ensureProfile } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

function sanitizeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/today";
  }

  return next;
}

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

async function getOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function leaveDemoMode() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE_NAME);
}

export async function signInWithPassword(formData: FormData) {
  const next = sanitizeNext(String(formData.get("next") ?? "/today"));
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
  const next = sanitizeNext(String(formData.get("next") ?? "/plan"));
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
      emailRedirectTo: `${await getOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase().includes("already")
      ? "An account already uses that email. Sign in instead."
      : "We could not create your account right now. Please try again.";
    loginError(message, next, "signup");
  }

  if (data.user && data.session) {
    await ensureProfile({ client, user: data.user });
    await leaveDemoMode();
    redirect(next);
  }

  redirect(`/login?created=1&next=${encodeURIComponent(next)}`);
}

export async function sendMagicLink(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/today");
  }

  const email = String(formData.get("email") ?? "").trim();
  const next = sanitizeNext(String(formData.get("next") ?? "/today"));

  if (!email) {
    redirect(
      `/login?error=${encodeURIComponent("Enter the email you want to use for LiftLog.")}&next=${encodeURIComponent(next)}`,
    );
  }

  const origin = await getOrigin();
  const client = await createClient();

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: false,
    },
  });

  if (error) {
    const message =
      error.message.includes("email_address_invalid")
        ? "That email address does not look valid yet. Double-check it and try again."
        : error.message.includes("over_email_send_rate_limit")
          ? "A magic link was sent recently. Give it a minute, then try again."
          : "We could not send your sign-in link right now. Please try again in a moment.";

    redirect(`/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(next)}`);
}

export async function resendConfirmationEmail(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/today");
  }

  const email = emailSchema.safeParse(formData.get("email"));
  const next = sanitizeNext(String(formData.get("next") ?? "/plan"));

  if (!email.success) {
    loginError("Enter the email address you used to create your account.", next);
  }

  const client = await createClient();
  const { error } = await client.auth.resend({
    type: "signup",
    email: email.data,
    options: {
      emailRedirectTo: `${await getOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    console.warn("[auth/resend-confirmation] Unable to resend verification email", {
      code: error.code,
      status: error.status,
    });
    const message = error.code === "over_email_send_rate_limit"
      ? "A verification email was sent recently. Wait a minute, then try again."
      : "We could not resend the verification email right now. Please try again in a moment.";
    loginError(message, next);
  }

  redirect(`/login?resent=1&next=${encodeURIComponent(next)}`);
}
