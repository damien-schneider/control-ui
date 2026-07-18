import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dir, "../../..");
const publicRegistryDirectory = path.join(repositoryRoot, "apps/docs/public/r");

function trackedDocumentationFiles() {
  const result = Bun.spawnSync(["git", "ls-files", "*.md", "*.mdx"], { cwd: repositoryRoot });
  if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  return result.stdout.toString().trim().split("\n").filter(Boolean);
}

describe("documented registry URLs", () => {
  test("all tracked documentation points to published registry payloads", () => {
    const missingPayloads: string[] = [];

    for (const relativeFile of trackedDocumentationFiles()) {
      const source = readFileSync(path.join(repositoryRoot, relativeFile), "utf8");
      for (const match of source.matchAll(/\/r\/([a-z0-9][a-z0-9-]*\.json)\b/g)) {
        if (!existsSync(path.join(publicRegistryDirectory, match[1]))) {
          missingPayloads.push(`${relativeFile}: ${match[1]}`);
        }
      }
    }

    expect(missingPayloads).toEqual([]);
  });

  test("documents the v3 to v4 ToolCall migration", () => {
    for (const relativeFile of ["README.md", "apps/docs/content/guides/get-started.mdx"]) {
      const source = readFileSync(path.join(repositoryRoot, relativeFile), "utf8");
      expect(source).toMatch(/contract version 4/i);
      expect(source).toContain("tool-call.tsx");
      expect(source).toContain("use-tool-call.ts");
    }
  });
});
