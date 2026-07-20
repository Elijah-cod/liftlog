import { buildUserFromClaims } from "@/lib/auth-claims";

describe("buildUserFromClaims", () => {
  it("creates the trusted user shape needed by server repositories", () => {
    const user = buildUserFromClaims({
      iss: "https://example.supabase.co/auth/v1",
      sub: "user-123",
      aud: "authenticated",
      exp: 1_800_000_000,
      iat: 1_700_000_000,
      role: "authenticated",
      aal: "aal1",
      session_id: "session-123",
      email: "alex@example.com",
      user_metadata: { full_name: "Alex Rivera" },
      app_metadata: { provider: "email" },
    });

    expect(user.id).toBe("user-123");
    expect(user.email).toBe("alex@example.com");
    expect(user.user_metadata.full_name).toBe("Alex Rivera");
    expect(user.created_at).toBe(new Date(1_700_000_000 * 1000).toISOString());
  });

  it("normalizes an audience array", () => {
    const user = buildUserFromClaims({
      iss: "https://example.supabase.co/auth/v1",
      sub: "user-456",
      aud: ["authenticated", "mobile"],
      exp: 1_800_000_000,
      iat: 1_700_000_000,
      role: "authenticated",
      aal: "aal1",
      session_id: "session-456",
    });

    expect(user.aud).toBe("authenticated");
    expect(user.app_metadata).toEqual({});
    expect(user.user_metadata).toEqual({});
  });
});
