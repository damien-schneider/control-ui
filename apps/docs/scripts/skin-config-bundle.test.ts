import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-skin-bundle-"));
const skinPacks = path.join(process.cwd(), "src/registry/skin-packs");
const registryRoot = path.join(process.cwd(), "src/registry");
const controlUiSources = path.join(registryRoot, "sources/control-ui");

afterAll(() => rmSync(temporaryDirectory, { recursive: true, force: true }));

type SkinConfigBundle = { code: string; gzipBytes: number };

async function bundledSkinConfigs(skinIds: readonly string[]): Promise<Record<string, SkinConfigBundle>> {
  const entrypoints = skinIds.map((skinId) => {
    const entrypoint = path.join(temporaryDirectory, `${skinId}.tsx`);
    const skinConfig = path.join(skinPacks, skinId, "skin.config.tsx");
    writeFileSync(entrypoint, `import { skin } from ${JSON.stringify(skinConfig)};\nconsole.log(skin);\n`);
    return entrypoint;
  });
  const result = await Bun.build({
    entrypoints,
    minify: true,
    packages: "external",
    plugins: [
      {
        name: "active-skin-configs",
        setup(build) {
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
  return Object.fromEntries(
    await Promise.all(
      result.outputs.map(async (output) => {
        const bytes = new Uint8Array(await output.arrayBuffer());
        const bundle: SkinConfigBundle = { code: new TextDecoder().decode(bytes), gzipBytes: gzipSync(bytes).byteLength };
        return [path.basename(output.path, ".js"), bundle] as const;
      }),
    ),
  );
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
    const bundles = await bundledSkinConfigs(skinIds);

    expect(Object.keys(bundles).sort()).toEqual(skinIds);
    for (const [skinId, { gzipBytes }] of Object.entries(bundles)) {
      expect(gzipBytes, `${skinId} skin config is ${gzipBytes} gzip bytes`).toBeLessThanOrEqual(4096);
    }
    expect(bundles.refined.gzipBytes).toBeLessThan(600);
    expect(bundles.cuicui.code).toContain("data-send-aurora");
  });
});
