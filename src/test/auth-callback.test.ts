import { parseEmailOtpType, sanitizeAuthRedirect } from "@/lib/auth-callback";

describe("auth callback helpers", () => {
  it("keeps safe local redirect paths", () => {
    expect(sanitizeAuthRedirect("/plan?from=signup")).toBe("/plan?from=signup");
    expect(sanitizeAuthRedirect(null)).toBe("/today");
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(sanitizeAuthRedirect("https://example.com/steal-session")).toBe("/today");
    expect(sanitizeAuthRedirect("//example.com/steal-session")).toBe("/today");
  });

  it("accepts every Supabase email OTP verification type", () => {
    for (const type of ["signup", "invite", "magiclink", "recovery", "email_change", "email"]) {
      expect(parseEmailOtpType(type)).toBe(type);
    }
  });

  it("rejects missing and non-email OTP types", () => {
    expect(parseEmailOtpType(null)).toBeNull();
    expect(parseEmailOtpType("sms")).toBeNull();
    expect(parseEmailOtpType("unknown")).toBeNull();
  });
});
