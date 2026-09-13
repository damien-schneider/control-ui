import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { render } from "react-email";
import { InvitationEmail } from "./dist/email/templates.js";
import { emailThemeFromCss } from "./dist/email/theme.js";
import pkg from "./package.json";
import { closure, stylesIndex } from "./registry-closure";

const { files, dependencies, styles } = closure();
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

test("the package works without a skin config or preset stylesheet", () => {
  expect(existsSync(path.join(dist, "skin.config.js"))).toBe(false);
  expect(existsSync(path.join(dist, "styles/skin-theme.css"))).toBe(false);
  expect(existsSync(path.join(dist, "skin-provider.js"))).toBe(true);
});

test("the stylesheet entry imports every shipped stylesheet, without a skin", () => {
  expect(styles.length).toBe(sheets.length);
  expect(styles[0]).toBe("theme.css");
  expect(styles).not.toContain("skin-theme.css");
  expect(styles).not.toContain("skin.css");
  expect(read("styles/index.css")).toBe(stylesIndex(styles));
  for (const sheet of sheets) expect(existsSync(path.join(dist, sheet))).toBe(true);
});

test("peer dependencies mirror the closure manifests", () => {
  expect(Object.keys(pkg.peerDependencies).sort()).toEqual([...dependencies.keys(), "react"].sort());
  for (const [name, range] of dependencies) expect(pkg.peerDependencies).toHaveProperty(name, range);
  for (const name of Object.keys(pkg.peerDependenciesMeta)) expect(pkg.peerDependencies).toHaveProperty(name);
});

test("published email templates resolve the installed theme and render standalone HTML", async () => {
  const theme = emailThemeFromCss([read("styles/theme.css")]);
  const html = await render(
    createElement(InvitationEmail, {
      theme,
      brand: "Control UI",
      footer: "Built with Control UI",
      inviter: "Alex",
      workspace: "Studio",
      inviteUrl: "https://example.com/invite",
    }),
  );
  expect(html).toContain("https://example.com/invite");
  expect(html).toContain(theme.colors.primary.replaceAll(" ", ""));
  expect(html).not.toMatch(/var\(|oklch\(/);
});
