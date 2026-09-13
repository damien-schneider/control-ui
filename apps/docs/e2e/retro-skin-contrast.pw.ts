import { expect, type Page, test } from "@playwright/test";
import { contrastRatio } from "../src/registry/sources/control-ui/scripts/contrast-eval.mjs";

async function renderedContrast(page: Page, foregroundSelector: string, backgroundSelector: string) {
  const colors = await page.evaluate(
    ({ foreground, background }) => {
      const foregroundElement = document.querySelector(foreground);
      const backgroundElement = document.querySelector(background);
      if (!foregroundElement || !backgroundElement) throw new Error("Contrast surface is missing");
      const context = document.createElement("canvas").getContext("2d");
      if (!context) throw new Error("Canvas color conversion is unavailable");
      const resolveCanvasColor = (color: string) => {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        const pixel = context.getImageData(0, 0, 1, 1).data;
        return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] / 255 };
      };
      return {
        text: resolveCanvasColor(getComputedStyle(foregroundElement).color),
        surface: resolveCanvasColor(getComputedStyle(backgroundElement).backgroundColor),
      };
    },
    { foreground: foregroundSelector, background: backgroundSelector },
  );
  expect(colors.text.a).toBe(1);
  expect(colors.surface.a).toBe(1);
  return contrastRatio(colors.text, colors.surface);
}

for (const [skin, mode] of [
  ["xp", "light"],
  ["xp", "dark"],
  ["windows-98", "light"],
]) {
  test(`${skin} ${mode}: user messages and selected tree rows remain readable`, async ({ page }) => {
    await page.addInitScript(
      ({ skinId, colorMode }) => {
        localStorage.setItem(
          "control-ui:theme-editor:v2",
          JSON.stringify({ skin: skinId, overrides: {}, light: {}, dark: {}, textFixes: {} }),
        );
        localStorage.setItem("control-ui:theme:v1", colorMode);
      },
      { skinId: skin, colorMode: mode },
    );
    await page.goto("/ai/chat-message");
    const userMessage = '[data-control-family="chat-message"][data-slot="content"][data-role="user"]';
    await expect(page.locator(userMessage).first()).toBeVisible();
    expect(await renderedContrast(page, userMessage, userMessage)).toBeGreaterThanOrEqual(4.5);
    await page.goto("/primitives/tree");
    const selectedRow = '[data-control-family="tree"][data-slot="item-trigger"][data-selected]';
    const selectionIndicator = '[data-control-family="tree"] > [data-control-family="track-highlight"][data-slot="root"]';
    await expect(page.locator(selectedRow).first()).toBeVisible();
    await expect.poll(() => renderedContrast(page, selectedRow, selectionIndicator)).toBeGreaterThanOrEqual(4.5);
    await page.locator(selectedRow).first().hover();
    await expect.poll(() => renderedContrast(page, selectedRow, selectionIndicator)).toBeGreaterThanOrEqual(4.5);
    await page.locator(selectedRow).first().press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect.poll(() => renderedContrast(page, selectedRow, selectionIndicator)).toBeGreaterThanOrEqual(4.5);
  });
}
