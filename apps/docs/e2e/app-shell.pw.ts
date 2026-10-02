import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import tailwind from "@tailwindcss/postcss";
import postcss from "postcss";

const buildDirectory = mkdtempSync(path.join(tmpdir(), "control-ui-app-shell-"));
let stylesheet: string;
let script: string;

test.beforeAll(async () => {
  execFileSync("bun", ["build", "e2e/fixtures/app-shell.tsx", "--outdir", buildDirectory, "--target", "browser"], { cwd: process.cwd() });
  script = readFileSync(path.join(buildDirectory, "app-shell.js"), "utf8");
  const cssPath = path.resolve("app/globals.css");
  const result = await postcss([tailwind()]).process(readFileSync(cssPath, "utf8"), { from: cssPath });
  stylesheet = result.css;
});

test.afterAll(() => rmSync(buildDirectory, { recursive: true, force: true }));

test.beforeEach(async ({ page }) => {
  await page.route("http://shell.test/**", (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/fixture.js") return route.fulfill({ contentType: "application/javascript", body: script });
    if (url.pathname === "/fixture.css") return route.fulfill({ contentType: "text/css", body: stylesheet });
    return route.fulfill({
      contentType: "text/html",
      body: '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/fixture.css"></head><body><div id="root"></div><script type="module" src="/fixture.js"></script></body></html>',
    });
  });
});

for (const variant of ["sidebar", "inset", "floating", "page"]) {
  for (const collapsed of [false, true]) {
    test(`${variant} ${collapsed ? "collapsed" : "expanded"} fills short document pages through loading`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`http://shell.test/?variant=${variant}&collapsed=${collapsed}`);
      const content = page.locator("[data-app-shell-content]");
      const route = page.locator('[data-control-family="page-layout"][data-slot="root"]');
      await expect(route).toHaveAttribute("data-scroll", "page");
      const contentBounds = await content.boundingBox();
      const routeBounds = await route.boundingBox();
      if (!contentBounds || !routeBounds) throw new Error("Missing shell bounds");
      expect(Math.abs(contentBounds.y + contentBounds.height - routeBounds.y - routeBounds.height)).toBeLessThanOrEqual(2);
      await page.getByRole("button", { name: "Toggle loading" }).click();
      await expect(page.getByText("You’re all caught up.")).toBeVisible();
      expect(await route.boundingBox()).toEqual(routeBounds);
      await page.getByRole("button", { name: "Toggle length" }).click();
      await page.mouse.move(1000, 700);
      await page.mouse.wheel(0, 700);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
      await expect(page.getByRole("button", { name: "Toggle sidebar", exact: true })).toBeInViewport();
    });
  }
}

for (const scroll of ["inset", "none"]) {
  for (const width of [390, 1440]) {
    test(`${scroll} at ${width}px keeps scrolling inside the workspace`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`http://shell.test/?scroll=${scroll}`);
      await expect(page.locator('[data-control-family="page-layout"][data-slot="root"]')).toHaveAttribute("data-scroll", scroll);
      if (scroll === "inset") await page.getByRole("button", { name: "Toggle length" }).click();
      const viewport = page.locator('[data-app-shell-content] [data-control-ui="scroll-area"][data-slot="viewport"]').first();
      await viewport.hover();
      await page.mouse.wheel(0, 700);
      await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(300);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
      await expect(page.getByRole("button", { name: "Toggle sidebar", exact: true })).toBeInViewport();
    });
  }
}
