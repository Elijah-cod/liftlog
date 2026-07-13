// Supabase publishable keys are intentionally safe for browser bundles. This
// production-only fallback keeps the hosted app connected while RLS remains
// the authorization boundary. Secret and service-role keys are never bundled.
const productionPublicConfig =
  process.env.NODE_ENV === "production"
    ? {
        supabaseUrl: "https://hqmlpopukblhaychcnro.supabase.co",
        supabasePublishableKey: "sb_publishable_ezT0ccao4jqG2RsVvfA7Dw_h4EYIcQO",
      }
    : null;

const env = {
  nextPublicSupabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? productionPublicConfig?.supabaseUrl,
  nextPublicSupabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    productionPublicConfig?.supabasePublishableKey,
  nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export const isSupabaseConfigured = Boolean(
  env.nextPublicSupabaseUrl && env.nextPublicSupabasePublishableKey,
);

export function getRequiredEnv(name: keyof typeof env) {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPublicEnv() {
  return {
    supabaseUrl: env.nextPublicSupabaseUrl ?? "",
    supabasePublishableKey: env.nextPublicSupabasePublishableKey ?? "",
    appUrl: env.nextPublicAppUrl ?? "",
  };
}

export function getAppUrl() {
  const value = env.nextPublicAppUrl;

  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function hasServiceRoleConfigured() {
  return Boolean(env.supabaseServiceRoleKey);
}

export function isLiveModeEnabled() {
  return isSupabaseConfigured;
}
