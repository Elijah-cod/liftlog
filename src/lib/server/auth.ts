import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface AuthenticatedSupabaseContext {
  client: SupabaseClient;
  user: User;
}

function buildProfileDefaults(user: User) {
  const metadata = user.user_metadata ?? {};
  const emailName = user.email?.split("@")[0] ?? "Athlete";

  return {
    id: user.id,
    full_name:
      metadata.full_name ??
      metadata.name ??
      metadata.user_name ??
      metadata.preferred_username ??
      emailName,
    avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    unit_preference: "kg" as const,
  };
}

export async function ensureProfile(context: AuthenticatedSupabaseContext) {
  const payload = buildProfileDefaults(context.user);
  const { error } = await context.client.from("profiles").upsert(payload, {
    onConflict: "id",
    ignoreDuplicates: false,
  });

  if (error) {
    throw new Error(`Unable to ensure profile: ${error.message}`);
  }
}

export async function getOptionalSupabaseAuth(): Promise<AuthenticatedSupabaseContext | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return null;
  }

  const context = { client, user };
  await ensureProfile(context);

  return context;
}

export async function requirePageAuth(nextPath: string) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const auth = await getOptionalSupabaseAuth();

  if (!auth) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return auth;
}

export async function requireRouteAuth() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return getOptionalSupabaseAuth();
}

