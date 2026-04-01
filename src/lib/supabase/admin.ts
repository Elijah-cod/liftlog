import { createClient } from "@supabase/supabase-js";

import { getRequiredEnv } from "@/lib/env";

export function createAdminClient() {
  return createClient(
    getRequiredEnv("nextPublicSupabaseUrl"),
    getRequiredEnv("supabaseServiceRoleKey"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

