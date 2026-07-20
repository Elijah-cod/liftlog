import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getRequiredEnv } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getRequiredEnv("nextPublicSupabaseUrl"),
    getRequiredEnv("nextPublicSupabasePublishableKey"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(nextCookies) {
          try {
            for (const cookie of nextCookies) {
              cookieStore.set(cookie.name, cookie.value, cookie.options);
            }
          } catch {
            // Server Components can read cookies but cannot write them. The proxy
            // refreshes auth cookies on the response, so render-time writes are
            // intentionally ignored here instead of crashing the request.
          }
        },
      },
    },
  );
}
