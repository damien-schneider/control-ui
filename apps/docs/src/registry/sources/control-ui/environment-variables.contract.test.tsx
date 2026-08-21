import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";

import { EnvironmentVariables } from "./environment-variables";

const COMPONENT = readFileSync(new URL("./environment-variables.tsx", import.meta.url), "utf8");
const HOOK = readFileSync(new URL("../../hooks/use-environment-variables.ts", import.meta.url), "utf8");
const ENV_FILE = readFileSync(new URL("../../lib/env-file.ts", import.meta.url), "utf8");
// Generated registry manifest: JSON.parse types as any, so binding is annotated rather than asserted; the
// "standalone manifest" test below asserts both fields' contents.
const MANIFEST: { files: { path: string }[]; registryDependencies: string[] } = JSON.parse(
  readFileSync(new URL("../../../../registry/control-ui/environment-variables.json", import.meta.url), "utf8"),
);

describe("environment variables registry contract", () => {
  test("core source stays runtime agnostic", () => {
    const refToken = ["forward", "Ref"].join("");
    const mastraToken = ["@mastra", "/"].join("");
    const aiImportToken = ["from ", '"ai"'].join("");

    for (const source of [COMPONENT, HOOK, ENV_FILE]) {
      expect(source).not.toContain(mastraToken);
      expect(source).not.toContain(aiImportToken);
      expect(source).not.toContain(refToken);
    }
  });

  test("editor composes Control UI controls instead of host shadcn", () => {
    expect(COMPONENT).toContain("@/components/control-ui/ui/input");
    expect(COMPONENT).toContain("@/components/control-ui/ui/input-group");
    expect(COMPONENT).not.toContain("@/components/control-ui/ui/button-group");
    expect(COMPONENT).not.toContain("@/components/ui/");
  });

  test("default editor renders the upload, direct-paste hint, row, and actions anatomy", () => {
    const html = renderToString(<EnvironmentVariables initialRows={[{ key: "API_KEY", value: "secret" }]} onSubmit={() => {}} />);

    expect(html).toContain('data-control-ui="environment-variables"');
    expect(html).toContain('data-slot="root"');
    expect(html).toContain("Paste one or more");
    expect(html).toContain("lines directly into any field");
    expect(html).toContain('aria-label="Import .env file"');
    expect(html).toContain('data-slot="row"');
    expect(html).toContain('data-slot="actions"');
  });
  test("forwards retained knob styles to painted public parts", () => {
    const message = renderToString(
      <EnvironmentVariables.Message error="Invalid value" style={{ "--cui-environment-variables-message-border-color": "red" }} />,
    );
    const item = renderToString(
      <EnvironmentVariables.ReadOnlyItem name="API_KEY" style={{ "--cui-environment-variables-meta-foreground": "gray" }} />,
    );

    expect(message).toContain("--cui-environment-variables-message-border-color:red");
    expect(item).toContain("--cui-environment-variables-meta-foreground:gray");
  });

  test("standalone manifest owns domain files and references shared primitives", () => {
    expect(MANIFEST.files.map((file) => file.path).sort()).toEqual([
      "src/registry/hooks/use-environment-variables.ts",
      "src/registry/knob-contracts/environment-variables-knobs.ts",
      "src/registry/lib/env-file.ts",
      "src/registry/sources/control-ui/environment-variables.tsx",
      "src/registry/sources/control-ui/recipes/environment-variables.css",
    ]);
    expect(MANIFEST.registryDependencies).toEqual(expect.arrayContaining(["button", "core", "input", "input-group"]));
    expect(MANIFEST.registryDependencies).not.toContain("button-group");
  });
});
