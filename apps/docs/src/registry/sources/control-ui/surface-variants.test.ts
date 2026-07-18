import { describe, expect, test } from "bun:test";

import { floatingListItemClasses } from "./surface-variants";

describe("floating list item classes", () => {
  test('disabled styling never matches cmdk\'s always-present data-disabled="false"', () => {
    expect(floatingListItemClasses).not.toMatch(/data-\[disabled\]:/);
  });

  test("keeps disabled styling for both attribute conventions", () => {
    expect(floatingListItemClasses).toContain(":not([data-disabled=false])]:cursor-not-allowed");
    expect(floatingListItemClasses).toContain(":not([data-disabled=false])]:opacity-[var(--popup-item-disabled-opacity,0.4)]");
    expect(floatingListItemClasses).toContain("data-[disabled=true]:pointer-events-none");
  });
});
