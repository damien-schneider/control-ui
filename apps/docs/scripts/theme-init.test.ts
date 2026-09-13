import { expect, test } from "bun:test";
import { gzipSync } from "node:zlib";
import themeInitScript from "@/app/(features)/theme/generated-theme-init.json";

test("pre-paint restoration stays below 6 KiB compressed", () => {
  expect(gzipSync(themeInitScript).byteLength).toBeLessThanOrEqual(6 * 1024);
});
