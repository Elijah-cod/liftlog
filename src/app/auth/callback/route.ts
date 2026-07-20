import { NextResponse } from "next/server";

import { ensureProfile } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";
import { parseEmailOtpType, sanitizeAuthRedirect } from "@/lib/auth-callback";

const INVALID_LINK_MESSAGE =
  "This verification link is invalid or expired. Request a new verification email and try again.";

function redirectToLogin(requestUrl: URL, next: string, message: string) {
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", message);
  loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const rawType = requestUrl.searchParams.get("type");
  const type = parseEmailOtpType(rawType);
  const safeNext = sanitizeAuthRedirect(
    requestUrl.searchParams.get("next") ?? requestUrl.searchParams.get("redirect_to"),
  );
  const providerError =
    requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");

  if (providerError) {
    console.warn("[auth/callback] Supabase rejected an email link", {
      code: requestUrl.searchParams.get("error_code") ?? requestUrl.searchParams.get("error"),
    });
    return redirectToLogin(requestUrl, safeNext, INVALID_LINK_MESSAGE);
  }

  const client = await createClient();
  const result =
    tokenHash && type
      ? await client.auth.verifyOtp({ token_hash: tokenHash, type })
      : code
        ? await client.auth.exchangeCodeForSession(code)
        : null;

  if (!result) {
    console.warn("[auth/callback] Incomplete email verification link", {
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      type: rawType,
    });
    return redirectToLogin(requestUrl, safeNext, INVALID_LINK_MESSAGE);
  }

  if (result.error) {
    console.warn("[auth/callback] Unable to establish an authenticated session", {
      code: result.error.code,
      status: result.error.status,
      method: tokenHash ? "token_hash" : "pkce_code",
    });
    return redirectToLogin(requestUrl, safeNext, INVALID_LINK_MESSAGE);
  }

  const user = result.data.user ?? (await client.auth.getUser()).data.user;

  if (user) {
    try {
      await ensureProfile({ client, user });
    } catch (error) {
      console.error("[auth/callback] Session created but profile setup failed", {
        error: error instanceof Error ? error.message : String(error),
        userId: user.id,
      });
      return redirectToLogin(
        requestUrl,
        safeNext,
        "Your email was verified, but we could not finish setting up your profile. Please sign in again.",
      );
    }
  } else {
    console.warn("[auth/callback] Verification succeeded without a user session");
    return redirectToLogin(requestUrl, safeNext, INVALID_LINK_MESSAGE);
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
