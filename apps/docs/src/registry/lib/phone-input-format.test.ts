import { describe, expect, test } from "bun:test";
import { getCountries, getCountryCallingCode, getExampleNumber } from "libphonenumber-js/max";
import examples from "libphonenumber-js/mobile/examples";

import { normalizePhoneInputText, normalizePhoneInputValue } from "./phone-input-format";

describe("phone input formatting", () => {
  test("normalizes a national example for every supported country", () => {
    const failures = getCountries().flatMap((country) => {
      const example = getExampleNumber(country, examples);
      if (!example) return [`${country}: missing example`];

      const callingCode = getCountryCallingCode(country);
      const nationalNumber = example.formatNational();
      const internationalInput = `+${callingCode} ${nationalNumber}`;
      const rawValue = `+${callingCode}${nationalNumber.replaceAll(/\D/g, "")}`;
      const normalizedText = normalizePhoneInputText(internationalInput, country);
      const normalizedValue = normalizePhoneInputValue(rawValue, country);

      return normalizedValue === example.number && normalizedText.replaceAll(/\D/g, "") === example.number.slice(1)
        ? []
        : [`${country}: ${internationalInput} became ${normalizedText} / ${normalizedValue}, expected ${example.number}`];
    });

    expect(failures).toEqual([]);
  });

  test("keeps significant zeroes while removing national trunk prefixes", () => {
    expect(normalizePhoneInputText("+33 07 50 32 67 15", "FR")).toBe("+33 7 50 32 67 15");
    expect(normalizePhoneInputText("+44 020 7946 0018", "GB")).toBe("+44 20 7946 0018");
    expect(normalizePhoneInputText("+49 01512 3456789", "DE")).toBe("+49 1512 3456789");
    expect(normalizePhoneInputText("+39 02 1234 5678", "IT")).toBe("+39 02 1234 5678");
  });

  test("normalizes countries that share a calling code independently", () => {
    expect(normalizePhoneInputText("+1 (416) 555-0123", "CA")).toBe("+1 416 555 0123");
    expect(normalizePhoneInputText("+1 (242) 555-0123", "BS")).toBe("+1 242 555 0123");
    expect(normalizePhoneInputText("+44 01481 256789", "GG")).toBe("+44 1481 256789");
  });
});
