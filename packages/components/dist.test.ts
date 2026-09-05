import { expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
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

test("the baked skin is the registry pack, not the docs theme-editor proxy", () => {
  expect(read("skin.config.js")).toInclude('"refined"');
  expect(read("skin.config.js")).not.toInclude("setSkin");
});

test("the stylesheet entry imports every shipped stylesheet, the skin last", () => {
  expect(styles.length).toBe(sheets.length);
  expect(styles[0]).toBe("theme.css");
  expect(styles.slice(-2)).toEqual(["skin-theme.css", "skin.css"]);
  expect(read("styles/index.css")).toBe(stylesIndex(styles));
  for (const sheet of sheets) expect(existsSync(path.join(dist, sheet))).toBe(true);
});

test("peer dependencies mirror the closure manifests", () => {
  expect(Object.keys(pkg.peerDependencies).sort()).toEqual([...dependencies.keys(), "react"].sort());
  for (const [name, range] of dependencies) expect(pkg.peerDependencies).toHaveProperty(name, range);
  for (const name of Object.keys(pkg.peerDependenciesMeta)) expect(pkg.peerDependencies).toHaveProperty(name);
});
