export type EmailCodeIntent = "signup" | "signin";

export function sanitizeAuthNext(next: string | null | undefined, fallback = "/today") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }

  return next;
}

export function maskEmail(email: string) {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return email;
  }

  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"•".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

export function isEmailCode(value: string) {
  return /^\d{6}$/.test(value.trim());
}
