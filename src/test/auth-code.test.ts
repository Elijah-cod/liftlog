import { describe, expect, it } from "vitest";

import {
  isEmailCode,
  maskEmail,
  sanitizeAuthNext,
} from "@/lib/auth-code";

describe("email code auth helpers", () => {
  it("keeps internal redirects and rejects external-looking paths", () => {
    expect(sanitizeAuthNext("/plan")).toBe("/plan");
    expect(sanitizeAuthNext("//example.com")).toBe("/today");
    expect(sanitizeAuthNext("https://example.com")).toBe("/today");
  });

  it("masks the local part while leaving the destination recognizable", () => {
    expect(maskEmail("elijah@example.com")).toBe("el••••@example.com");
    expect(maskEmail("a@example.com")).toBe("a•••@example.com");
  });

  it("accepts only six numeric digits", () => {
    expect(isEmailCode("123456")).toBe(true);
    expect(isEmailCode(" 123456 ")).toBe(true);
    expect(isEmailCode("12345")).toBe(false);
    expect(isEmailCode("12345a")).toBe(false);
  });
});
