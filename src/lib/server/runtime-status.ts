import { isLiveModeEnabled } from "@/lib/env";
import { getOptionalSupabaseAuth } from "@/lib/server/auth";
import { canBootstrapLiveData } from "@/lib/server/live-bootstrap";

export async function getRuntimeStatus() {
  const auth = await getOptionalSupabaseAuth();

  return {
    mode: auth ? "live" : isLiveModeEnabled() ? "configured-no-session" : "mock",
    isSupabaseConfigured: isLiveModeEnabled(),
    isAuthenticated: Boolean(auth),
    canBootstrapLiveData: canBootstrapLiveData(),
    viewerLabel: auth?.user.email ?? "Mock athlete",
  } as const;
}
