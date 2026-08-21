import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { identityAttribute, skinSelector } from "./control-anatomy";

const appRoot = fileURLToPath(new URL("../", import.meta.url));
const guidesDir = path.join(appRoot, "content/guides");
const templatesDir = path.join(appRoot, "app/(features)/page-templates");

const proseSurfaces = [
  ...readdirSync(guidesDir)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => path.join(guidesDir, name)),
  ...readdirSync(templatesDir)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => path.join(templatesDir, name)),
  fileURLToPath(new URL("../../../packages/skills/src/concerns/control-ui.ts", import.meta.url)),
];

const keyedByIdentity = new RegExp(`\\[${identityAttribute}=(?:&quot;|["'])`);

describe("documented anatomy grammar", () => {
  test("no documented selector keys a part by identity", () => {
    const offenders = proseSurfaces.flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .flatMap((line, index) => (keyedByIdentity.test(line) ? [`${path.relative(appRoot, file)}:${index + 1}`] : [])),
    );
    expect(offenders).toEqual([]);
  });

  test("the architecture guide shows the selector the builder emits", () => {
    const guide = readFileSync(path.join(guidesDir, "architecture.mdx"), "utf8");
    expect(guide).toContain(skinSelector({ skin: "rig", family: "chat-composer", part: "root" }));
  });
});
