import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const COMPONENT = readFileSync(new URL("./command.tsx", import.meta.url), "utf8");

describe("command registry contract", () => {
  test("disabled items expose state and reject selection", () => {
    expect(COMPONENT).toContain("if (disabled) return;");
    expect(COMPONENT).toContain('data-disabled={disabled ? "true" : undefined}');
    expect(COMPONENT).toContain("disabled={disabled}");
    expect(COMPONENT).toContain("aria-disabled={disabled || undefined}");
    expect(COMPONENT).toContain("onSelect={handleSelect}");
  });
});
