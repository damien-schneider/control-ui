import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";
import { THEME_STORAGE_KEY } from "../components/theme";
import { readCssWithImports } from "../scripts/read-css";
import { waitForReactHydration } from "./browser-test-helpers";

const registry = path.resolve("src/registry");
const packs = readdirSync(path.join(registry, "skin-packs"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const coreCss = ["theme.css", ...["tabs", "code", "chat-composer", "button", "field"].map((name) => `recipes/${name}.css`)]
  .map((file) => readFileSync(path.join(registry, "sources/control-ui", file), "utf8"))
  .join("\n");

async function composition(page: Page, skin = "none", dark = false) {
  const skinCss =
    skin === "none"
      ? ""
      : ["theme.css", "skin.css"].map((file) => readCssWithImports(path.join(registry, "skin-packs", skin, file))).join("\n");
  await page.setContent(`<!doctype html><html data-skin="${skin}" class="${dark ? "dark" : "light"}"><head>
    <style>:root { --spacing: 4px; } * { box-sizing: border-box; } ${coreCss}\n${skinCss}</style>
    </head><body>
    <div id="tabs" data-control-family="tabs" data-slot="root">
      <div><div data-control-family="tabs" data-slot="list" data-variant="browser" style="--_tabs-trigger-h: 32px; --active-tab-width: 80px; --active-tab-left: 20px">
        <div id="indicator" data-control-family="tabs" data-slot="indicator"></div>
      </div></div>
      <div id="surface" data-control-family="tabs" data-slot="surface">
        <figure id="code" data-control-family="code" data-slot="root" data-chrome="embedded">const answer = 42;</figure>
      </div>
    </div>
    <div id="direct-tabs" data-control-family="tabs" data-slot="root">
      <div data-control-family="tabs" data-slot="list" data-variant="browser"></div>
      <div id="panel" data-control-family="tabs" data-slot="panel">Panel</div>
    </div>
    <div id="composer" data-control-family="chat-composer" data-slot="root">
      <div id="shell" data-control-family="chat-composer" data-slot="shell" style="width: 320px; height: 160px; display: flex; flex-direction: column; justify-content: end">
        <div id="toolbar" data-control-family="chat-composer" data-slot="toolbar" style="display: flex; align-items: end">
          <button id="button" data-control-family="button" data-control="true" data-size="sm" style="width: 32px">Send</button>
          <input id="field" data-control-family="field" data-control="true" data-size="sm" style="width: 80px" aria-label="Model" />
        </div>
      </div>
    </div>
    </body></html>`);
}

async function expectConnectedSurface(page: Page) {
  const surface = page.locator("#surface");
  const fill = await surface.evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(fill).not.toBe("rgba(0, 0, 0, 0)");
  const indicator = page.locator("#indicator");
  expect(await indicator.evaluate((node) => getComputedStyle(node, "::before").backgroundColor)).toBe(fill);
  expect(await indicator.evaluate((node) => getComputedStyle(node, "::after").backgroundImage)).toContain(fill);
  expect(await indicator.evaluate((node) => getComputedStyle(node, "::before").borderTopColor)).toBe(
    await surface.evaluate((node) => getComputedStyle(node).borderTopColor),
  );
  await expect(page.locator("#code")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator("#code")).toHaveCSS("border-top-width", "0px");
  await expect(page.locator("#code")).toHaveCSS("box-shadow", "none");
}

async function expectNestedCorners(page: Page) {
  const corners = await page.locator("#button").evaluate((button) => {
    const shell = document.querySelector("#shell");
    if (!shell) throw new Error("Missing composer shell");
    const outer = shell.getBoundingClientRect();
    const inner = button.getBoundingClientRect();
    return {
      shell: Number.parseFloat(getComputedStyle(shell).borderBottomLeftRadius),
      button: Number.parseFloat(getComputedStyle(button).borderBottomLeftRadius),
      x: inner.left - outer.left,
      y: outer.bottom - inner.bottom,
      pixel: 1 / window.devicePixelRatio,
    };
  });
  // Fractional borders snap to device pixels while custom-property lengths retain their precision.
  expect(Math.abs(corners.button - Math.max(0, corners.shell - corners.x))).toBeLessThanOrEqual(corners.pixel);
  expect(Math.abs(corners.button - Math.max(0, corners.shell - corners.y))).toBeLessThanOrEqual(corners.pixel);
  await expect(page.locator("#field")).toHaveCSS("border-radius", `${corners.button}px`);
}

for (const skin of ["none", ...packs]) {
  for (const dark of [false, true]) {
    test(`${skin} ${dark ? "dark" : "light"}: composed surfaces and radius overrides`, async ({ page }) => {
      await composition(page, skin, dark);
      await expectConnectedSurface(page);
      await expectNestedCorners(page);
      await expect(page.locator("#panel")).toHaveCSS(
        "background-color",
        await page.locator("#surface").evaluate((node) => getComputedStyle(node).backgroundColor),
      );
      await page.locator("#tabs").evaluate((node) => {
        node.style.setProperty("--cui-tabs-surface-background", "oklch(0.6 0.1 250)");
        node.style.setProperty("--cui-tabs-indicator-background", "oklch(0.3 0.1 30)");
        node.style.setProperty("--cui-tabs-border-color", "oklch(0.7 0.1 140)");
        node.style.setProperty("--cui-tabs-surface-radius", "17px");
      });
      await expectConnectedSurface(page);
      await expect(page.locator("#surface")).toHaveCSS("background-color", "oklch(0.6 0.1 250)");
      await expect(page.locator("#surface")).toHaveCSS("border-radius", "17px");

      await page.locator("#button").evaluate((node) => node.style.setProperty("--cui-button-radius", "7px"));
      await page.locator("#field").evaluate((node) => node.style.setProperty("--cui-field-radius", "9px"));
      await expect(page.locator("#button")).toHaveCSS("border-radius", "7px");
      await expect(page.locator("#field")).toHaveCSS("border-radius", "9px");
    });
  }
}

test("composer corners fit the actual inset as radius, padding, and border change", async ({ page }) => {
  await composition(page);
  for (const [radius, padding, border] of [
    [0, 10, 1],
    [4, 10, 1],
    [20, 6, 2],
    [6, 14, 3],
  ]) {
    await page.locator("html").evaluate(
      (node, values) => {
        node.style.setProperty("--radius", `${values[0]}px`);
        node.style.setProperty("--composer-padding", `${values[1]}px`);
        node.style.setProperty("--control-rim-width", `${values[2]}px`);
      },
      [radius, padding, border],
    );
    await expectNestedCorners(page);
  }
  await page.locator("#composer").evaluate((node) => node.style.setProperty("--cui-chat-composer-shell-radius", "3px"));
  await expect(page.locator("#button")).toHaveCSS("border-radius", "0px");
  await page.locator("#button").evaluate((node) => node.setAttribute("data-shape", "circle"));
  await expect(page.locator("#button")).toHaveCSS("border-radius", "9999px");
});

test("docs preview and skin source keep their connected surfaces when switching tabs", async ({ page }, testInfo) => {
  await page.addInitScript((key) => localStorage.setItem(key, "dark"), THEME_STORAGE_KEY);
  for (const route of ["/components/chat-layout", "/theme-editor"]) {
    await page.goto(`${route}?skin=mastra${route === "/theme-editor" ? "&view=source" : ""}`);
    const surfaces = page.locator('[data-control-family="tabs"][data-slot="surface"]');
    await expect(surfaces.first()).toBeVisible();
    for (const surface of await surfaces.all()) {
      const checkFill = async () => {
        const fills = await surface.evaluate((node) => {
          const tabs = node.closest('[data-control-family="tabs"][data-slot="root"]');
          const indicator = tabs?.querySelector('[data-slot="indicator"]');
          if (!indicator) throw new Error("Missing connected tab indicator");
          return [getComputedStyle(node).backgroundColor, getComputedStyle(indicator, "::before").backgroundColor];
        });
        expect(fills[0]).toBe(fills[1]);
      };
      await checkFill();
      const tabs = surface.locator("..").getByRole("tab");
      await waitForReactHydration(tabs.nth(1));
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await checkFill();
      const code = surface.locator('[data-control-family="code"][data-slot="root"]');
      await expect(code).toHaveAttribute("data-chrome", "embedded");
      await expect(code).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await tabs.first().click();
    }
    await page.screenshot({ path: testInfo.outputPath(`${route.split("/").at(-1)}.png`) });
  }
});
