import "server-only";

import { cookies } from "next/headers";

import {
  type EmailCodeIntent,
  sanitizeAuthNext,
} from "@/lib/auth-code";

const PENDING_AUTH_COOKIE = "liftlog_pending_email_auth";
const PENDING_AUTH_MAX_AGE = 60 * 60;

export interface PendingEmailAuth {
  email: string;
  intent: EmailCodeIntent;
  next: string;
}

function encodePendingAuth(value: PendingEmailAuth) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodePendingAuth(value: string): PendingEmailAuth | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<PendingEmailAuth>;
    const intent = parsed.intent === "signup" || parsed.intent === "signin" ? parsed.intent : null;

    if (!intent || typeof parsed.email !== "string" || !parsed.email.includes("@")) {
      return null;
    }

    return {
      email: parsed.email,
      intent,
      next: sanitizeAuthNext(parsed.next, intent === "signup" ? "/plan" : "/today"),
    };
  } catch {
    return null;
  }
}

export async function setPendingEmailAuth(value: PendingEmailAuth) {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_AUTH_COOKIE, encodePendingAuth(value), {
    httpOnly: true,
    maxAge: PENDING_AUTH_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getPendingEmailAuth() {
  const cookieStore = await cookies();
  const value = cookieStore.get(PENDING_AUTH_COOKIE)?.value;
  return value ? decodePendingAuth(value) : null;
}

export async function clearPendingEmailAuth() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_AUTH_COOKIE);
}
