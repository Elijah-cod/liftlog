import type { EmailOtpType } from "@supabase/supabase-js";

const emailOtpTypes = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

export function sanitizeAuthRedirect(value: string | null, fallback = "/today") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export function parseEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value || !emailOtpTypes.has(value as EmailOtpType)) {
    return null;
  }

  return value as EmailOtpType;
}

