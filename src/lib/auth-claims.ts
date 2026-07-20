import type { JwtPayload, User } from "@supabase/supabase-js";

export function buildUserFromClaims(claims: JwtPayload): User {
  return {
    id: claims.sub,
    app_metadata: claims.app_metadata ?? {},
    user_metadata: claims.user_metadata ?? {},
    aud: Array.isArray(claims.aud) ? (claims.aud[0] ?? "authenticated") : claims.aud,
    email: claims.email,
    phone: claims.phone,
    role: claims.role,
    is_anonymous: claims.is_anonymous,
    created_at: new Date(claims.iat * 1000).toISOString(),
  };
}
