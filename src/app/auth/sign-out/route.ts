import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);

  if (isSupabaseConfigured) {
    const client = await createClient();
    await client.auth.signOut();
  }

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}

