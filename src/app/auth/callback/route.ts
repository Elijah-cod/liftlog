import { NextResponse } from "next/server";

import { ensureProfile } from "@/lib/server/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/today";
  const safeNext = next.startsWith("/") ? next : "/today";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Missing auth code")}`, requestUrl.origin));
  }

  const client = await createClient();
  const { error } = await client.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(safeNext)}`, requestUrl.origin),
    );
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    await ensureProfile({ client, user });
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}

