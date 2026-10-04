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
      for (const match of source.matchAll(/\/r\/((?:contract\/)?[a-z0-9][a-z0-9.-]*\.json)\b/g)) {
        if (!existsSync(path.join(publicRegistryDirectory, match[1]))) {
          missingPayloads.push(`${relativeFile}: ${match[1]}`);
        }
      }
    }

    expect(missingPayloads).toEqual([]);
  });
});
