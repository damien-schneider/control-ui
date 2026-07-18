import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { array, object, string } from "zod";

import { PhoneInput } from "./ui/phone-input";

const MANIFEST = object({
  dependencies: array(string()),
  files: array(object({ path: string() })),
  registryDependencies: array(string()),
}).parse(JSON.parse(readFileSync(new URL("../../../../registry/control-ui/phone-input.json", import.meta.url), "utf8")));

describe("phone input registry contract", () => {
  test("renders a telephone control and submits only canonical E.164", () => {
    const html = renderToString(
      <PhoneInput defaultCountry="FR" name="phone" value="+33612345678" onValueChange={() => {}} aria-label="Phone number" />,
    );

    expect(html).toContain('data-phone-input=""');
    expect(html).toContain('type="tel"');
    expect(html).toContain('aria-label="Phone number"');
    expect(html.match(/name="phone"/g)).toHaveLength(1);
    expect(html).toContain('type="hidden"');
    expect(html).toContain('value="+33612345678"');
  });

  test("forwards invalid, disabled, and read-only states", () => {
    const html = renderToString(<PhoneInput defaultCountry="FR" aria-invalid disabled readOnly />);

    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("disabled");
    expect(html).toContain("readOnly");
  });

  test("owns its domain helper and references shared primitives", () => {
    expect(MANIFEST.files.map((file) => file.path).sort()).toEqual([
      "src/registry/lib/phone-input-format.ts",
      "src/registry/lib/phone-number.ts",
      "src/registry/sources/control-ui/ui/phone-input.tsx",
    ]);
    expect(MANIFEST.dependencies.some((dependency) => dependency.startsWith("libphonenumber-js@"))).toBe(true);
    expect(MANIFEST.dependencies.some((dependency) => dependency.startsWith("react-phone-number-input@"))).toBe(true);
    expect(MANIFEST.dependencies.some((dependency) => dependency.startsWith("zod@"))).toBe(true);
    expect(MANIFEST.registryDependencies).toEqual(expect.arrayContaining(["command", "core", "input-group", "popover"]));
  });
});
