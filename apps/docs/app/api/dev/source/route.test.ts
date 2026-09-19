import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { GET } from "./route";

const testEnvironment = process.env.NODE_ENV;

afterEach(() => {
  Object.assign(process.env, { NODE_ENV: testEnvironment });
});

function requestSource(requestedPath: string, position: Record<string, string> = {}) {
  const query = new URLSearchParams({ path: requestedPath, ...position });
  return GET(new Request(`http://127.0.0.1:3000/api/dev/source?${query}`));
}

test("serves repository source files and nothing outside them in development", async () => {
  Object.assign(process.env, { NODE_ENV: "development" });
  const sourceOutsideRepo = path.join(mkdtempSync(path.join(tmpdir(), "dev-source-")), "outside.ts");
  writeFileSync(sourceOutsideRepo, "export const secret = 1;\n");

  const layout = await requestSource("app/layout.tsx");
  expect(layout.status).toBe(200);
  expect(await layout.json()).toMatchObject({ path: "apps/docs/app/layout.tsx" });

  expect((await requestSource(sourceOutsideRepo)).status).toBe(404);
  expect((await requestSource(path.relative(process.cwd(), sourceOutsideRepo))).status).toBe(404);
  expect((await requestSource(".env.example")).status).toBe(404);
});

test("hides the route outside development", async () => {
  Object.assign(process.env, { NODE_ENV: "production" });

  expect((await requestSource("app/layout.tsx")).status).toBe(404);
});

test("reports every line of the grabbed JSX element", async () => {
  Object.assign(process.env, { NODE_ENV: "development" });
  const cacheDirectory = path.join(process.cwd(), "node_modules", ".cache");
  mkdirSync(cacheDirectory, { recursive: true });
  const componentDirectory = mkdtempSync(path.join(cacheDirectory, "dev-source-"));
  const component = path.join(componentDirectory, "card.tsx");
  writeFileSync(component, "export const Card = () => (\n  <section>\n    <h1>Title</h1>\n  </section>\n);\n");

  try {
    const section = await requestSource(component, { line: "2", column: "2" });
    expect(await section.json()).toMatchObject({ elementLines: [2, 3, 4] });

    const unknownPosition = await requestSource(component, { line: "3", column: "0" });
    expect(await unknownPosition.json()).toMatchObject({ elementLines: [3] });
  } finally {
    rmSync(componentDirectory, { recursive: true, force: true });
  }
});
