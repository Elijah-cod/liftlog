import { NextResponse } from "next/server";

import { DEMO_COOKIE_NAME } from "@/lib/server/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/today", request.url), 303);
  response.cookies.set(DEMO_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
