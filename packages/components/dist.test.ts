import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { render } from "react-email";
import { InvitationEmail } from "./dist/email/templates.js";
import { emailThemeFromCss } from "./dist/email/theme.js";
import pkg from "./package.json";
import { closure, skinFiles } from "./registry-closure";

const { files, dependencies } = closure();
const dist = path.join(import.meta.dir, "dist");
const read = (name: string) => readFileSync(path.join(dist, name), "utf8");
const modules = [...files.keys()].filter((name) => /\.tsx?$/.test(name)).map((name) => name.replace(/\.tsx?$/, ""));
const sheets = [...files.keys()].filter((name) => name.endsWith(".css"));

test("every closure module ships with its declaration", () => {
  expect(modules.length).toBeGreaterThan(200);
  for (const name of modules) {
    expect(existsSync(path.join(dist, `${name}.js`))).toBe(true);
    expect(existsSync(path.join(dist, `${name}.d.ts`))).toBe(true);
  }
});

test("client directives survive unbundling", () => {
  expect(read("ui/accordion.js").startsWith('"use client";')).toBe(true);
});

test("the docs alias never reaches published output", () => {
  for (const name of modules) {
    expect(read(`${name}.js`)).not.toInclude("@/components/control-ui");
    expect(read(`${name}.d.ts`)).not.toInclude("@/components/control-ui");
  }
});

function externalImports(entry: string): Set<string> {
  const seen = new Set<string>();
  const external = new Set<string>();
  const visit = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    for (const [, specifier = ""] of read(name).matchAll(/(?:from|import)\s*\(?\s*"([^"]+)"/g)) {
      if (specifier.startsWith(".")) visit(path.posix.join(path.posix.dirname(name), specifier));
      else external.add(specifier);
    }
  };
  visit(entry);
  return external;
}

const optionalPeers = Object.keys(pkg.peerDependenciesMeta);
const optionalPeerImports = (entry: string) =>
  [...externalImports(entry)].filter((specifier) => optionalPeers.some((peer) => specifier === peer || specifier.startsWith(`${peer}/`)));
const peerFreeEntries = ["ui/markdown-elements.js", "ui/typography.js", "ui/button.js", "ui/card.js", "ui/field.js", "ui/input.js"];

test("light entries install without any optional peer", () => {
  expect(optionalPeerImports("ui/markdown.js")).toContain("streamdown");
  expect(optionalPeerImports("ui/markdown-components.js")).toContain("@tanstack/react-virtual");
  for (const entry of peerFreeEntries) expect({ entry, peers: optionalPeerImports(entry) }).toEqual({ entry, peers: [] });
});

test("the package works without a skin config or preset stylesheet", () => {
  expect(existsSync(path.join(dist, "skin.config.js"))).toBe(false);
  expect(existsSync(path.join(dist, "styles/skin-theme.css"))).toBe(false);
  expect(existsSync(path.join(dist, "skin-provider.js"))).toBe(true);
});

test("the refined skin ships as an opt-in entry, byte-identical to its pack", async () => {
  const { skin } = await import("./dist/skins/refined.js");
  expect(skin.id).toBe("refined");
  for (const [name, source] of skinFiles()) {
    if (name.endsWith(".css")) expect(read(name)).toBe(readFileSync(source, "utf8"));
  }
  expect(read("styles/index.css")).not.toInclude("skins/");
});

test("the stylesheet entry imports every shipped stylesheet, theme first, without a skin", () => {
  const imports = read("styles/index.css").trim().split("\n");
  expect(imports[0]).toBe('@import "./theme.css";');
  expect(imports.toSorted()).toEqual(sheets.map((sheet) => `@import "./${sheet.replace(/^styles\//, "")}";`).toSorted());
  expect(imports).not.toContain('@import "./skin-theme.css";');
  expect(imports).not.toContain('@import "./skin.css";');
  for (const sheet of sheets) expect(existsSync(path.join(dist, sheet))).toBe(true);
});

test("every component doc ships beside the source it documents", () => {
  const docs = [...files].filter(([name]) => name.startsWith("docs/"));
  expect(docs.length).toBeGreaterThan(100);
  for (const [name, source] of docs) expect(read(name)).toBe(readFileSync(source, "utf8"));
});

test("peer dependencies mirror the closure manifests, plus the optional Biome floor for the lint preset", () => {
  const lintPeer = "@biomejs/biome";
  expect(Object.keys(pkg.peerDependencies).sort()).toEqual([...dependencies.keys(), "react", "react-dom", lintPeer].sort());
  for (const [name, range] of dependencies) expect(pkg.peerDependencies).toHaveProperty(name, range);
  expect(pkg.peerDependenciesMeta).toHaveProperty([lintPeer, "optional"], true);
  for (const name of Object.keys(pkg.peerDependenciesMeta)) expect(pkg.peerDependencies).toHaveProperty(name);
});

test("published email templates resolve the installed theme and render standalone HTML", async () => {
  const theme = emailThemeFromCss([read("styles/theme.css")]);
  const html = await render(
    createElement(InvitationEmail, {
      theme,
      brand: { name: "Control UI", homeUrl: "https://control-ui.dev" },
      footer: {
        tagline: "Built with Control UI",
        socialLinks: [],
        helpLinks: [],
        sender: { company: "Control UI", addressLines: ["1 Rue Example", "75000 Paris"] },
        reason: "You received this because you were invited to a workspace.",
        legal: "© Control UI",
        mailing: "transactional",
      },
      inviter: "Alex",
      workspace: "Studio",
      inviteUrl: "https://example.com/invite",
    }),
  );
  expect(html).toContain("https://example.com/invite");
  expect(html).toContain(theme.colors.primary.replaceAll(" ", ""));
  expect(html).not.toMatch(/var\(|oklch\(/);
});
