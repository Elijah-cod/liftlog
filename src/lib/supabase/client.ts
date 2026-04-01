import { createBrowserClient } from "@supabase/ssr";

import { getRequiredEnv } from "@/lib/env";

export function createClient() {
  return createBrowserClient(
    getRequiredEnv("nextPublicSupabaseUrl"),
    getRequiredEnv("nextPublicSupabasePublishableKey"),
  );
}

