import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { skinMetas } from "@/app/(features)/catalog/skins";
import { THEME_CONTRACT_NAMES } from "@/src/registry/lib/theme-contract";

const entrypoint = fileURLToPath(new URL("../components/theme-drawer/initialize-theme.ts", import.meta.url));
const target = fileURLToPath(new URL("../app/(features)/theme/generated-theme-init.json", import.meta.url));
const bundle = await Bun.build({
  entrypoints: [entrypoint],
  target: "browser",
  format: "iife",
  minify: true,
  plugins: [
    {
      name: "inline-theme-metadata",
      setup(build) {
        build.onLoad({ filter: /\/catalog\/skins\.ts$/ }, () => ({
          contents: `export const skinMetas = ${JSON.stringify(skinMetas)};`,
          loader: "js",
        }));
        build.onLoad({ filter: /\/lib\/theme-contract\.ts$/ }, () => ({
          contents: `export const THEME_CONTRACT_NAMES = new Set(${JSON.stringify([...THEME_CONTRACT_NAMES])});`,
          loader: "js",
        }));
      },
    },
  ],
});
if (!bundle.success) throw new Error(bundle.logs.join("\n"));
const script = (await bundle.outputs[0].text()).replaceAll("</script", "<\\/script");
const content = `${JSON.stringify(script)}\n`;

if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== content) throw new Error("Theme init is out of date; run bun run sync:theme-init.");
} else {
  writeFileSync(target, content);
}
