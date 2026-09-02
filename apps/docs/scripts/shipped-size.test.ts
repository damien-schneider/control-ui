import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";

const MAX_JS_GZIP_BYTES = 16_000;
const MAX_CSS_GZIP_BYTES = 9_000;

const docsRoot = process.cwd();
const app = mkdtempSync(path.join(tmpdir(), "control-ui-shipped-"));
afterAll(() => rmSync(app, { recursive: true, force: true }));

function installButtonApp() {
  for (const item of ["core", "button", "skin-refined"]) {
    const payload = JSON.parse(readFileSync(path.join(docsRoot, `public/r/${item}.json`), "utf8"));
    for (const file of payload.files) {
      const target = path.join(app, file.target.replace(/^@components\//, "components/"));
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, file.content);
    }
  }
  symlinkSync(path.join(docsRoot, "node_modules"), path.join(app, "node_modules"));
  writeFileSync(path.join(app, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./*"] } } }));
  writeFileSync(
    path.join(app, "main.tsx"),
    'import { createRoot } from "react-dom/client";\nimport { Button } from "@/components/control-ui/ui/button";\ncreateRoot(document.body).render(<Button>Save</Button>);\n',
  );
  writeFileSync(
    path.join(app, "build-css.mjs"),
    [
      'import { readFileSync } from "node:fs";',
      'import tailwind from "@tailwindcss/postcss";',
      'import postcss from "postcss";',
      'const result = await postcss([tailwind({ base: import.meta.dirname, optimize: { minify: true } })]).process(readFileSync("app.css", "utf8"), { from: "app.css" });',
      "process.stdout.write(result.css);",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(app, "app.css"),
    [
      '@import "tailwindcss";',
      '@import "./components/control-ui/styles/theme.css";',
      '@import "./components/control-ui/styles/skin-theme.css";',
      '@import "./components/control-ui/styles/skin.css";',
      '@import "./components/control-ui/styles/recipes/button.css";',
      "",
    ].join("\n"),
  );
}

const gzipBytes = (text: string) => gzipSync(Buffer.from(text)).length;

describe("an app that installs core, button, and one skin, then renders a button", () => {
  installButtonApp();

  test("ships its JavaScript beyond React under budget", async () => {
    const result = await Bun.build({
      entrypoints: [path.join(app, "main.tsx")],
      minify: true,
      target: "browser",
      external: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
      define: { "process.env.NODE_ENV": '"production"' },
    });
    if (!result.success) throw new Error(result.logs.map(String).join("\n"));
    const js = await result.outputs[0].text();
    expect(gzipBytes(js)).toBeLessThanOrEqual(MAX_JS_GZIP_BYTES);
  });

  test("ships its CSS under budget", () => {
    const build = Bun.spawnSync(["node", "build-css.mjs"], { cwd: app });
    if (build.exitCode !== 0) throw new Error(build.stderr.toString());
    expect(gzipBytes(build.stdout.toString())).toBeLessThanOrEqual(MAX_CSS_GZIP_BYTES);
  });
});
