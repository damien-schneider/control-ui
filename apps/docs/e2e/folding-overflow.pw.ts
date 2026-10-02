import { expect, type Locator, test } from "@playwright/test";
import { THEME_EDITOR_STORAGE_KEY, THEME_STORAGE_KEY } from "@/components/theme";
import { meanScreenshotDifference, waitForReactHydration } from "./browser-test-helpers";

async function sampleFoldingMotion(panel: Locator) {
  await expect
    .poll(() => panel.evaluate((element) => element.getAnimations().some((animation) => animation.playState === "running")))
    .toBe(true);
  return panel.evaluate((element) => {
    const animations = element.getAnimations().filter((animation) => animation.playState === "running");
    if (animations.length === 0) throw new Error("Folding motion did not start");
    for (const animation of animations) {
      animation.pause();
      animation.currentTime = Number(animation.effect?.getTiming().duration) * 0.5;
    }
    const styles = getComputedStyle(element);
    const frame = { height: element.getBoundingClientRect().height, overflow: styles.overflow };
    for (const animation of animations) animation.finish();
    return frame;
  });
}

for (const mode of ["light", "dark"] as const) {
  for (const width of [390, 1440]) {
    test(`${mode} ${width}px: getting started paints its full surface outside the open panel`, async ({ page }, testInfo) => {
      await page.addInitScript(
        ({ editorStorageKey, modeStorageKey, themeMode }) => {
          localStorage.setItem(editorStorageKey, JSON.stringify({ skin: "refined" }));
          localStorage.setItem(modeStorageKey, themeMode);
        },
        { editorStorageKey: THEME_EDITOR_STORAGE_KEY, modeStorageKey: THEME_STORAGE_KEY, themeMode: mode },
      );
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce", colorScheme: mode });
      await page.goto("/get-started");
      await expect(page.locator("html")).toHaveAttribute("data-skin", "refined");
      await expect(page.locator("html")).toHaveCSS("color-scheme", mode);
      if (width < 768) {
        const sidebarTrigger = page.getByRole("button", { name: "Toggle sidebar", exact: true });
        await waitForReactHydration(sidebarTrigger);
        await sidebarTrigger.press("Enter");
      }
      const navigation = page.locator("[data-docs-sidebar-navigation]:visible");
      const trigger = navigation.getByRole("button", { name: "Getting started", exact: true });
      await waitForReactHydration(trigger);
      const card = navigation.locator('[data-control-family="card"][data-slot="root"]');
      await expect(card).toBeVisible();
      const bounds = await card.boundingBox();
      if (!bounds) throw new Error("Getting started card is not rendered");
      await page.screenshot({
        path: testInfo.outputPath("getting-started.png"),
        clip: {
          x: 0,
          y: Math.max(0, bounds.y - 35),
          width: Math.ceil(bounds.x + bounds.width + 8),
          height: Math.ceil(bounds.height + 59),
        },
      });
      await card.evaluate((element) => element.style.setProperty("--cui-card-shadow", "0 0 0 4px var(--foreground)"));
      const bottomRim = { x: bounds.x + 16, y: bounds.y + bounds.height, width: bounds.width - 32, height: 4 };
      const paintedRim = await page.screenshot({ clip: bottomRim });
      await card.evaluate((element) => element.style.setProperty("--cui-card-shadow", "none"));
      const withoutRim = await page.screenshot({ clip: bottomRim });
      expect(await meanScreenshotDifference(page, [paintedRim, withoutRim])).toBeGreaterThan(10);
      await card.evaluate((element) => element.style.removeProperty("--cui-card-shadow"));

      await trigger.press("Enter");
      await expect(card).toBeHidden();
      await trigger.press("Space");
      await expect(card).toBeVisible();
      await expect(card.locator("..").locator("..")).toHaveCSS("overflow", "visible");
    });
  }
}

const foldingExamples = [
  { primitive: "collapsible", family: "collapsible", slot: "content", trigger: "Reasoning steps", duration: "--duration-slow" },
  { primitive: "accordion", family: "accordion", slot: "panel", trigger: "What is Control UI?", duration: "--duration-base" },
  { primitive: "tree", family: "tree", slot: "item-content", trigger: "src", duration: "--duration-base" },
];

for (const example of foldingExamples) {
  test(`${example.primitive} clips during folding and releases the open content`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/primitives/${example.primitive}`);
    const preview = page.locator("main");
    const trigger = preview.getByText(example.trigger, { exact: true });
    await waitForReactHydration(trigger);
    const panel = preview.locator(`[data-control-family="${example.family}"][data-slot="${example.slot}"]`).first();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("overflow", "visible");
    const expandedHeight = await panel.evaluate((element) => element.getBoundingClientRect().height);
    await preview.evaluate((element, durationToken) => element.style.setProperty(durationToken, "2s"), example.duration);

    await trigger.click();
    const closing = await sampleFoldingMotion(panel);
    expect(closing.height).toBeGreaterThan(0);
    expect(closing.height).toBeLessThan(expandedHeight);
    expect(closing.overflow).toBe("clip");
    await expect(panel).toBeHidden();

    await trigger.click();
    const opening = await sampleFoldingMotion(panel);
    expect(opening.height).toBeGreaterThan(0);
    expect(opening.height).toBeLessThan(expandedHeight);
    expect(opening.overflow).toBe("clip");
    await expect(panel).toHaveCSS("overflow", "visible");
    await expect(panel).toHaveCSS("height", `${expandedHeight}px`);
  });
}
