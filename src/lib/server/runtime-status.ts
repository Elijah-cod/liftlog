import { isLiveModeEnabled } from "@/lib/env";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";

export async function getRuntimeStatus() {
  const auth = await getOptionalSupabaseAuth();

  return {
    mode: auth ? "live" : isLiveModeEnabled() ? "configured-no-session" : "mock",
    isSupabaseConfigured: isLiveModeEnabled(),
    isAuthenticated: Boolean(auth),
    viewerLabel: auth?.user.email ?? "Mock athlete",
  } as const;
}

