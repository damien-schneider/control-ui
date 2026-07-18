import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-skin-bundle-"));
const skinRuntime = path.join(process.cwd(), "src/registry/skin.ts");
const skinPacks = path.join(process.cwd(), "src/registry/skin-packs");
const registryRoot = path.join(process.cwd(), "src/registry");
const controlUiSources = path.join(registryRoot, "sources/control-ui");

afterAll(() => rmSync(temporaryDirectory, { recursive: true, force: true }));

async function bundledSkinConfig(skinId: string): Promise<{ code: string; gzipBytes: number }> {
  const entrypoint = path.join(temporaryDirectory, `${skinId}.tsx`);
  const skinConfig = path.join(skinPacks, skinId, "skin.config.tsx");
  writeFileSync(
    entrypoint,
    `import { skinSlot } from ${JSON.stringify(skinRuntime)};\nconsole.log(skinSlot("button", "root", { variant: "solid", tone: "neutral", size: "sm", active: false }));\n`,
  );
  const result = await Bun.build({
    entrypoints: [entrypoint],
    minify: true,
    packages: "external",
    plugins: [
      {
        name: `active-skin-${skinId}`,
        setup(build) {
          build.onResolve({ filter: /^\.\/skin\.config$/ }, () => ({ path: skinConfig }));
          build.onResolve({ filter: /^@\/components\/control-ui\// }, ({ path: specifier }) => {
            const relativePath = specifier.slice("@/components/control-ui/".length);
            for (const root of [registryRoot, controlUiSources]) {
              for (const candidate of [
                path.join(root, relativePath),
                path.join(root, `${relativePath}.ts`),
                path.join(root, `${relativePath}.tsx`),
              ]) {
                if (existsSync(candidate)) return { path: candidate };
              }
            }
            throw new Error(`Cannot resolve local Control UI import ${specifier}`);
          });
        },
      },
    ],
    target: "browser",
  });
  if (!result.success) throw new Error(result.logs.join("\n"));
  const bytes = new Uint8Array(await result.outputs[0].arrayBuffer());
  return { code: new TextDecoder().decode(bytes), gzipBytes: gzipSync(bytes).byteLength };
}

function skinConfigIds(): string[] {
  return readdirSync(skinPacks, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(path.join(skinPacks, entry.name, "skin.config.tsx")))
    .map((entry) => entry.name)
    .sort();
}

describe("skin config runtime cost", () => {
  test("every active config stays a small, single shared lookup table", async () => {
    const skinIds = skinConfigIds();
    const bundles: Record<string, Awaited<ReturnType<typeof bundledSkinConfig>>> = Object.fromEntries(
      await Promise.all(skinIds.map(async (skinId) => [skinId, await bundledSkinConfig(skinId)] as const)),
    );

    expect(Object.keys(bundles)).toEqual(skinIds);
    for (const [skinId, { gzipBytes }] of Object.entries(bundles)) {
      expect(gzipBytes, `${skinId} skin config is ${gzipBytes} gzip bytes`).toBeLessThanOrEqual(4096);
    }
    expect(bundles.refined.gzipBytes).toBeLessThan(600);
    expect(bundles.cuicui.code).toContain("data-send-aurora");
  });
});
