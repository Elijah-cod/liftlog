import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { DEMO_COOKIE_NAME } from "@/lib/server/auth";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);

  if (isSupabaseConfigured) {
    const client = await createClient();
    await client.auth.signOut();
  }

  const response = NextResponse.redirect(new URL("/login", requestUrl.origin), 303);
  response.cookies.delete(DEMO_COOKIE_NAME);
  return response;
}
