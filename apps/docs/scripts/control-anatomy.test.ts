import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { skinSelector } from "./control-anatomy";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const guidesDir = path.join(appRoot, "content/guides");

describe("documented anatomy grammar", () => {
  test("the architecture guide shows the selector the builder emits", () => {
    const guide = readFileSync(path.join(guidesDir, "architecture.mdx"), "utf8");
    expect(guide).toContain(skinSelector({ skin: "rig", family: "chat-composer", part: "root" }));
  });
});
