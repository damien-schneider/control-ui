import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { Page } from "@playwright/test";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";
import { FIXTURE_BUILD_DIRECTORY_VARIABLE } from "./build-directory";

export const FIXTURE_ORIGIN = "http://fixture.test";

const DOCS_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const BUILD_POLL_INTERVAL_MS = 100;
const runExecutable = promisify(execFile);

const stylesheetBuilds = {
  docs: async () => {
    const globalsPath = path.join(DOCS_ROOT, "app/globals.css");
    const result = await postcss([tailwind()]).process(await readFile(globalsPath, "utf8"), { from: globalsPath });
    return result.css;
  },
  "tabs-motion": async () => {
    const sources = path.join(DOCS_ROOT, "src/registry/sources/control-ui");
    const [theme, tabs, tabsMotion] = await Promise.all(
      ["theme.css", "recipes/tabs.css", "recipes/tabs-motion.css"].map((file) => readFile(path.join(sources, file), "utf8")),
    );
    const result = await postcss([tailwind()]).process(
      `@import "tailwindcss"; @source "../src/registry/sources/control-ui/ui/tabs.tsx"; @source "./fixtures/tabs-transition.tsx"; ${theme}\n${tabs}\n${tabsMotion}`,
      { from: path.join(DOCS_ROOT, "e2e/tabs-transition.css") },
    );
    return result.css;
  },
};

const fixtureStylesheets = {
  "app-shell": "docs",
  "chat-message-edit": "docs",
  "component-performance": "docs",
  "dropdown-hover": "docs",
  "infinite-canvas": "docs",
  "markdown-editor": "docs",
  "tabs-transition": "tabs-motion",
} as const satisfies Record<string, keyof typeof stylesheetBuilds>;

type FixtureName = keyof typeof fixtureStylesheets;

interface FixtureDocument {
  search?: string;
  skin?: string;
  style?: string;
}

function buildDirectory() {
  const directory = process.env[FIXTURE_BUILD_DIRECTORY_VARIABLE];
  if (!directory) throw new Error(`${FIXTURE_BUILD_DIRECTORY_VARIABLE} is unset; run fixture specs through playwright.config.ts`);
  return directory;
}

async function awaitBuildFromAnotherWorker(output: string) {
  while (!existsSync(output)) {
    if (existsSync(`${output}.failed`)) {
      throw new Error(`Building ${path.basename(output)} failed in another worker: ${await readFile(`${output}.failed`, "utf8")}`);
    }
    await delay(BUILD_POLL_INTERVAL_MS);
  }
  return readFile(output, "utf8");
}

async function buildOncePerRun(fileName: string, build: () => Promise<string>) {
  const output = path.join(buildDirectory(), fileName);
  try {
    await mkdir(`${output}.claim`);
  } catch (error) {
    const alreadyClaimed = error instanceof Error && "code" in error && error.code === "EEXIST";
    if (!alreadyClaimed) throw error;
    return awaitBuildFromAnotherWorker(output);
  }
  try {
    const content = await build();
    await writeFile(`${output}.partial`, content);
    await rename(`${output}.partial`, output);
    return content;
  } catch (error) {
    await writeFile(`${output}.failed`, String(error));
    throw error;
  }
}

const builds = new Map<string, Promise<string>>();

function cachedBuild(fileName: string, build: () => Promise<string>) {
  const existing = builds.get(fileName);
  if (existing) return existing;
  const pending = buildOncePerRun(fileName, build);
  builds.set(fileName, pending);
  return pending;
}

function fixtureScript(name: FixtureName) {
  return cachedBuild(`${name}.js`, async () => {
    const outputDirectory = await mkdtemp(path.join(buildDirectory(), `${name}-`));
    await runExecutable("bun", ["build", `e2e/fixtures/${name}.tsx`, "--outdir", outputDirectory, "--target", "browser"], {
      cwd: DOCS_ROOT,
    });
    return readFile(path.join(outputDirectory, `${name}.js`), "utf8");
  });
}

function fixtureStylesheet(name: FixtureName) {
  const stylesheet = fixtureStylesheets[name];
  return cachedBuild(`${stylesheet}.css`, stylesheetBuilds[stylesheet]);
}

export async function serveFixture(page: Page, name: FixtureName, { search = "", skin, style = "" }: FixtureDocument = {}) {
  const [script, stylesheet] = await Promise.all([fixtureScript(name), fixtureStylesheet(name)]);
  const skinAttribute = skin ? ` data-skin="${skin}"` : "";
  const html = `<!doctype html><html lang="en"${skinAttribute}><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"><style>${style}</style></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>`;
  await page.route(`${FIXTURE_ORIGIN}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === "/") return route.fulfill({ contentType: "text/html", body: html });
    if (pathname === "/fixture.js") return route.fulfill({ contentType: "text/javascript", body: script });
    if (pathname === "/fixture.css") return route.fulfill({ contentType: "text/css", body: stylesheet });
    return route.fallback();
  });
  await page.goto(`${FIXTURE_ORIGIN}/${search}`);
}
