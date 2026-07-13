import { NextResponse } from "next/server";

import { DEMO_COOKIE_NAME } from "@/lib/server/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(DEMO_COOKIE_NAME);
  return response;
}
