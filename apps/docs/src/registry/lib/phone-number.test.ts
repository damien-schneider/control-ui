import { describe, expect, test } from "bun:test";

import { createPhoneNumberSchema, mobilePhoneNumberSchema, phoneNumberSchema, possiblePhoneNumberSchema } from "./phone-number";

describe("phone number schemas", () => {
  test("accepts valid E.164 numbers across numbering plans", () => {
    for (const value of ["+33612345678", "+12025550123", "+14165551234", "+80012345678"]) {
      expect(phoneNumberSchema.parse(value)).toBe(value);
    }
  });

  test("rejects malformed, incomplete, and invalid digit patterns", () => {
    for (const value of ["33612345678", "+123", "+15555555555"]) {
      expect(phoneNumberSchema.safeParse(value).success).toBe(false);
    }
  });

  test("offers length-based validation for long-lived forms", () => {
    expect(possiblePhoneNumberSchema.parse("+15555555555")).toBe("+15555555555");
    expect(possiblePhoneNumberSchema.safeParse("+1555555555").success).toBe(false);
  });

  test("accepts mobile and ambiguous mobile-capable types", () => {
    expect(mobilePhoneNumberSchema.parse("+33612345678")).toBe("+33612345678");
    expect(mobilePhoneNumberSchema.parse("+12025550123")).toBe("+12025550123");
    expect(mobilePhoneNumberSchema.safeParse("+33123456789").success).toBe(false);
    expect(mobilePhoneNumberSchema.safeParse("+80012345678").success).toBe(false);
  });

  test("composes with optional fields and localized messages", () => {
    expect(phoneNumberSchema.optional().parse(undefined)).toBeUndefined();

    const result = createPhoneNumberSchema({ messages: { invalid: "Numéro invalide." } }).safeParse("+15555555555");
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("Numéro invalide.");
  });
});
