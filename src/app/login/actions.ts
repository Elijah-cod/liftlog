"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function sanitizeNext(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/today";
  }

  return next;
}

export async function sendMagicLink(formData: FormData) {
  if (!isSupabaseConfigured) {
    redirect("/today");
  }

  const email = String(formData.get("email") ?? "").trim();
  const next = sanitizeNext(String(formData.get("next") ?? "/today"));

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Email is required")}&next=${encodeURIComponent(next)}`);
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const client = await createClient();

  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`);
  }

  redirect(`/login?sent=1&next=${encodeURIComponent(next)}`);
}
