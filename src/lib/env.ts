const env = {
  nextPublicSupabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  nextPublicSupabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
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
  };
}

